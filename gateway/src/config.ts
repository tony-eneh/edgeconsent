import dotenv from "dotenv";
dotenv.config();

export const config = {
  mode: process.env.MODE || "consentchain",
  rpcUrl: process.env.RPC_URL || "http://127.0.0.1:8545",
  gatewayPrivateKey: process.env.GATEWAY_PRIVATE_KEY || "",
  contracts: {
    subjectRegistry: process.env.SUBJECT_REGISTRY_ADDRESS || "",
    dataRegistry: process.env.DATA_REGISTRY_ADDRESS || "",
    consentManager: process.env.CONSENT_MANAGER_ADDRESS || "",
    auditLog: process.env.AUDIT_LOG_ADDRESS || "",
  },
  capabilityTtlSeconds: parseInt(process.env.CAPABILITY_TTL_SECONDS || "300", 10),
  port: parseInt(process.env.GATEWAY_PORT || "4000", 10),
};
