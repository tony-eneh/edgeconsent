"use client";

import { useEffect, useState } from "react";
import {
  Card,
  StatCard,
  Badge,
  Button,
  useToast,
  ToastContainer,
} from "@/components/ui";
import {
  getAuditStats,
  getCapabilities,
  validateCapability,
  type AuditStats,
  type CapabilityInfo,
} from "@/lib/api";
import {
  BarChart3,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  KeyRound,
} from "lucide-react";

export default function AuditPage() {
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [capabilities, setCapabilities] = useState<CapabilityInfo[]>([]);
  const [validating, setValidating] = useState<string | null>(null);
  const { toasts, addToast } = useToast();

  const fetchData = async () => {
    try {
      const [s, c] = await Promise.all([getAuditStats(), getCapabilities()]);
      setStats(s);
      setCapabilities(c.capabilities);
    } catch {
      addToast("error", "Failed to load audit data");
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleValidate = async (tokenValue: string) => {
    setValidating(tokenValue);
    try {
      const res = await validateCapability(tokenValue);
      if (res.valid) {
        addToast("success", "Token is valid");
      } else {
        addToast("error", `Token invalid: ${res.reason || "expired or revoked"}`);
      }
    } catch (e: any) {
      addToast("error", e.message);
    }
    setValidating(null);
  };

  const denyRate =
    stats && stats.totalChecks > 0
      ? ((stats.deniedChecks / stats.totalChecks) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Audit Trail</h1>
      <p className="text-muted text-sm mb-6">
        On-chain consent check statistics and active capability tokens
      </p>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Checks" value={stats.totalChecks} color="primary" />
          <StatCard label="Allowed" value={stats.allowedChecks} color="success" />
          <StatCard label="Denied" value={stats.deniedChecks} color="danger" />
          <StatCard label="Deny Rate" value={`${denyRate}%`} color="warning" />
        </div>
      )}

      {/* Capability tokens */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-muted" />
            <h2 className="text-lg font-semibold">
              Active Capability Tokens ({capabilities.length})
            </h2>
          </div>
          <Button size="sm" variant="ghost" onClick={fetchData}>
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>

        {capabilities.length === 0 ? (
          <p className="text-sm text-muted">
            No active capability tokens. Request access from the Processor
            dashboard to generate tokens.
          </p>
        ) : (
          <div className="space-y-3">
            {capabilities.map((cap) => {
              const expiresAt = new Date(cap.expiresAt);
              const isExpired = expiresAt < new Date();
              return (
                <div
                  key={cap.token}
                  className={`p-4 rounded-lg border ${
                    isExpired
                      ? "bg-gray-50 border-gray-200 opacity-60"
                      : "bg-card border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={isExpired ? "muted" : "success"}>
                        {isExpired ? "Expired" : "Active"}
                      </Badge>
                      <span className="text-xs font-mono text-muted">
                        {cap.token.slice(0, 8)}...
                      </span>
                    </div>
                    {!isExpired && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleValidate(cap.token)}
                        loading={validating === cap.token}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Validate
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-muted">Requester: </span>
                      <span className="font-mono">
                        {cap.requester.slice(0, 8)}...{cap.requester.slice(-4)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted">Resource: </span>
                      <span>#{cap.resourceId}</span>
                    </div>
                    <div>
                      <span className="text-muted">Purpose: </span>
                      <span>{cap.purpose}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted" />
                      <span>{expiresAt.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
