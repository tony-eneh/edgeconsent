"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { DEMO_ACCOUNTS } from "./api";

// ─── Types ──────────────────────────────────────────────────

export interface WalletState {
  /** Connected wallet address (checksummed) */
  address: string | null;
  /** Private key for signing txs — only available for Hardhat demo accounts */
  signerKey: string | null;
  /** Display label if one of the known demo accounts */
  label: string | null;
  /** True while a connect call is in progress */
  connecting: boolean;
  /** Last error message */
  error: string | null;
  /** Connect via MetaMask / injected provider */
  connect: () => Promise<void>;
  /** Disconnect (client-side only) */
  disconnect: () => void;
  /** Whether MetaMask / injected provider is available */
  hasProvider: boolean;
}

const WalletContext = createContext<WalletState | null>(null);

// ─── Provider ───────────────────────────────────────────────

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [signerKey, setSignerKey] = useState<string | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasProvider, setHasProvider] = useState(false);

  // Check for injected provider on mount
  useEffect(() => {
    const eth = (window as any).ethereum;
    setHasProvider(!!eth);

    // Restore persisted session
    const stored = sessionStorage.getItem("cc_wallet");
    if (stored) {
      try {
        const { address: a } = JSON.parse(stored);
        if (a) syncAddress(a);
      } catch { /* ignore */ }
    }

    // Listen for account changes
    if (eth) {
      const handleAccounts = (accounts: string[]) => {
        if (accounts.length === 0) {
          clearWallet();
        } else {
          syncAddress(accounts[0]);
        }
      };
      eth.on("accountsChanged", handleAccounts);
      return () => eth.removeListener("accountsChanged", handleAccounts);
    }
  }, []);

  const syncAddress = (addr: string) => {
    const normalized = addr.toLowerCase();
    setAddress(addr);
    // Match against known Hardhat demo accounts for signer key
    const demo = DEMO_ACCOUNTS.find(
      (d) => d.address.toLowerCase() === normalized
    );
    setSignerKey(demo?.key ?? null);
    setLabel(demo?.label ?? null);
    sessionStorage.setItem("cc_wallet", JSON.stringify({ address: addr }));
  };

  const clearWallet = () => {
    setAddress(null);
    setSignerKey(null);
    setLabel(null);
    setError(null);
    sessionStorage.removeItem("cc_wallet");
  };

  const connect = useCallback(async () => {
    const eth = (window as any).ethereum;
    if (!eth) {
      setError("No wallet detected. Install MetaMask to continue.");
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      const accounts: string[] = await eth.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length > 0) {
        syncAddress(accounts[0]);
      }
    } catch (e: any) {
      if (e.code === 4001) {
        setError("Connection rejected by user.");
      } else {
        setError(e.message || "Failed to connect wallet.");
      }
    }
    setConnecting(false);
  }, []);

  const disconnect = useCallback(() => {
    clearWallet();
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        signerKey,
        label,
        connecting,
        error,
        connect,
        disconnect,
        hasProvider,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within <WalletProvider>");
  return ctx;
}
