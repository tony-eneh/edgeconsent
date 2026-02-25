import { Router, Request, Response } from "express";
import { getContracts } from "../blockchain";
import { getCapability, revokeCapability, listCapabilities } from "../capabilityStore";

const router = Router();

// ─── GET /api/audit/stats ────────────────────────────────────
// Returns aggregate audit statistics from on-chain

router.get("/stats", async (req: Request, res: Response) => {
  try {
    const { auditLog } = getContracts();
    const [total, allowed, denied] = await auditLog.getStats();

    return res.json({
      totalChecks: Number(total),
      allowedChecks: Number(allowed),
      deniedChecks: Number(denied),
      denyRate: Number(total) > 0 ? (Number(denied) / Number(total) * 100).toFixed(1) + "%" : "0%",
    });
  } catch (err: any) {
    console.error("Get audit stats error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/audit/capabilities ─────────────────────────────
// Lists all active capability tokens (in-memory)

router.get("/capabilities", (_req: Request, res: Response) => {
  const caps = listCapabilities();
  return res.json({
    count: caps.length,
    capabilities: caps.map((c) => ({
      token: c.token,
      requester: c.requester,
      resourceId: c.resourceId,
      purpose: c.purpose,
      action: c.action,
      expiresAt: c.expiresAt.toISOString(),
    })),
  });
});

// ─── POST /api/audit/validate ────────────────────────────────
// Validates a capability token

router.post("/validate", (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: "token is required" });
  }

  const cap = getCapability(token);
  if (!cap) {
    return res.json({ valid: false, reason: "Token not found or expired" });
  }

  return res.json({
    valid: true,
    capability: {
      token: cap.token,
      requester: cap.requester,
      resourceId: cap.resourceId,
      expiresAt: cap.expiresAt.toISOString(),
    },
  });
});

// ─── DELETE /api/audit/capabilities/:token ───────────────────
// Manually revokes a capability token

router.delete("/capabilities/:token", (req: Request, res: Response) => {
  const token = req.params.token;
  const revoked = revokeCapability(token);
  return res.json({ revoked, token });
});

export default router;
