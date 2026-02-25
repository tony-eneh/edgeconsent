// ─── Enums matching Types.sol ───────────────────────────────

export enum Role {
  NONE = 0,
  DATA_SUBJECT = 1,
  PROVIDER = 2,
  RESEARCHER = 3,
  INSURER = 4,
  REGULATOR = 5,
  PROCESSOR = 6,
  EMERGENCY = 7,
}

export enum DataCategory {
  NONE = 0,
  DEMOGRAPHIC = 1,
  MEDICAL = 2,
  GENOMIC = 3,
  BEHAVIORAL = 4,
  FINANCIAL = 5,
  BIOMETRIC = 6,
  LOCATION = 7,
}

export enum Purpose {
  NONE = 0,
  TREATMENT = 1,
  RESEARCH = 2,
  BILLING = 3,
  INSURANCE = 4,
  MARKETING = 5,
  AUDIT = 6,
  EMERGENCY = 7,
}

export enum Action {
  NONE = 0,
  READ = 1,
  EXPORT = 2,
  AGGREGATE = 3,
  SHARE = 4,
  DELETE = 5,
}

// ─── Request/Response types ─────────────────────────────────

export interface ConsentCheckRequest {
  /** Requester's Ethereum address */
  requester: string;
  /** Data resource ID */
  resourceId: number;
  /** Purpose string key (e.g. "TREATMENT", "RESEARCH") */
  purpose: keyof typeof Purpose;
  /** Action string key (e.g. "READ", "EXPORT") */
  action: keyof typeof Action;
}

export interface ConsentRuleRequest {
  /** Optional: private key to sign the tx (data subject must be msg.sender) */
  signerKey?: string;
  /** Data subject's Ethereum address (for reference only, msg.sender is used) */
  consentGiver?: string;
  allowedRole: keyof typeof Role;
  allowedOrgId: number;
  allowedJurisdictionId: number;
  allowedCategory: keyof typeof DataCategory;
  maxSensitivityLevel: number;
  allowedPurpose: keyof typeof Purpose;
  allowedAction: keyof typeof Action;
  notBefore: number;
  notAfter: number;
  isAllow: boolean;
}

export interface Capability {
  token: string;
  requester: string;
  resourceId: number;
  purpose: Purpose;
  action: Action;
  expiresAt: Date;
}

export interface ConsentCheckResponse {
  allowed: boolean;
  reason: string;
  capability?: {
    token: string;
    expiresAt: string;
    resourceId: number;
  };
  gasUsed?: string;
  latencyMs: number;
}
