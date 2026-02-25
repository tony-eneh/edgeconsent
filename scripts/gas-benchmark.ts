import { ethers } from "hardhat";

// ─── Enums matching Types.sol ───────────────────────────────
const Role = { NONE: 0, DATA_SUBJECT: 1, PROVIDER: 2, RESEARCHER: 3, INSURER: 4, REGULATOR: 5, PROCESSOR: 6, EMERGENCY: 7 };
const DataCategory = { NONE: 0, DEMOGRAPHIC: 1, MEDICAL: 2, GENOMIC: 3, BEHAVIORAL: 4, FINANCIAL: 5, BIOMETRIC: 6, LOCATION: 7 };
const Purpose = { NONE: 0, TREATMENT: 1, RESEARCH: 2, BILLING: 3, INSURANCE: 4, MARKETING: 5, AUDIT: 6, EMERGENCY: 7 };
const Action = { NONE: 0, READ: 1, EXPORT: 2, AGGREGATE: 3, SHARE: 4, DELETE: 5 };

interface GasResult {
  operation: string;
  gasUsed: bigint;
  usdEstimate: string;
}

async function measureGas(label: string, txPromise: Promise<any>): Promise<GasResult> {
  const tx = await txPromise;
  const receipt = await tx.wait();
  const gasUsed = receipt!.gasUsed;
  // Estimate USD: 30 gwei gas price, ETH = $2,500
  const costWei = gasUsed * 30n * 1_000_000_000n; // gas * 30 gwei in wei
  const costEth = Number(costWei) / 1e18;
  const costUsd = costEth * 2500;
  const result: GasResult = { operation: label, gasUsed, usdEstimate: costUsd.toFixed(4) };
  console.log(`  ${label}: ${gasUsed.toLocaleString()} gas ($${result.usdEstimate})`);
  return result;
}

async function main() {
  const [admin, patient, hospital, researcher, insurer, regulator] = await ethers.getSigners();

  console.log("=== ConsentChain Gas Benchmark ===\n");
  console.log("Signers:");
  console.log(`  Admin:      ${admin.address}`);
  console.log(`  Patient:    ${patient.address}`);
  console.log(`  Hospital:   ${hospital.address}`);
  console.log(`  Researcher: ${researcher.address}`);
  console.log(`  Insurer:    ${insurer.address}`);
  console.log(`  Regulator:  ${regulator.address}\n`);

  // ─── Deploy ───────────────────────────────────────────────
  console.log("--- Deploying contracts ---");

  const SubjectRegistry = await ethers.getContractFactory("SubjectAttributeRegistry");
  const subjectRegistry = await SubjectRegistry.deploy();
  await subjectRegistry.waitForDeployment();

  const DataRegistry = await ethers.getContractFactory("DataResourceRegistry");
  const dataRegistry = await DataRegistry.deploy();
  await dataRegistry.waitForDeployment();

  const ConsentManager = await ethers.getContractFactory("ConsentPolicyManager");
  const consentManager = await ConsentManager.deploy(
    await subjectRegistry.getAddress(),
    await dataRegistry.getAddress()
  );
  await consentManager.waitForDeployment();

  const AuditLog = await ethers.getContractFactory("ConsentAuditLog");
  const auditLog = await AuditLog.deploy();
  await auditLog.waitForDeployment();

  console.log("  All contracts deployed.\n");

  const results: GasResult[] = [];

  // ─── 1. Subject Registration ──────────────────────────────
  console.log("--- 1. Subject Registration ---");

  // Admin registers processors
  results.push(await measureGas(
    "Register processor (hospital)",
    subjectRegistry.connect(admin).setSubjectAttributes(
      hospital.address, Role.PROVIDER, 1001, 82, true // orgId=1001, jurisdiction=82 (KR)
    )
  ));

  results.push(await measureGas(
    "Register processor (researcher)",
    subjectRegistry.connect(admin).setSubjectAttributes(
      researcher.address, Role.RESEARCHER, 2001, 82, true
    )
  ));

  results.push(await measureGas(
    "Register processor (insurer)",
    subjectRegistry.connect(admin).setSubjectAttributes(
      insurer.address, Role.INSURER, 3001, 82, true
    )
  ));

  results.push(await measureGas(
    "Register processor (regulator)",
    subjectRegistry.connect(admin).setSubjectAttributes(
      regulator.address, Role.REGULATOR, 9001, 82, true
    )
  ));

  // Patient self-registers
  results.push(await measureGas(
    "Self-register (patient)",
    subjectRegistry.connect(patient).registerSelf(82)
  ));

  // ─── 2. Data Resource Registration ────────────────────────
  console.log("\n--- 2. Data Resource Registration ---");

  results.push(await measureGas(
    "Register resource (medical, sensitivity=3)",
    dataRegistry.connect(patient).registerResource(patient.address, DataCategory.MEDICAL, 3)
  ));

  results.push(await measureGas(
    "Register resource (genomic, sensitivity=4)",
    dataRegistry.connect(patient).registerResource(patient.address, DataCategory.GENOMIC, 4)
  ));

  results.push(await measureGas(
    "Register resource (demographic, sensitivity=1)",
    dataRegistry.connect(patient).registerResource(patient.address, DataCategory.DEMOGRAPHIC, 1)
  ));

  results.push(await measureGas(
    "Register resource (financial, sensitivity=2)",
    dataRegistry.connect(patient).registerResource(patient.address, DataCategory.FINANCIAL, 2)
  ));

  // ─── 3. Consent Rule Creation ─────────────────────────────
  console.log("\n--- 3. Consent Rule Creation ---");

  // Rule 1: Hospital can READ medical data for TREATMENT until Dec 2026
  const dec2026 = Math.floor(new Date("2026-12-31").getTime() / 1000);
  results.push(await measureGas(
    "Create consent rule (allow hospital READ medical for treatment)",
    consentManager.connect(patient).createConsentRule(
      Role.PROVIDER, 0, 0,                    // any provider, any org, any jurisdiction
      DataCategory.MEDICAL, 3,                 // medical data, up to sensitivity 3
      Purpose.TREATMENT, Action.READ,          // for treatment, read only
      0, dec2026,                              // no start bound, expires Dec 2026
      true                                     // ALLOW
    )
  ));

  // Rule 2: Deny anyone from EXPORTING genomic data for MARKETING
  results.push(await measureGas(
    "Create consent rule (deny EXPORT genomic for marketing)",
    consentManager.connect(patient).createConsentRule(
      Role.NONE, 0, 0,                        // any role (wildcard)
      DataCategory.GENOMIC, 4,                 // genomic data, any sensitivity
      Purpose.MARKETING, Action.EXPORT,        // marketing purpose, export action
      0, 0,                                    // no time bounds (permanent deny)
      false                                    // DENY
    )
  ));

  // Rule 3: Researchers in jurisdiction KR can AGGREGATE medical data for RESEARCH
  results.push(await measureGas(
    "Create consent rule (allow researcher AGGREGATE medical for research, KR only)",
    consentManager.connect(patient).createConsentRule(
      Role.RESEARCHER, 0, 82,                 // researcher role, any org, KR jurisdiction
      DataCategory.MEDICAL, 3,                 // medical, up to sensitivity 3
      Purpose.RESEARCH, Action.AGGREGATE,      // research purpose, aggregate action
      0, dec2026,                              // expires Dec 2026
      true                                     // ALLOW
    )
  ));

  // Rule 4: Insurer can READ financial data for INSURANCE
  results.push(await measureGas(
    "Create consent rule (allow insurer READ financial for insurance)",
    consentManager.connect(patient).createConsentRule(
      Role.INSURER, 0, 0,                     // insurer role, any org, any jurisdiction
      DataCategory.FINANCIAL, 2,               // financial, up to sensitivity 2
      Purpose.INSURANCE, Action.READ,          // insurance purpose, read action
      0, dec2026,                              // expires Dec 2026
      true                                     // ALLOW
    )
  ));

  // Rule 5: Regulator can READ any data for AUDIT
  results.push(await measureGas(
    "Create consent rule (allow regulator READ any for audit)",
    consentManager.connect(patient).createConsentRule(
      Role.REGULATOR, 0, 0,                   // regulator role
      DataCategory.NONE, 4,                    // any category (wildcard), any sensitivity
      Purpose.AUDIT, Action.READ,              // audit purpose, read action
      0, 0,                                    // no time bounds
      true                                     // ALLOW
    )
  ));

  // ─── 4. Access Checks (with varying rule counts) ──────────
  console.log("\n--- 4. Access Evaluation (checkAccessAndEmit) ---");

  // Resource IDs: 1=medical, 2=genomic, 3=demographic, 4=financial

  // Check 1: Hospital reads medical → should ALLOW (matches rule 1)
  results.push(await measureGas(
    "Check access: hospital READ medical/TREATMENT → ALLOW",
    consentManager.connect(admin).checkAccessAndEmit(
      hospital.address, 1, Purpose.TREATMENT, Action.READ
    )
  ));

  // Check 2: Researcher exports genomic for marketing → should DENY (matches deny rule 2)
  results.push(await measureGas(
    "Check access: researcher EXPORT genomic/MARKETING → DENY",
    consentManager.connect(admin).checkAccessAndEmit(
      researcher.address, 2, Purpose.MARKETING, Action.EXPORT
    )
  ));

  // Check 3: Researcher aggregates medical for research → should ALLOW (matches rule 3)
  results.push(await measureGas(
    "Check access: researcher AGGREGATE medical/RESEARCH → ALLOW",
    consentManager.connect(admin).checkAccessAndEmit(
      researcher.address, 1, Purpose.RESEARCH, Action.AGGREGATE
    )
  ));

  // Check 4: Insurer reads medical for insurance → should DENY (no matching rule)
  results.push(await measureGas(
    "Check access: insurer READ medical/INSURANCE → DENY (no rule)",
    consentManager.connect(admin).checkAccessAndEmit(
      insurer.address, 1, Purpose.INSURANCE, Action.READ
    )
  ));

  // Check 5: Insurer reads financial for insurance → should ALLOW (matches rule 4)
  results.push(await measureGas(
    "Check access: insurer READ financial/INSURANCE → ALLOW",
    consentManager.connect(admin).checkAccessAndEmit(
      insurer.address, 4, Purpose.INSURANCE, Action.READ
    )
  ));

  // Check 6: Regulator reads genomic for audit → should ALLOW (matches rule 5)
  results.push(await measureGas(
    "Check access: regulator READ genomic/AUDIT → ALLOW",
    consentManager.connect(admin).checkAccessAndEmit(
      regulator.address, 2, Purpose.AUDIT, Action.READ
    )
  ));

  // ─── 5. Consent Revocation ────────────────────────────────
  console.log("\n--- 5. Consent Revocation ---");

  results.push(await measureGas(
    "Revoke consent rule (rule 3: research access)",
    consentManager.connect(patient).revokeConsentRule(3)
  ));

  // Check access after revocation: researcher aggregates medical → should DENY now
  results.push(await measureGas(
    "Check access after revocation: researcher AGGREGATE medical → DENY",
    consentManager.connect(admin).checkAccessAndEmit(
      researcher.address, 1, Purpose.RESEARCH, Action.AGGREGATE
    )
  ));

  // ─── 6. Audit Log ────────────────────────────────────────
  console.log("\n--- 6. Audit Logging ---");

  results.push(await measureGas(
    "Log consent check (normal)",
    auditLog.connect(admin).logConsentCheck(
      hospital.address, 1, Purpose.TREATMENT, Action.READ, true
    )
  ));

  results.push(await measureGas(
    "Log consent check (denied)",
    auditLog.connect(admin).logConsentCheck(
      researcher.address, 2, Purpose.MARKETING, Action.EXPORT, false
    )
  ));

  results.push(await measureGas(
    "Log emergency access",
    auditLog.connect(admin).logEmergencyAccess(
      hospital.address, 1, "Patient unconscious, emergency cardiac data access"
    )
  ));

  // ─── 7. Scalability: Create many rules then check access ──
  console.log("\n--- 7. Scalability: Access check with N rules ---");

  // We already have 5 rules. Let's add more and measure checkAccess at different scale points.
  const scalePoints = [10, 50, 100];
  const currentRules = 5; // we already created 5

  for (const target of scalePoints) {
    // Add rules to reach `target` count
    const rulesNeeded = target - currentRules - (target > 10 ? scalePoints[scalePoints.indexOf(target) - 1] - currentRules : 0);
    const actualNeeded = target === 10 ? target - currentRules : target - scalePoints[scalePoints.indexOf(target) - 1];

    for (let i = 0; i < actualNeeded; i++) {
      // Create diverse dummy allow rules
      const role = (i % 6) + 1; // cycle through roles 1-6
      const category = (i % 7) + 1; // cycle through categories 1-7
      const purpose = (i % 7) + 1; // cycle through purposes 1-7
      const action = (i % 5) + 1; // cycle through actions 1-5

      await consentManager.connect(patient).createConsentRule(
        role, 0, 0,
        category, 4,
        purpose, action,
        0, dec2026,
        true
      );
    }

    // Now measure checkAccess at this scale
    // Use a check that requires scanning all rules (worst case: no match → full scan)
    const checkTx = await consentManager.connect(admin).checkAccessAndEmit(
      hospital.address, 3, Purpose.MARKETING, Action.DELETE // unlikely to match → full scan
    );
    const checkReceipt = await checkTx.wait();
    const gasUsed = checkReceipt!.gasUsed;
    const costWei = gasUsed * 30n * 1_000_000_000n;
    const costEth = Number(costWei) / 1e18;
    const costUsd = (costEth * 2500).toFixed(4);

    const r: GasResult = {
      operation: `Check access (${target} rules, worst-case scan)`,
      gasUsed,
      usdEstimate: costUsd
    };
    results.push(r);
    console.log(`  ${r.operation}: ${gasUsed.toLocaleString()} gas ($${costUsd})`);
  }

  // ─── Summary ──────────────────────────────────────────────
  console.log("\n\n========================================");
  console.log("        GAS BENCHMARK SUMMARY");
  console.log("========================================");
  console.log("(Estimated USD at 30 gwei, ETH=$2,500)\n");

  // Print formatted table
  const maxLabel = Math.max(...results.map(r => r.operation.length));
  for (const r of results) {
    console.log(
      `${r.operation.padEnd(maxLabel + 2)} ${r.gasUsed.toLocaleString().padStart(10)} gas    $${r.usdEstimate}`
    );
  }

  // Also output LaTeX-ready rows for the paper
  console.log("\n\n--- LaTeX table rows (copy to paper.tex) ---\n");

  // Aggregate key operations for the paper table
  const paperOps = [
    { label: "Register consent rule", ops: results.filter(r => r.operation.startsWith("Create consent rule")) },
    { label: "Revoke consent rule", ops: results.filter(r => r.operation.startsWith("Revoke consent")) },
    { label: "Check access (5 rules)", ops: results.filter(r => r.operation.includes("Check access:")).slice(0, 6) },
    { label: "Check access (10 rules)", ops: results.filter(r => r.operation.includes("10 rules")) },
    { label: "Check access (50 rules)", ops: results.filter(r => r.operation.includes("50 rules")) },
    { label: "Check access (100 rules)", ops: results.filter(r => r.operation.includes("100 rules")) },
    { label: "Log audit event", ops: results.filter(r => r.operation.startsWith("Log consent check")) },
    { label: "Log emergency access", ops: results.filter(r => r.operation.startsWith("Log emergency")) },
  ];

  for (const p of paperOps) {
    if (p.ops.length === 0) continue;
    const avgGas = p.ops.reduce((acc, r) => acc + r.gasUsed, 0n) / BigInt(p.ops.length);
    const costWei = avgGas * 30n * 1_000_000_000n;
    const costEth = Number(costWei) / 1e18;
    const costUsd = (costEth * 2500).toFixed(4);
    console.log(`${p.label.padEnd(30)} & ${avgGas.toLocaleString().padStart(10)} & \\$${costUsd} \\\\`);
  }

  // Verify correctness of access decisions
  console.log("\n\n--- Access Decision Verification ---");
  // readonly calls (no gas, just verify logic)
  const check1 = await consentManager.checkAccess(hospital.address, 1, Purpose.TREATMENT, Action.READ);
  const check2 = await consentManager.checkAccess(researcher.address, 2, Purpose.MARKETING, Action.EXPORT);
  const check3 = await consentManager.checkAccess(researcher.address, 1, Purpose.RESEARCH, Action.AGGREGATE);
  const check4 = await consentManager.checkAccess(insurer.address, 4, Purpose.INSURANCE, Action.READ);
  const check5 = await consentManager.checkAccess(regulator.address, 2, Purpose.AUDIT, Action.READ);

  console.log(`Hospital READ medical/TREATMENT:       ${check1} (expected: true)`);
  console.log(`Researcher EXPORT genomic/MARKETING:   ${check2} (expected: false)`);
  console.log(`Researcher AGGREGATE medical/RESEARCH: ${check3} (expected: false, revoked)`);
  console.log(`Insurer READ financial/INSURANCE:       ${check4} (expected: true)`);
  console.log(`Regulator READ genomic/AUDIT:           ${check5} (expected: true)`);

  const allCorrect = check1 === true && check2 === false && check3 === false && check4 === true && check5 === true;
  console.log(`\nAll access decisions correct: ${allCorrect ? "✅ YES" : "❌ NO"}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
