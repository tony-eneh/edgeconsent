import { Router, Request, Response } from "express";
import { getContracts, getContractsForSigner } from "../blockchain";
import { issueCapability } from "../capabilityStore";
import {
  Purpose,
  Action,
  Role,
  DataCategory,
  ConsentCheckRequest,
  ConsentRuleRequest,
} from "../types";

const router = Router();

// ─── POST /api/consent/check ─────────────────────────────────
// Evaluates on-chain consent and returns capability token if allowed

router.post("/check", async (req: Request, res: Response) => {
  const startMs = Date.now();
  try {
    const body = req.body as ConsentCheckRequest;

    // Validate enum keys
    const purpose = Purpose[body.purpose];
    const action = Action[body.action];
    if (purpose === undefined || action === undefined) {
      return res.status(400).json({ error: "Invalid purpose or action key" });
    }

    const { consentManager, auditLog } = getContracts();

    // On-chain access evaluation
    const allowed: boolean = await consentManager.checkAccess(
      body.requester,
      body.resourceId,
      purpose,
      action
    );

    // Log to audit trail
    try {
      const tx = await auditLog.logConsentCheck(
        body.requester,
        body.resourceId,
        purpose,
        action,
        allowed
      );
      await tx.wait();
    } catch (auditError: any) {
      console.warn("Audit log write failed (non-fatal):", auditError.message);
    }

    const latencyMs = Date.now() - startMs;

    if (allowed) {
      const capability = issueCapability(body.requester, body.resourceId, purpose, action);
      return res.json({
        allowed: true,
        reason: "Consent granted by on-chain policy evaluation",
        capability: {
          token: capability.token,
          expiresAt: capability.expiresAt.toISOString(),
          resourceId: capability.resourceId,
        },
        latencyMs,
      });
    }

    return res.json({
      allowed: false,
      reason: "Consent denied by on-chain policy evaluation (deny-overrides)",
      latencyMs,
    });
  } catch (err: any) {
    console.error("Consent check error:", err);
    return res.status(500).json({ error: err.message, latencyMs: Date.now() - startMs });
  }
});

// ─── POST /api/consent/rules ─────────────────────────────────
// Creates a new consent rule on-chain (only data subjects can call)

router.post("/rules", async (req: Request, res: Response) => {
  try {
    const body = req.body as ConsentRuleRequest;

    const role = Role[body.allowedRole];
    const category = DataCategory[body.allowedCategory];
    const purpose = Purpose[body.allowedPurpose];
    const action = Action[body.allowedAction];

    if (
      role === undefined ||
      category === undefined ||
      purpose === undefined ||
      action === undefined
    ) {
      return res.status(400).json({ error: "Invalid enum key in request" });
    }

    // Use caller's signer key if provided (data subject must be msg.sender)
    const contracts = body.signerKey
      ? getContractsForSigner(body.signerKey)
      : getContracts();
    const { consentManager } = contracts;

    // Note: createConsentRule uses msg.sender as consentGiver.
    const tx = await consentManager.createConsentRule(
      role,
      body.allowedOrgId,
      body.allowedJurisdictionId,
      category,
      body.maxSensitivityLevel,
      purpose,
      action,
      body.notBefore,
      body.notAfter,
      body.isAllow
    );

    const receipt = await tx.wait();
    return res.status(201).json({
      txHash: receipt.hash,
      gasUsed: receipt.gasUsed.toString(),
      message: `Consent rule created (${body.isAllow ? "ALLOW" : "DENY"})`,
    });
  } catch (err: any) {
    console.error("Create consent rule error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/consent/revoke ────────────────────────────────
// Revokes a consent rule by index

router.post("/revoke", async (req: Request, res: Response) => {
  try {
    const { ruleId, signerKey } = req.body;

    if (ruleId === undefined) {
      return res.status(400).json({ error: "ruleId is required" });
    }

    const contracts = signerKey
      ? getContractsForSigner(signerKey)
      : getContracts();
    const { consentManager } = contracts;

    const tx = await consentManager.revokeConsentRule(ruleId);
    const receipt = await tx.wait();

    return res.json({
      txHash: receipt.hash,
      gasUsed: receipt.gasUsed.toString(),
      message: `Consent rule ${ruleId} revoked`,
    });
  } catch (err: any) {
    console.error("Revoke consent rule error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/consent/rules/:address ─────────────────────────
// Returns all consent rules for a data subject

router.get("/rules/:address", async (req: Request, res: Response) => {
  try {
    const address = req.params.address;
    const { consentManager } = getContracts();

    // Get rule IDs for this data subject, then load each rule
    const ruleIds: bigint[] = await consentManager.getRulesBySubject(address);
    const rules = [];

    for (const ruleId of ruleIds) {
      const rule = await consentManager.getRule(Number(ruleId));
      rules.push({
        ruleId: Number(ruleId),
        consentGiver: rule.consentGiver,
        allowedRole: Role[Number(rule.allowedRole)] || rule.allowedRole.toString(),
        allowedOrgId: Number(rule.allowedOrgId),
        allowedJurisdictionId: Number(rule.allowedJurisdictionId),
        allowedCategory:
          DataCategory[Number(rule.allowedCategory)] || rule.allowedCategory.toString(),
        maxSensitivityLevel: Number(rule.maxSensitivityLevel),
        allowedPurpose: Purpose[Number(rule.allowedPurpose)] || rule.allowedPurpose.toString(),
        allowedAction: Action[Number(rule.allowedAction)] || rule.allowedAction.toString(),
        notBefore: Number(rule.notBefore),
        notAfter: Number(rule.notAfter),
        isAllow: rule.isAllow,
        isActive: rule.isActive,
      });
    }

    return res.json({ address, rules });
  } catch (err: any) {
    console.error("Get consent rules error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
