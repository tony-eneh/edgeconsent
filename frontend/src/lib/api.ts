const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json() as Promise<T>;
}

// ─── Health ─────────────────────────────────────────────────

export interface HealthResponse {
  status: string;
  mode: string;
  contracts: Record<string, string>;
}

export function getHealth() {
  return request<HealthResponse>("/health");
}

// ─── Subjects ───────────────────────────────────────────────

export interface SubjectInfo {
  address: string;
  role: string;
  orgId: number;
  jurisdictionId: number;
  isActive: boolean;
}

export interface TxResult {
  txHash: string;
  gasUsed: string;
  message: string;
}

export function getSubject(address: string) {
  return request<SubjectInfo>(`/api/subjects/${address}`);
}

export function registerSubject(data: {
  address: string;
  role: string;
  orgId?: number;
  jurisdictionId?: number;
  selfRegister?: boolean;
}) {
  return request<TxResult>("/api/subjects/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── Resources ──────────────────────────────────────────────

export interface ResourceInfo {
  id: number;
  owner: string;
  category: string;
  sensitivityLevel: number;
  isActive: boolean;
}

export function getResource(id: number) {
  return request<ResourceInfo>(`/api/resources/${id}`);
}

export function getResourcesByOwner(address: string) {
  return request<{ owner: string; resources: ResourceInfo[] }>(
    `/api/resources/owner/${address}`
  );
}

export function registerResource(data: {
  owner: string;
  category: string;
  sensitivityLevel: number;
}) {
  return request<TxResult & { resourceId?: string }>("/api/resources/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── Consent ────────────────────────────────────────────────

export interface ConsentRule {
  ruleId: number;
  consentGiver: string;
  allowedRole: string;
  allowedOrgId: number;
  allowedJurisdictionId: number;
  allowedCategory: string;
  maxSensitivityLevel: number;
  allowedPurpose: string;
  allowedAction: string;
  notBefore: number;
  notAfter: number;
  isAllow: boolean;
  isActive: boolean;
}

export function getConsentRules(address: string) {
  return request<{ address: string; rules: ConsentRule[] }>(
    `/api/consent/rules/${address}`
  );
}

export function createConsentRule(data: {
  signerKey: string;
  allowedRole: string;
  allowedOrgId: number;
  allowedJurisdictionId: number;
  allowedCategory: string;
  maxSensitivityLevel: number;
  allowedPurpose: string;
  allowedAction: string;
  notBefore: number;
  notAfter: number;
  isAllow: boolean;
}) {
  return request<TxResult>("/api/consent/rules", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function revokeConsentRule(data: { signerKey: string; ruleId: number }) {
  return request<TxResult>("/api/consent/revoke", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface ConsentCheckResult {
  allowed: boolean;
  reason: string;
  capability?: {
    token: string;
    expiresAt: string;
    resourceId: number;
  };
  latencyMs: number;
}

export function checkConsent(data: {
  requester: string;
  resourceId: number;
  purpose: string;
  action: string;
}) {
  return request<ConsentCheckResult>("/api/consent/check", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── Audit ──────────────────────────────────────────────────

export interface AuditStats {
  totalChecks: number;
  allowedChecks: number;
  deniedChecks: number;
  denyRate: string;
}

export function getAuditStats() {
  return request<AuditStats>("/api/audit/stats");
}

export interface CapabilityInfo {
  token: string;
  requester: string;
  resourceId: number;
  purpose: number;
  action: number;
  expiresAt: string;
}

export function getCapabilities() {
  return request<{ count: number; capabilities: CapabilityInfo[] }>(
    "/api/audit/capabilities"
  );
}

export function validateCapability(token: string) {
  return request<{ valid: boolean; reason?: string; capability?: CapabilityInfo }>(
    "/api/audit/validate",
    { method: "POST", body: JSON.stringify({ token }) }
  );
}

// ─── Enum options ───────────────────────────────────────────

export const ROLES = [
  "DATA_SUBJECT",
  "PROVIDER",
  "RESEARCHER",
  "INSURER",
  "REGULATOR",
  "PROCESSOR",
  "EMERGENCY",
] as const;

export const DATA_CATEGORIES = [
  "DEMOGRAPHIC",
  "MEDICAL",
  "GENOMIC",
  "BEHAVIORAL",
  "FINANCIAL",
  "BIOMETRIC",
  "LOCATION",
] as const;

export const PURPOSES = [
  "TREATMENT",
  "RESEARCH",
  "BILLING",
  "INSURANCE",
  "MARKETING",
  "AUDIT",
  "EMERGENCY",
] as const;

export const ACTIONS = ["READ", "EXPORT", "AGGREGATE", "SHARE", "DELETE"] as const;

// ─── Hardhat demo accounts ──────────────────────────────────

export const DEMO_ACCOUNTS = [
  {
    label: "Admin (Deployer)",
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    key: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  },
  {
    label: "Patient (Alice)",
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    key: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  },
  {
    label: "Doctor (Bob)",
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    key: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
  },
  {
    label: "Researcher (Carol)",
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    key: "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
  },
  {
    label: "Insurer (Dave)",
    address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    key: "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a",
  },
] as const;
