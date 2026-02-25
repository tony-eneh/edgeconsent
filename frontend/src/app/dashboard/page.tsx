"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, StatCard } from "@/components/ui";
import {
  getHealth,
  getAuditStats,
  type AuditStats,
  type HealthResponse,
} from "@/lib/api";
import { useWallet } from "@/lib/wallet";
import {
  AlertTriangle,
  ShieldCheck,
  KeyRound,
  BarChart3,
  Server,
  Wifi,
} from "lucide-react";

export default function DashboardOverview() {
  const { address, label } = useWallet();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getHealth(), getAuditStats()])
      .then(([h, s]) => {
        setHealth(h);
        setStats(s);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-muted text-sm mb-8">
        Welcome, <span className="font-mono text-xs">{label || address}</span>
      </p>

      {error && (
        <Card className="mb-6 border-danger/30 bg-danger-light">
          <div className="flex items-center gap-2 text-danger text-sm">
            <AlertTriangle className="w-4 h-4" />
            Cannot connect to gateway: {error}
          </div>
          <p className="text-xs text-muted mt-1">
            Make sure Hardhat node and PEG Gateway are running.
          </p>
        </Card>
      )}

      {/* Stats grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Checks" value={stats.totalChecks} color="primary" />
          <StatCard label="Allowed" value={stats.allowedChecks} color="success" />
          <StatCard label="Denied" value={stats.deniedChecks} color="danger" />
          <StatCard label="Deny Rate" value={stats.denyRate} color="warning" />
        </div>
      )}

      {/* System info */}
      {health && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-muted" />
            <h2 className="text-lg font-semibold">System Status</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted">Gateway Status</p>
              <div className="flex items-center gap-1.5 text-sm font-medium text-success">
                <Wifi className="w-3 h-3" /> Online
              </div>
            </div>
            <div>
              <p className="text-xs text-muted">Mode</p>
              <p className="text-sm font-medium">{health.mode}</p>
            </div>
            {Object.entries(health.contracts).map(([name, addr]) => (
              <div key={name}>
                <p className="text-xs text-muted">{name}</p>
                <p className="text-xs font-mono text-foreground/70">{addr}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <Link href="/dashboard/patient/consent">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-2 text-lg mb-1">
              <ShieldCheck className="w-5 h-5 text-success" />
              <span className="font-medium">Manage Consent</span>
            </div>
            <p className="text-xs text-muted">Create & revoke consent rules</p>
          </Card>
        </Link>
        <Link href="/dashboard/processor/access">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-2 text-lg mb-1">
              <KeyRound className="w-5 h-5 text-primary" />
              <span className="font-medium">Request Access</span>
            </div>
            <p className="text-xs text-muted">Check consent & get capability tokens</p>
          </Card>
        </Link>
        <Link href="/dashboard/audit">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-2 text-lg mb-1">
              <BarChart3 className="w-5 h-5 text-warning" />
              <span className="font-medium">Audit Trail</span>
            </div>
            <p className="text-xs text-muted">View on-chain statistics</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
