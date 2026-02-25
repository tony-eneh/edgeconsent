import { v4 as uuidv4 } from "uuid";
import { Capability, Purpose, Action } from "./types";
import { config } from "./config";

// ─── In-memory capability token store ───────────────────────

const store = new Map<string, Capability>();

export function issueCapability(
  requester: string,
  resourceId: number,
  purpose: Purpose,
  action: Action
): Capability {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + config.capabilityTtlSeconds * 1000);

  const capability: Capability = {
    token,
    requester,
    resourceId,
    purpose,
    action,
    expiresAt,
  };

  store.set(token, capability);
  return capability;
}

export function getCapability(token: string): Capability | undefined {
  const cap = store.get(token);
  if (!cap) return undefined;

  // Auto-expire
  if (new Date() > cap.expiresAt) {
    store.delete(token);
    return undefined;
  }

  return cap;
}

export function revokeCapability(token: string): boolean {
  return store.delete(token);
}

export function listCapabilities(): Capability[] {
  const now = new Date();
  const active: Capability[] = [];

  for (const [key, cap] of store) {
    if (now > cap.expiresAt) {
      store.delete(key);
    } else {
      active.push(cap);
    }
  }

  return active;
}
