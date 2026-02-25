import { Router, Request, Response } from "express";
import { getContracts } from "../blockchain";
import { DataCategory } from "../types";

const router = Router();

// ─── POST /api/resources/register ────────────────────────────
// Registers a new data resource

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { owner, category, sensitivityLevel } = req.body;

    if (!owner || category === undefined || sensitivityLevel === undefined) {
      return res.status(400).json({ error: "owner, category, and sensitivityLevel required" });
    }

    const categoryEnum = DataCategory[category as keyof typeof DataCategory];
    if (categoryEnum === undefined) {
      return res.status(400).json({ error: "Invalid category" });
    }

    const { dataRegistry } = getContracts();

    const tx = await dataRegistry.registerResource(owner, categoryEnum, sensitivityLevel);
    const receipt = await tx.wait();

    // Try to get the resource ID from the event
    let resourceId: string | undefined;
    for (const log of receipt.logs) {
      try {
        const parsed = dataRegistry.interface.parseLog({
          data: log.data,
          topics: log.topics,
        });
        if (parsed && parsed.name === "ResourceRegistered") {
          resourceId = parsed.args[0].toString();
        }
      } catch {
        // Skip logs from other contracts
      }
    }

    return res.status(201).json({
      txHash: receipt.hash,
      gasUsed: receipt.gasUsed.toString(),
      resourceId,
      message: "Data resource registered",
    });
  } catch (err: any) {
    console.error("Register resource error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/resources/:id ──────────────────────────────────
// Returns resource details

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { dataRegistry } = getContracts();

    const resource = await dataRegistry.resources(id);
    return res.json({
      id,
      owner: resource.owner,
      category: DataCategory[Number(resource.category)] || resource.category.toString(),
      sensitivityLevel: Number(resource.sensitivityLevel),
      isActive: resource.isActive,
    });
  } catch (err: any) {
    console.error("Get resource error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/resources/owner/:address ───────────────────────
// Returns all resources owned by an address

router.get("/owner/:address", async (req: Request, res: Response) => {
  try {
    const address = req.params.address;
    const { dataRegistry } = getContracts();

    const ids: bigint[] = await dataRegistry.getResourcesByOwner(address);
    const resources = [];

    for (const id of ids) {
      const resource = await dataRegistry.resources(Number(id));
      resources.push({
        id: Number(id),
        owner: resource.owner,
        category: DataCategory[Number(resource.category)] || resource.category.toString(),
        sensitivityLevel: Number(resource.sensitivityLevel),
        isActive: resource.isActive,
      });
    }

    return res.json({ owner: address, resources });
  } catch (err: any) {
    console.error("Get resources by owner error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
