import express from "express";
import cors from "cors";
import { config } from "./config";

import consentRoutes from "./routes/consent";
import subjectRoutes from "./routes/subjects";
import resourceRoutes from "./routes/resources";
import auditRoutes from "./routes/audit";

const app = express();

// ─── Middleware ──────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Routes ─────────────────────────────────────────────────

app.use("/api/consent", consentRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/audit", auditRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    mode: config.mode,
    contracts: {
      subjectRegistry: config.contracts.subjectRegistry || "NOT SET",
      dataRegistry: config.contracts.dataRegistry || "NOT SET",
      consentManager: config.contracts.consentManager || "NOT SET",
      auditLog: config.contracts.auditLog || "NOT SET",
    },
  });
});

// ─── Start Server ───────────────────────────────────────────

app.listen(config.port, () => {
  console.log(`\n🔗 ConsentChain PEG Gateway running on http://localhost:${config.port}`);
  console.log(`   Mode: ${config.mode}`);
  console.log(`   RPC:  ${config.rpcUrl}`);
  console.log(`   Capability TTL: ${config.capabilityTtlSeconds}s\n`);
});

export default app;
