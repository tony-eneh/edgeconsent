"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Badge,
  Button,
  Select,
  Input,
  useToast,
  ToastContainer,
} from "@/components/ui";
import {
  getConsentRules,
  createConsentRule,
  revokeConsentRule,
  type ConsentRule,
  ROLES,
  DATA_CATEGORIES,
  PURPOSES,
  ACTIONS,
} from "@/lib/api";
import { useWallet } from "@/lib/wallet";
import { ShieldCheck, ShieldOff, Plus, Trash2 } from "lucide-react";

export default function ConsentPage() {
  const { address, signerKey } = useWallet();
  const [rules, setRules] = useState<ConsentRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [revokeLoading, setRevokeLoading] = useState<number | null>(null);
  const { toasts, addToast } = useToast();

  // Form state
  const [role, setRole] = useState<string>("PROVIDER");
  const [category, setCategory] = useState<string>("MEDICAL");
  const [purpose, setPurpose] = useState<string>("TREATMENT");
  const [action, setAction] = useState<string>("READ");
  const [maxSensitivity, setMaxSensitivity] = useState("4");
  const [isAllow, setIsAllow] = useState(true);

  const fetchRules = async (addr: string) => {
    try {
      const data = await getConsentRules(addr);
      setRules(data.rules);
    } catch {
      setRules([]);
    }
  };

  useEffect(() => {
    if (address) fetchRules(address);
  }, [address]);

  const handleCreate = async () => {
    if (!signerKey) {
      addToast("error", "No signer key — use a Hardhat demo account in MetaMask.");
      return;
    }
    setLoading(true);
    try {
      const res = await createConsentRule({
        signerKey,
        allowedRole: role,
        allowedOrgId: 0,
        allowedJurisdictionId: 0,
        allowedCategory: category,
        maxSensitivityLevel: parseInt(maxSensitivity),
        allowedPurpose: purpose,
        allowedAction: action,
        notBefore: 0,
        notAfter: 0,
        isAllow,
      });
      addToast("success", `${isAllow ? "ALLOW" : "DENY"} rule created (gas: ${res.gasUsed})`);
      if (address) fetchRules(address);
    } catch (e: any) {
      addToast("error", e.message);
    }
    setLoading(false);
  };

  const handleRevoke = async (ruleId: number) => {
    if (!signerKey) {
      addToast("error", "No signer key available.");
      return;
    }
    setRevokeLoading(ruleId);
    try {
      const res = await revokeConsentRule({ signerKey, ruleId });
      addToast("success", `Rule #${ruleId} revoked (gas: ${res.gasUsed})`);
      if (address) fetchRules(address);
    } catch (e: any) {
      addToast("error", e.message);
    }
    setRevokeLoading(null);
  };

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Consent Rules</h1>
      <p className="text-muted text-sm mb-6">
        Create fine-grained ABAC consent policies for your data
      </p>

      {/* Create consent rule */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-5 h-5 text-muted" />
          <h2 className="text-lg font-semibold">Create Consent Rule</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          <Select label="Allowed Role" value={role} onChange={setRole} options={ROLES} />
          <Select label="Category" value={category} onChange={setCategory} options={DATA_CATEGORIES} />
          <Select label="Purpose" value={purpose} onChange={setPurpose} options={PURPOSES} />
          <Select label="Action" value={action} onChange={setAction} options={ACTIONS} />
          <Input
            label="Max Sensitivity (0–4)"
            value={maxSensitivity}
            onChange={setMaxSensitivity}
            type="number"
          />
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Rule Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setIsAllow(true)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-1.5 ${
                  isAllow
                    ? "bg-success-light text-success border-success/30"
                    : "bg-card text-muted border-border hover:border-success/30"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> ALLOW
              </button>
              <button
                onClick={() => setIsAllow(false)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-1.5 ${
                  !isAllow
                    ? "bg-danger-light text-danger border-danger/30"
                    : "bg-card text-muted border-border hover:border-danger/30"
                }`}
              >
                <ShieldOff className="w-3.5 h-3.5" /> DENY
              </button>
            </div>
          </div>
        </div>
        <Button onClick={handleCreate} loading={loading}>
          Create Rule
        </Button>
      </Card>

      {/* Rules list */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-muted" />
          <h2 className="text-lg font-semibold">
            Active Rules ({rules.filter((r) => r.isActive).length} of {rules.length})
          </h2>
        </div>
        {rules.length === 0 ? (
          <p className="text-sm text-muted">No consent rules yet.</p>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.ruleId}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  !rule.isActive
                    ? "bg-gray-50 border-gray-200 opacity-60"
                    : rule.isAllow
                    ? "bg-success-light/30 border-success/20"
                    : "bg-danger-light/30 border-danger/20"
                }`}
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <Badge variant={rule.isAllow ? "success" : "danger"}>
                    {rule.isAllow ? "ALLOW" : "DENY"}
                  </Badge>
                  <span className="text-xs font-mono text-muted">#{rule.ruleId}</span>
                  <span className="text-sm">
                    <strong>{rule.allowedRole}</strong> can{" "}
                    <strong>{rule.allowedAction}</strong>{" "}
                    <strong>{rule.allowedCategory}</strong> data for{" "}
                    <strong>{rule.allowedPurpose}</strong>
                  </span>
                  <span className="text-xs text-muted">
                    sensitivity ≤ {rule.maxSensitivityLevel}
                  </span>
                  {!rule.isActive && <Badge variant="muted">Revoked</Badge>}
                </div>
                {rule.isActive && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRevoke(rule.ruleId)}
                    loading={revokeLoading === rule.ruleId}
                  >
                    <Trash2 className="w-3 h-3" />
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
