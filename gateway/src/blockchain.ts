import { ethers, NonceManager } from "ethers";
import { config } from "./config";
import { contractAbis } from "./abis";

// ─── Provider & Signer ─────────────────────────────────────

export function createProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(config.rpcUrl);
}

export function createSigner(): NonceManager {
  const provider = createProvider();
  const wallet = new ethers.Wallet(config.gatewayPrivateKey, provider);
  return new NonceManager(wallet);
}

// ─── Contract Instances ─────────────────────────────────────

export interface Contracts {
  subjectRegistry: ethers.Contract;
  dataRegistry: ethers.Contract;
  consentManager: ethers.Contract;
  auditLog: ethers.Contract;
}

// Cache ABIs once loaded
let _abis: { subjectRegistry: any[]; dataRegistry: any[]; consentManager: any[]; auditLog: any[] } | null = null;

function getAbis() {
  if (_abis) return _abis;
  _abis = {
    subjectRegistry: [...contractAbis.subjectRegistry],
    dataRegistry: [...contractAbis.dataRegistry],
    consentManager: [...contractAbis.consentManager],
    auditLog: [...contractAbis.auditLog],
  };
  return _abis;
}

let _contracts: Contracts | null = null;

export function getContracts(): Contracts {
  if (_contracts) return _contracts;

  const signer = createSigner();
  _contracts = buildContracts(signer);
  return _contracts;
}

/** Create contract instances connected to a specific signer (for user-specific txns). */
export function getContractsForSigner(privateKey: string): Contracts {
  const provider = createProvider();
  const wallet = new ethers.Wallet(privateKey, provider);
  const signer = new NonceManager(wallet);
  return buildContracts(signer);
}

function buildContracts(signerOrProvider: NonceManager | ethers.JsonRpcProvider): Contracts {
  const abis = getAbis();
  return {
    subjectRegistry: new ethers.Contract(
      config.contracts.subjectRegistry,
      abis.subjectRegistry,
      signerOrProvider
    ),
    dataRegistry: new ethers.Contract(
      config.contracts.dataRegistry,
      abis.dataRegistry,
      signerOrProvider
    ),
    consentManager: new ethers.Contract(
      config.contracts.consentManager,
      abis.consentManager,
      signerOrProvider
    ),
    auditLog: new ethers.Contract(
      config.contracts.auditLog,
      abis.auditLog,
      signerOrProvider
    ),
  };
}

/** Reset cached contracts (useful after redeployment) */
export function resetContracts(): void {
  _contracts = null;
}
