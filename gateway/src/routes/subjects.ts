import { Router, Request, Response } from "express";
import { getContracts } from "../blockchain";
import { Role } from "../types";

const router = Router();

// ─── POST /api/subjects/register ─────────────────────────────
// Registers a new subject (admin-only) or self-registers as DATA_SUBJECT

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { address, role, orgId, jurisdictionId, selfRegister } = req.body;

    if (!address) {
      return res.status(400).json({ error: "address is required" });
    }

    const { subjectRegistry } = getContracts();

    let tx;
    if (selfRegister) {
      // Self-registration as DATA_SUBJECT (patient)
      tx = await subjectRegistry.registerSelf(jurisdictionId || 0);
    } else {
      // Admin registration for any role
      const roleEnum = Role[role as keyof typeof Role];
      if (roleEnum === undefined) {
        return res.status(400).json({ error: "Invalid role" });
      }
      tx = await subjectRegistry.setSubjectAttributes(
        address,
        roleEnum,
        orgId || 0,
        jurisdictionId || 0,
        true // isActive
      );
    }

    const receipt = await tx.wait();
    return res.status(201).json({
      txHash: receipt.hash,
      gasUsed: receipt.gasUsed.toString(),
      message: selfRegister
        ? "Self-registered as DATA_SUBJECT"
        : `Registered ${address} as ${role}`,
    });
  } catch (err: any) {
    console.error("Register subject error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/subjects/:address ──────────────────────────────
// Returns subject attributes

router.get("/:address", async (req: Request, res: Response) => {
  try {
    const address = req.params.address;
    const { subjectRegistry } = getContracts();

    const attrs = await subjectRegistry.getSubjectAttrs(address);
    const active = await subjectRegistry.isSubjectActive(address);

    return res.json({
      address,
      role: Role[Number(attrs.role)] || attrs.role.toString(),
      orgId: Number(attrs.orgId),
      jurisdictionId: Number(attrs.jurisdictionId),
      isActive: active,
    });
  } catch (err: any) {
    console.error("Get subject error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/subjects/deactivate ──────────────────────────

router.post("/deactivate", async (req: Request, res: Response) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: "address is required" });
    }

    const { subjectRegistry } = getContracts();
    const tx = await subjectRegistry.deactivateSubject(address);
    const receipt = await tx.wait();

    return res.json({
      txHash: receipt.hash,
      gasUsed: receipt.gasUsed.toString(),
      message: `Subject ${address} deactivated`,
    });
  } catch (err: any) {
    console.error("Deactivate subject error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
