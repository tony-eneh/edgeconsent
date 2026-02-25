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
  getResourcesByOwner,
  registerResource,
  type ResourceInfo,
  DATA_CATEGORIES,
} from "@/lib/api";
import { useWallet } from "@/lib/wallet";
import { FolderOpen, Plus } from "lucide-react";

export default function ResourcesPage() {
  const { address } = useWallet();
  const [resources, setResources] = useState<ResourceInfo[]>([]);
  const [category, setCategory] = useState<string>("MEDICAL");
  const [sensitivity, setSensitivity] = useState("3");
  const [loading, setLoading] = useState(false);
  const { toasts, addToast } = useToast();

  const fetchResources = async (addr: string) => {
    try {
      const data = await getResourcesByOwner(addr);
      setResources(data.resources);
    } catch {
      setResources([]);
    }
  };

  useEffect(() => {
    if (address) fetchResources(address);
  }, [address]);

  const handleRegister = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const res = await registerResource({
        owner: address,
        category,
        sensitivityLevel: parseInt(sensitivity),
      });
      addToast("success", `Resource #${res.resourceId} registered (gas: ${res.gasUsed})`);
      fetchResources(address);
    } catch (e: any) {
      addToast("error", e.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Data Resources</h1>
      <p className="text-muted text-sm mb-6">
        Register and manage your health data records on-chain
      </p>

      {/* Register new resource */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-5 h-5 text-muted" />
          <h2 className="text-lg font-semibold">Register New Resource</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Category"
            value={category}
            onChange={setCategory}
            options={DATA_CATEGORIES}
          />
          <Input
            label="Sensitivity Level (0–4)"
            value={sensitivity}
            onChange={setSensitivity}
            type="number"
            placeholder="0-4"
          />
          <div className="flex items-end">
            <Button onClick={handleRegister} loading={loading}>
              Register Resource
            </Button>
          </div>
        </div>
      </Card>

      {/* Resource list */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen className="w-5 h-5 text-muted" />
          <h2 className="text-lg font-semibold">
            Your Resources ({resources.length})
          </h2>
        </div>
        {resources.length === 0 ? (
          <p className="text-sm text-muted">No resources registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 font-medium text-muted">ID</th>
                  <th className="pb-2 font-medium text-muted">Category</th>
                  <th className="pb-2 font-medium text-muted">Sensitivity</th>
                  <th className="pb-2 font-medium text-muted">Status</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((r) => (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="py-3 font-mono">#{r.id}</td>
                    <td className="py-3">
                      <Badge>{r.category}</Badge>
                    </td>
                    <td className="py-3">
                      <span className="text-xs">
                        {"●".repeat(r.sensitivityLevel + 1)}
                        {"○".repeat(4 - r.sensitivityLevel)}
                      </span>
                      <span className="ml-1 text-muted text-xs">
                        ({r.sensitivityLevel}/4)
                      </span>
                    </td>
                    <td className="py-3">
                      <Badge variant={r.isActive ? "success" : "danger"}>
                        {r.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
