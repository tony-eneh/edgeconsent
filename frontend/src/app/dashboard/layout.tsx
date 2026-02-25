"use client";

import { WalletProvider, useWallet } from "@/lib/wallet";
import { Sidebar } from "@/components/Sidebar";
import { Lock, Wallet, AlertTriangle, Loader2 } from "lucide-react";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { address, label, connecting, error, connect, disconnect, hasProvider } =
    useWallet();

  // Connected → show dashboard
  if (address) {
    return (
      <div className="flex min-h-screen">
        <Sidebar
          walletAddress={address}
          walletLabel={label}
          onDisconnect={disconnect}
        />
        <main className="flex-1 ml-64 p-8">{children}</main>
      </div>
    );
  }

  // Not connected → connect prompt
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Connect Your Wallet</h1>
        <p className="text-sm text-muted mb-8">
          ConsentChain uses wallet-based authentication. Connect MetaMask to
          access the dashboard.
        </p>

        {error && (
          <div className="bg-danger-light border border-danger/20 rounded-lg p-3 mb-6 flex items-center gap-2 text-sm text-danger">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={connect}
          disabled={connecting}
          className="w-full flex items-center justify-center gap-3 bg-primary text-white px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-lg shadow-primary/25"
        >
          {connecting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Wallet className="w-5 h-5" />
          )}
          {connecting ? "Connecting..." : "Connect with MetaMask"}
        </button>

        {!hasProvider && (
          <p className="text-xs text-muted mt-4">
            MetaMask not detected.{" "}
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Install MetaMask
            </a>{" "}
            to continue, or use a Hardhat-compatible browser wallet.
          </p>
        )}

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted">
            For the demo, import one of Hardhat&apos;s test accounts into MetaMask.
            The private keys are listed in the{" "}
            <a
              href="https://github.com/tony-eneh/consentchain#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              README
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletProvider>
      <AuthGate>{children}</AuthGate>
    </WalletProvider>
  );
}
