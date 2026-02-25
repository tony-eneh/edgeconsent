"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserCircle,
  FolderOpen,
  ShieldCheck,
  Microscope,
  KeyRound,
  BarChart3,
  Lock,
  LogOut,
  Wallet,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/patient", label: "Patient", icon: UserCircle },
  { href: "/dashboard/patient/resources", label: "Data Resources", icon: FolderOpen, indent: true },
  { href: "/dashboard/patient/consent", label: "Consent Rules", icon: ShieldCheck, indent: true },
  { href: "/dashboard/processor", label: "Processor", icon: Microscope },
  { href: "/dashboard/processor/access", label: "Request Access", icon: KeyRound, indent: true },
  { href: "/dashboard/audit", label: "Audit Trail", icon: BarChart3 },
];

export function Sidebar({
  walletAddress,
  walletLabel,
  onDisconnect,
}: {
  walletAddress?: string | null;
  walletLabel?: string | null;
  onDisconnect?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar text-sidebar-text flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-sidebar-active" />
          <h1 className="text-xl font-bold text-white tracking-tight">
            ConsentChain
          </h1>
        </div>
        <p className="text-xs text-sidebar-text/60 mt-1">
          ABAC-Based Data Consent
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-2.5 text-sm transition-colors ${
                item.indent ? "pl-10" : ""
              } ${
                isActive
                  ? "bg-sidebar-active/20 text-white border-r-2 border-sidebar-active"
                  : "hover:bg-white/5 text-sidebar-text"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Wallet info */}
      {walletAddress && (
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-3.5 h-3.5 text-sidebar-active" />
            <span className="text-xs font-medium text-white truncate">
              {walletLabel || `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
            </span>
          </div>
          <p className="text-[10px] font-mono text-sidebar-text/50 mb-2 truncate">
            {walletAddress}
          </p>
          {onDisconnect && (
            <button
              onClick={onDisconnect}
              className="flex items-center gap-1.5 text-xs text-sidebar-text/60 hover:text-white transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Disconnect
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-white/10 text-xs text-sidebar-text/40">
        <p>ICBC 2026 Demo</p>
        <p>NSL Lab — Kumoh NIT</p>
      </div>
    </aside>
  );
}
