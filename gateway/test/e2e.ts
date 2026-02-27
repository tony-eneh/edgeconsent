/**
 * EdgeConsent PEG Gateway — End-to-End Integration Test
 *
 * Prerequisites:
 *   1. Hardhat node running (npx hardhat node)
 *   2. Contracts deployed (npx hardhat run scripts/deploy.ts --network localhost)
 *   3. Gateway running (npx ts-node src/index.ts)
 */

const BASE = "http://localhost:4000";

async function post(path: string, body: any): Promise<any> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<any>;
}

async function get(path: string): Promise<any> {
  const res = await fetch(`${BASE}${path}`);
  return res.json() as Promise<any>;
}

async function run(): Promise<void> {
  console.log("\n=== EdgeConsent PEG Gateway E2E Test ===\n");

  // Hardhat well-known private keys (local dev only!)
  const PATIENT_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"; // #1
  const DOCTOR_KEY  = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"; // #2

  // 1. Health check
  console.log("1. Health check");
  const health = await get("/health");
  console.log("   Status:", health.status);
  console.log("   Contracts configured:", Object.keys(health.contracts).length);

  // 2. Register a patient (data subject) — admin registers on behalf
  console.log("\n2. Register subjects");
  const patient = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Hardhat #1
  const doctor  = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"; // Hardhat #2

  const regPatient = await post("/api/subjects/register", {
    address: patient,
    role: "DATA_SUBJECT",
    orgId: 1,
    jurisdictionId: 1,
  });
  console.log("   Patient:", regPatient.message, `(gas: ${regPatient.gasUsed})`);

  const regDoctor = await post("/api/subjects/register", {
    address: doctor,
    role: "PROVIDER",
    orgId: 1,
    jurisdictionId: 1,
  });
  console.log("   Doctor:", regDoctor.message, `(gas: ${regDoctor.gasUsed})`);

  // 3. Verify subjects
  console.log("\n3. Verify subjects");
  const patientInfo = await get(`/api/subjects/${patient}`);
  console.log("   Patient role:", patientInfo.role, "active:", patientInfo.isActive);
  const doctorInfo = await get(`/api/subjects/${doctor}`);
  console.log("   Doctor role:", doctorInfo.role, "active:", doctorInfo.isActive);

  // 4. Register a data resource (patient's medical record)
  console.log("\n4. Register data resource");
  const regResource = await post("/api/resources/register", {
    owner: patient,
    category: "MEDICAL",
    sensitivityLevel: 3,
  });
  console.log("   Resource ID:", regResource.resourceId, `(gas: ${regResource.gasUsed})`);

  // 5. Check access BEFORE consent — should be DENIED
  console.log("\n5. Check access BEFORE consent");
  const preCheck = await post("/api/consent/check", {
    requester: doctor,
    resourceId: 1,
    purpose: "TREATMENT",
    action: "READ",
  });
  console.log("   Allowed:", preCheck.allowed);
  console.log("   Reason:", preCheck.reason);
  console.log("   Latency:", preCheck.latencyMs, "ms");

  // 6. Patient creates consent rule (signed by patient's key)
  console.log("\n6. Create consent rule (ALLOW)");
  const createRule = await post("/api/consent/rules", {
    signerKey: PATIENT_KEY,
    allowedRole: "PROVIDER",
    allowedOrgId: 0,
    allowedJurisdictionId: 0,
    allowedCategory: "MEDICAL",
    maxSensitivityLevel: 4,
    allowedPurpose: "TREATMENT",
    allowedAction: "READ",
    notBefore: 0,
    notAfter: 0,
    isAllow: true,
  });
  console.log("   Result:", createRule.message, `(gas: ${createRule.gasUsed})`);

  // 7. Check access AFTER consent — should be ALLOWED
  console.log("\n7. Check access AFTER consent");
  const postCheck = await post("/api/consent/check", {
    requester: doctor,
    resourceId: 1,
    purpose: "TREATMENT",
    action: "READ",
  });
  console.log("   Allowed:", postCheck.allowed);
  console.log("   Reason:", postCheck.reason);
  console.log("   Latency:", postCheck.latencyMs, "ms");
  if (postCheck.capability) {
    console.log("   Capability Token:", postCheck.capability.token);
    console.log("   Token Expires:", postCheck.capability.expiresAt);
  }

  // 8. Validate the capability token
  console.log("\n8. Validate capability token");
  if (postCheck.capability) {
    const validation = await post("/api/audit/validate", {
      token: postCheck.capability.token,
    });
    console.log("   Valid:", validation.valid);
  }

  // 9. Check access for RESEARCH purpose — should be DENIED
  console.log("\n9. Check access for unauthorized purpose");
  const researchCheck = await post("/api/consent/check", {
    requester: doctor,
    resourceId: 1,
    purpose: "RESEARCH",
    action: "READ",
  });
  console.log("   Allowed:", researchCheck.allowed, "(expected: false)");

  // 10. List consent rules
  console.log("\n10. List consent rules for patient");
  const rules = await get(`/api/consent/rules/${patient}`);
  console.log("    Total rules:", rules.rules.length);
  console.log("    Rule[0]:", JSON.stringify(rules.rules[0], null, 2));

  // 11. Audit stats
  console.log("\n11. Audit statistics");
  const stats = await get("/api/audit/stats");
  console.log("    Total checks:", stats.totalChecks);
  console.log("    Allowed:", stats.allowedChecks);
  console.log("    Denied:", stats.deniedChecks);
  console.log("    Deny rate:", stats.denyRate);

  // 12. List active capabilities
  console.log("\n12. Active capability tokens");
  const caps = await get("/api/audit/capabilities");
  console.log("    Active tokens:", caps.count);

  // 13. Revoke consent rule and verify (patient revokes their own rule)
  console.log("\n13. Revoke consent and re-check");
  const revoke = await post("/api/consent/revoke", {
    signerKey: PATIENT_KEY,
    ruleId: 1,
  });
  console.log("    Revoked:", revoke.message, `(gas: ${revoke.gasUsed})`);

  const afterRevoke = await post("/api/consent/check", {
    requester: doctor,
    resourceId: 1,
    purpose: "TREATMENT",
    action: "READ",
  });
  console.log("    Access after revoke:", afterRevoke.allowed, "(expected: false)");

  console.log("\n=== All E2E tests passed! ===\n");
}

run().catch(console.error);
