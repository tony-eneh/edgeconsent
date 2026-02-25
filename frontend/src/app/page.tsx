"use client";

import Link from "next/link";
import {
  Shield,
  Link as LinkIcon,
  Eye,
  Zap,
  Lock,
  ArrowRight,
  Github,
  BookOpen,
} from "lucide-react";

const FEATURES = [
  {
    icon: Shield,
    title: "Fine-Grained ABAC",
    description:
      "Attribute-based access control with deny-overrides. Define consent rules by role, purpose, data category, and sensitivity level.",
  },
  {
    icon: LinkIcon,
    title: "On-Chain Enforcement",
    description:
      "Every consent check is evaluated and logged on-chain via Solidity smart contracts. Tamper-proof and fully auditable.",
  },
  {
    icon: Eye,
    title: "Immutable Audit Trail",
    description:
      "All access decisions, both allowed and denied, are permanently recorded. Subjects retain full visibility.",
  },
  {
    icon: Zap,
    title: "Capability Tokens",
    description:
      "Approved access requests yield time-limited capability tokens, bridging on-chain consent with off-chain data retrieval.",
  },
];

const STATS = [
  { value: "5", label: "Smart Contracts" },
  { value: "<190K", label: "Gas per Consent Rule" },
  { value: "13/13", label: "E2E Tests Passing" },
  { value: "8", label: "ABAC Attributes" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ─── Navbar ─────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg">ConsentChain</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#architecture" className="hover:text-foreground transition-colors">
              Architecture
            </a>
            <a href="#stats" className="hover:text-foreground transition-colors">
              Performance
            </a>
          </nav>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Lock className="w-4 h-4" />
            Launch App
          </Link>
        </div>
      </header>

      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-light text-primary px-3 py-1 rounded-full text-xs font-medium mb-6">
            <Shield className="w-3 h-3" />
            ICBC 2026 Demo Paper
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            Fine-Grained Data Consent
            <br />
            <span className="text-primary">On-Chain ABAC</span>
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto mb-10">
            ConsentChain replaces coarse-grained binary consent with
            attribute-based policies enforced by smart contracts. Data subjects
            define exactly who can access what, for which purpose, and under
            what conditions — all on-chain.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
            >
              Connect Wallet & Enter
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com/tony-eneh/consentchain"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-card border border-border text-foreground px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              <Github className="w-4 h-4" />
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ─── Stats banner ───────────────────────────────────── */}
      <section id="stats" className="bg-sidebar py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-sidebar-text/70 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────────── */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Architecture ───────────────────────────────────── */}
      <section
        id="architecture"
        className="py-20 px-6 bg-gradient-to-b from-background to-primary-light/20"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">System Architecture</h2>
          <p className="text-sm text-muted mb-8 max-w-2xl mx-auto">
            Three-layer design: a React frontend communicates with the PEG
            Gateway (Express + ethers.js), which evaluates ABAC policies via
            Solidity smart contracts on Ethereum.
          </p>
          <div className="bg-card border border-border rounded-xl p-8 text-left">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              {[
                {
                  layer: "Frontend",
                  items: ["Next.js + React", "Wallet Auth", "Dashboard UI"],
                  color: "primary",
                },
                {
                  layer: "PEG Gateway",
                  items: ["Express REST API", "Capability Store", "Nonce Manager"],
                  color: "warning",
                },
                {
                  layer: "Smart Contracts",
                  items: ["SubjectRegistry", "ConsentPolicyManager", "AuditLog"],
                  color: "success",
                },
              ].map((col) => (
                <div key={col.layer}>
                  <div
                    className={`bg-${col.color}-light text-${col.color} font-semibold py-2 rounded-lg mb-3`}
                  >
                    {col.layer}
                  </div>
                  {col.items.map((item) => (
                    <p key={item} className="text-xs text-muted py-1">
                      {item}
                    </p>
                  ))}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-6 text-muted">
              <ArrowRight className="w-4 h-4 rotate-90" />
              <span className="text-xs">JSON-RPC / REST</span>
              <ArrowRight className="w-4 h-4 rotate-90" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────── */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Try the Demo</h2>
        <p className="text-sm text-muted mb-8 max-w-lg mx-auto">
          Connect your MetaMask wallet (preferably configured for Hardhat&apos;s
          local network) and explore the full consent lifecycle.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
          >
            <Lock className="w-4 h-4" />
            Launch Dashboard
          </Link>
          <a
            href="https://github.com/tony-eneh/consentchain#readme"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-muted hover:text-foreground text-sm transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Read the Paper
          </a>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className="bg-sidebar py-8 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-sidebar-text/50">
          <p>ConsentChain — ICBC 2026 Demo • NSL Lab, Kumoh NIT</p>
          <a
            href="https://github.com/tony-eneh/consentchain"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-sidebar-text/80 transition-colors"
          >
            <Github className="w-3 h-3" />
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
