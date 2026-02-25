"use client";

import { useState, useCallback, ReactNode } from "react";

// ─── Card ────────────────────────────────────────────────────

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-card rounded-xl border border-border shadow-sm p-6 ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────

export function StatCard({
  label,
  value,
  sub,
  color = "primary",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: "primary" | "success" | "danger" | "warning";
}) {
  const colors = {
    primary: "bg-primary-light text-primary",
    success: "bg-success-light text-success",
    danger: "bg-danger-light text-danger",
    warning: "bg-warning-light text-warning",
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-5">
      <p className="text-sm text-muted mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colors[color].split(" ")[1]}`}>{value}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  );
}

// ─── Badge ──────────────────────────────────────────────────

export function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "success" | "danger" | "warning" | "muted";
}) {
  const styles = {
    default: "bg-primary-light text-primary",
    success: "bg-success-light text-success",
    danger: "bg-danger-light text-danger",
    warning: "bg-warning-light text-warning",
    muted: "bg-gray-100 text-muted",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

// ─── Button ─────────────────────────────────────────────────

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "danger" | "ghost";
  size?: "sm" | "md";
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  };
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90",
    danger: "bg-danger text-white hover:bg-danger/90",
    ghost: "bg-transparent text-muted hover:bg-gray-100",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {loading && (
        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}

// ─── Select ─────────────────────────────────────────────────

export function Select({
  label,
  value,
  onChange,
  options,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[] | string[];
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-muted mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Input ──────────────────────────────────────────────────

export function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  className = "",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-muted mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}

// ─── Toast hook ─────────────────────────────────────────────

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return { toasts, addToast };
}

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
  const colors = {
    success: "bg-success text-white",
    error: "bg-danger text-white",
    info: "bg-primary text-white",
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-[slideIn_0.3s_ease] ${colors[t.type]}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Account Picker ─────────────────────────────────────────

import { DEMO_ACCOUNTS } from "@/lib/api";

export function AccountPicker({
  selectedAddress,
  onSelect,
  filter,
}: {
  selectedAddress: string;
  onSelect: (address: string, key: string) => void;
  filter?: (account: (typeof DEMO_ACCOUNTS)[number]) => boolean;
}) {
  const accounts = filter ? DEMO_ACCOUNTS.filter(filter) : DEMO_ACCOUNTS;

  return (
    <div className="flex gap-2 flex-wrap">
      {accounts.map((acc) => (
        <button
          key={acc.address}
          onClick={() => onSelect(acc.address, acc.key)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
            selectedAddress === acc.address
              ? "bg-primary text-white border-primary"
              : "bg-card text-foreground border-border hover:border-primary/50"
          }`}
        >
          {acc.label}
          <span className="ml-1 text-[10px] opacity-60">
            {acc.address.slice(0, 6)}...{acc.address.slice(-4)}
          </span>
        </button>
      ))}
    </div>
  );
}
