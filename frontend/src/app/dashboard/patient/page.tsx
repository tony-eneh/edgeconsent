"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  Badge,
  Button,
  useToast,
  ToastContainer,
} from "@/components/ui";
import {
  getSubject,
  registerSubject,
  type SubjectInfo,
} from "@/lib/api";
import { useWallet } from "@/lib/wallet";
import { UserCircle, FolderOpen, ShieldCheck } from "lucide-react";

export default function PatientPage() {
  const { address, signerKey } = useWallet();
  const [subject, setSubject] = useState<SubjectInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const { toasts, addToast } = useToast();

  const fetchSubject = async (addr: string) => {
    try {
      const s = await getSubject(addr);
      setSubject(s);
    } catch {
      setSubject(null);
    }
  };

  useEffect(() => {
    if (address) fetchSubject(address);
  }, [address]);

  const handleRegister = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const res = await registerSubject({
        address,
        role: "DATA_SUBJECT",
        orgId: 1,
        jurisdictionId: 1,
      });
      addToast("success", `Registered! Gas: ${res.gasUsed}`);
      fetchSubject(address);
    } catch (e: any) {
      addToast("error", e.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Patient Dashboard</h1>
      <p className="text-muted text-sm mb-6">
        Manage your identity, data resources, and consent rules
      </p>

      {/* Identity card */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-muted" />
            <h2 className="text-lg font-semibold">Identity</h2>
          </div>
          {subject?.role === "NONE" || !subject?.isActive ? (
            <Button onClick={handleRegister} loading={loading} size="sm">
              Register as Patient
            </Button>
          ) : (
            <Badge variant="success">Active</Badge>
          )}
        </div>

        {subject ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted">Address</p>
              <p className="text-sm font-mono">{subject.address}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Role</p>
              <p className="text-sm font-medium">{subject.role}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Organization ID</p>
              <p className="text-sm">{subject.orgId}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Jurisdiction ID</p>
              <p className="text-sm">{subject.jurisdictionId}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">
            No identity found. Register to get started.
          </p>
        )}
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Link href="/dashboard/patient/resources">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-2 font-medium">
              <FolderOpen className="w-4 h-4 text-primary" />
              Data Resources
            </div>
            <p className="text-xs text-muted mt-1">
              Register and manage your data records
            </p>
          </Card>
        </Link>
        <Link href="/dashboard/patient/consent">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-success" />
              Consent Rules
            </div>
            <p className="text-xs text-muted mt-1">
              Create fine-grained access policies
            </p>
          </Card>
        </Link>
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
