# EdgeConsent

> Fine-grained data consent management with on-chain Attribute-Based Access Control (ABAC)

**Live deployment:** [https://edgeconsent.vercel.app](https://edgeconsent.vercel.app)

![EdgeConsent deployment screenshot](https://github.com/user-attachments/assets/3bac82ef-5995-4bb6-8964-df2a668a80d6)

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Repository Structure](#repository-structure)
4. [Smart Contracts](#smart-contracts)
5. [Policy Enforcement Gateway](#policy-enforcement-gateway)
6. [Frontend](#frontend)
7. [Local Development Setup](#local-development-setup)
8. [Environment Variables](#environment-variables)
9. [Deploying to a Testnet](#deploying-to-a-testnet)
10. [Docker / Full-Stack Deployment](#docker--full-stack-deployment)
11. [Key Technologies](#key-technologies)

---

## Overview

EdgeConsent replaces coarse-grained binary consent ("allow all" / "deny all") with a **fine-grained ABAC model** enforced entirely by Ethereum smart contracts. Data subjects (e.g. patients) define precise rules specifying *who* can access *what data*, *for which purpose*, *from which organisation/jurisdiction*, and *within which time window*.

Every consent check and access decision is **immutably logged on-chain**, providing a tamper-proof audit trail.

**Key metrics (from gas benchmarks):**
- < 190 000 gas per consent rule creation
- < 14 000 gas per consent evaluation

**Eight ABAC dimensions:**

| Dimension | Examples |
|---|---|
| Role | `DATA_SUBJECT`, `PROVIDER`, `RESEARCHER`, `INSURER`, `REGULATOR`, `EMERGENCY` |
| Organisation | free-text string |
| Jurisdiction | free-text string |
| Data Category | `DEMOGRAPHIC`, `MEDICAL`, `GENOMIC`, `BEHAVIORAL`, `FINANCIAL`, `BIOMETRIC`, `LOCATION` |
| Sensitivity Level | 0 = public → 4 = critical |
| Purpose | `TREATMENT`, `RESEARCH`, `BILLING`, `INSURANCE`, `MARKETING`, `AUDIT`, `EMERGENCY` |
| Action | `READ`, `EXPORT`, `AGGREGATE`, `SHARE`, `DELETE` |
| Temporal Constraints | `notBefore` / `notAfter` Unix timestamps |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser / Client                      │
│                  Next.js Frontend (port 3000)                │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API calls
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            Policy Enforcement Gateway (port 4000)            │
│               Express.js + ethers.js + TypeScript            │
│  • Evaluates consent checks against the blockchain           │
│  • Issues short-lived capability tokens (default 300 s)      │
│  • CRUD for subjects, resources, and consent rules           │
└────────────────────────┬────────────────────────────────────┘
                         │ ethers.js JSON-RPC
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Ethereum Node (Hardhat local / Sepolia)          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SubjectAttributeRegistry  – identity & role registry  │  │
│  │  DataResourceRegistry      – data resource catalogue   │  │
│  │  ConsentPolicyManager      – ABAC rule engine (core)   │  │
│  │  ConsentAuditLog           – immutable access log      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Deny-overrides-allow:** A single matching deny rule blocks access regardless of any allow rules.

---

## Repository Structure

```
edgeconsent/
├── contracts/              # Solidity smart contracts
│   ├── Types.sol           # Shared enums & structs
│   ├── SubjectAttributeRegistry.sol
│   ├── DataResourceRegistry.sol
│   ├── ConsentPolicyManager.sol
│   └── ConsentAuditLog.sol
├── gateway/                # Policy Enforcement Gateway (Express.js)
│   ├── src/
│   │   ├── index.ts        # App entry point, route mounting
│   │   ├── blockchain.ts   # ethers.js provider, signer, contract instances
│   │   ├── config.ts       # Environment variable loader
│   │   ├── capabilityStore.ts  # In-memory capability token store
│   │   ├── types.ts        # TypeScript enums mirroring Solidity
│   │   ├── abis.ts         # Contract ABIs
│   │   └── routes/         # consent, subjects, resources, audit
│   ├── .env.example
│   └── package.json
├── frontend/               # Next.js web application
│   └── src/
│       ├── app/
│       │   ├── page.tsx            # Landing page
│       │   └── dashboard/          # Dashboard (patient & processor UIs)
│       ├── components/             # Shared UI components
│       └── lib/
│           ├── api.ts              # Gateway API client
│           ├── wallet.tsx          # MetaMask wallet context
│           └── demo-accounts.ts    # Hardhat test account map
├── scripts/
│   ├── deploy.ts           # Hardhat deployment script
│   └── gas-benchmark.ts    # Gas usage benchmarks
├── Dockerfile.deploy       # Deploys contracts into a shared volume
├── Dockerfile.gateway      # Builds the gateway service
├── Dockerfile.hardhat      # Runs a local Hardhat node
├── docker-deploy.sh        # Helper: wait-for-node → deploy → write addresses
├── hardhat.config.ts       # Hardhat + Solidity 0.8.20 config
├── .env.example            # Root-level environment template
└── package.json            # Root Hardhat scripts
```

---

## Smart Contracts

All contracts are in `contracts/` and compiled with Solidity 0.8.20 (optimizer on, 200 runs).

### `Types.sol`
Defines all shared enums (`Role`, `DataCategory`, `Purpose`, `Action`) and structs (`SubjectAttributes`, `DataResource`, `ConsentRule`, `AuditEntry`) used across the other contracts.

### `SubjectAttributeRegistry.sol`
Stores the ABAC attributes of every participant (role, organisation, jurisdiction). Supports both **admin-registration** (the gateway wallet adds processors/researchers) and **self-registration** (data subjects register themselves).

### `DataResourceRegistry.sol`
A catalogue of data resources owned by data subjects. Each resource has an owner address, data category, and sensitivity level. Only the owner can register resources.

### `ConsentPolicyManager.sol`
The core ABAC rule engine. Data subjects call `createRule()` to grant or deny a requester access to a resource under specific conditions. The gateway calls `checkConsent()` to evaluate a live access request. Deny rules override allow rules.

### `ConsentAuditLog.sol`
Immutable on-chain log. Every call to `checkConsent()` appends an `AuditEntry` with requester, resource, purpose, action, outcome, and timestamp. Entries cannot be modified or deleted.

---

## Policy Enforcement Gateway

The gateway (`gateway/`) is the only service that holds a private key and sends on-chain transactions. Clients communicate with it over REST.

### API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/consent/check` | Evaluate consent; returns capability token if allowed |
| `POST` | `/api/consent/create` | Create a new consent rule |
| `POST` | `/api/consent/revoke` | Revoke an existing consent rule |
| `POST` | `/api/subjects/register` | Register a subject's ABAC attributes |
| `GET`  | `/api/subjects/:address` | Fetch a subject's attributes |
| `POST` | `/api/resources/register` | Register a data resource |
| `GET`  | `/api/resources/:id` | Fetch a resource by ID |
| `GET`  | `/api/resources/owner/:address` | List all resources owned by address |
| `GET`  | `/api/audit/stats` | Aggregate consent check statistics |
| `GET`  | `/api/audit/capabilities` | List active capability tokens |
| `POST` | `/api/audit/validate` | Validate a capability token |
| `DELETE` | `/api/audit/capabilities/:token` | Revoke a capability token |
| `GET`  | `/health` | Gateway liveness / contract addresses |

Capability tokens are short-lived (default 300 s, configurable via `CAPABILITY_TTL_SECONDS`) and stored in memory only.

---

## Frontend

The frontend (`frontend/`) is a Next.js 16 app (React 19, Tailwind CSS 4) with MetaMask wallet integration.

### Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page — hero, feature cards, stats, architecture diagram |
| `/dashboard` | Overview — gateway health, audit statistics, quick actions |
| `/dashboard/patient/consent` | Create & revoke consent rules (patient view) |
| `/dashboard/patient/resources` | Register & list data resources (patient view) |
| `/dashboard/processor/access` | Submit access requests, receive capability tokens |
| `/dashboard/audit` | Real-time audit stats, token management |

---

## Local Development Setup

### Prerequisites

- [Node.js](https://nodejs.org) ≥ 20
- [MetaMask](https://metamask.io) browser extension

### 1 — Install dependencies

```bash
# Root (Hardhat + contracts)
npm install

# Gateway
cd gateway && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

### 2 — Start a local Ethereum node

```bash
# Terminal 1
npm run node
# JSON-RPC available at http://127.0.0.1:8545 (Chain ID 31337)
```

### 3 — Deploy smart contracts

```bash
# Terminal 2
npm run deploy:local
# Outputs the four contract addresses — copy them to gateway/.env
```

### 4 — Configure the gateway

```bash
cp gateway/.env.example gateway/.env
# Edit gateway/.env and fill in the four contract addresses from step 3
```

### 5 — Start the gateway

```bash
# Terminal 3
cd gateway
npm run dev
# Running on http://localhost:4000
```

### 6 — Start the frontend

```bash
# Terminal 4
cd frontend
npm run dev
# Running on http://localhost:3000
```

### 7 — Connect MetaMask

1. Open MetaMask → **Add a network manually**
2. Network name: `Hardhat Local`
3. RPC URL: `http://127.0.0.1:8545`
4. Chain ID: `31337`
5. Import a test account using private key `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` (Hardhat account #0, pre-funded with 10 000 ETH)

---

## Environment Variables

### Root (`.env.example`)

| Variable | Description |
|---|---|
| `SEPOLIA_RPC_URL` | JSON-RPC URL for Sepolia testnet |
| `SEPOLIA_PRIVATE_KEY` | Deployer private key for Sepolia |

### Gateway (`gateway/.env.example`)

| Variable | Default | Description |
|---|---|---|
| `MODE` | `edgeconsent` | Gateway operating mode |
| `RPC_URL` | `http://127.0.0.1:8545` | Ethereum JSON-RPC endpoint |
| `GATEWAY_PRIVATE_KEY` | Hardhat account #0 | Wallet used to send transactions |
| `SUBJECT_REGISTRY_ADDRESS` | — | Deployed `SubjectAttributeRegistry` address |
| `DATA_REGISTRY_ADDRESS` | — | Deployed `DataResourceRegistry` address |
| `CONSENT_MANAGER_ADDRESS` | — | Deployed `ConsentPolicyManager` address |
| `AUDIT_LOG_ADDRESS` | — | Deployed `ConsentAuditLog` address |
| `CAPABILITY_TTL_SECONDS` | `300` | Lifetime of issued capability tokens (seconds) |
| `GATEWAY_PORT` | `4000` | HTTP port the gateway listens on |

---

## Deploying to a Testnet

### Sepolia

1. Add `SEPOLIA_RPC_URL` and `SEPOLIA_PRIVATE_KEY` to `.env`.
2. Fund the deployer wallet with Sepolia ETH (use a faucet).
3. Run:

```bash
npm run deploy:sepolia
```

4. Copy the output contract addresses to `gateway/.env`.
5. Point the frontend's `NEXT_PUBLIC_GATEWAY_URL` (if used) at your deployed gateway.

---

## Docker / Full-Stack Deployment

Three Dockerfiles handle a containerised deployment. The typical flow is:

1. **`Dockerfile.hardhat`** — starts a Hardhat node on port 8545.
2. **`Dockerfile.deploy`** — waits for the node, deploys all contracts via `docker-deploy.sh`, and writes addresses to a shared volume (`/shared/.env.contracts`).
3. **`Dockerfile.gateway`** — two-stage build: compiles contracts for ABIs, then builds the gateway; reads addresses from the shared volume at runtime.
4. **`frontend/Dockerfile`** — builds the Next.js app in standalone mode.

Refer to each `Dockerfile.*` and `docker-deploy.sh` for exact build arguments and volume mount paths.

---

## Key Technologies

| Layer | Technology |
|---|---|
| Smart contracts | Solidity 0.8.20, Hardhat 2, ethers.js 6 |
| Gateway | Express.js 4, ethers.js 6, TypeScript 5, UUID |
| Frontend | Next.js 16, React 19, Tailwind CSS 4, Lucide React |
| Testing (contracts) | Mocha, Chai, Hardhat Network |
| Containerisation | Docker (multi-stage builds) |
