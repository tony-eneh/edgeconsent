"use client";

import { useState } from "react";
import {
  Card,
  Button,
  Select,
  Input,
  useToast,
  ToastContainer,
} from "@/components/ui";
import { checkConsent, type ConsentCheckResult, PURPOSES, ACTIONS } from "@/lib/api";
import { useWallet } from "@/lib/wallet";
import { CheckCircle2, XCircle, KeyRound, Clock, Send } from "lucide-react";

export default function AccessPage() {
  const { address } = useWallet();
  const [resourceId, setResourceId] = useState("1");
  const [purpose, setPurpose] = useState<string>("TREATMENT");
  const [action, setAction] = useState<string>("READ");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConsentCheckResult | null>(null);
  const { toasts, addToast } = useToast();

  const handleCheck = async () => {
    if (!address) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await checkConsent({
        requester: address,
        resourceId: parseInt(resourceId),
        purpose,
        action,
      });
      setResult(res);
      if (res.allowed) {
        addToast("success", "Access ALLOWED — capability token issued");
      } else {
        addToast("error", "Access DENIED");
      }
    } catch (e: any) {
      addToast("error", e.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Request Access</h1>
      <p className="text-muted text-sm mb-6">
        Submit a consent check to access a patient&apos;s data resource
      </p>

      {/* Access request form */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Send className="w-5 h-5 text-muted" />
          <h2 className="text-lg font-semibold">Access Request</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <Input
            label="Resource ID"
            value={resourceId}
            onChange={setResourceId}
            type="number"
            placeholder="e.g. 1"
          />
          <Select label="Purpose" value={purpose} onChange={setPurpose} options={PURPOSES} />
          <Select label="Action" value={action} onChange={setAction} options={ACTIONS} />
          <div className="flex items-end">
            <Button onClick={handleCheck} loading={loading}>
              Check Access
            </Button>
          </div>
        </div>
      </Card>

      {/* Result */}
      {result && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">Result</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {result.allowed ? (
                <CheckCircle2 className="w-8 h-8 text-success" />
              ) : (
                <XCircle className="w-8 h-8 text-danger" />
              )}
              <div>
                <p className="text-lg font-bold">
                  Access {result.allowed ? "ALLOWED" : "DENIED"}
                </p>
                {result.latencyMs != null && (
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <Clock className="w-3 h-3" />
                    {result.latencyMs}ms
                  </div>
                )}
              </div>
            </div>

            {result.capability && (
              <div className="bg-success-light/30 border border-success/20 rounded-lg p-4">
                <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
                  <KeyRound className="w-3 h-3" />
                  Capability Token
                </div>
                <p className="text-sm font-mono break-all">{result.capability.token}</p>
                <p className="text-xs text-muted mt-2">
                  Present this token to demonstrate authorized access (valid for
                  5 minutes)
                </p>
              </div>
            )}

            {!result.allowed && (
              <div className="bg-danger-light/30 border border-danger/20 rounded-lg p-4">
                <p className="text-sm">{result.reason}</p>
                <p className="text-xs text-muted mt-2">
                  Ask the data subject to create a matching consent rule.
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}
