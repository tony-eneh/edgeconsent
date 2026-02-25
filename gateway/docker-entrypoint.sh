#!/bin/sh
set -e

echo "Waiting for contract addresses..."
until [ -f /shared/.env.contracts ]; do
  sleep 1
done
echo "Contract addresses found."

# Load contract addresses
export $(cat /shared/.env.contracts | xargs)

# Hardhat account #0 private key (deployer/admin)
export GATEWAY_PRIVATE_KEY="${GATEWAY_PRIVATE_KEY:-0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80}"
export RPC_URL="${RPC_URL:-http://hardhat:8545}"
export GATEWAY_PORT="${GATEWAY_PORT:-4000}"
export CAPABILITY_TTL_SECONDS="${CAPABILITY_TTL_SECONDS:-300}"

echo "Starting PEG Gateway..."
echo "  RPC_URL: $RPC_URL"
echo "  SUBJECT_REGISTRY_ADDRESS: $SUBJECT_REGISTRY_ADDRESS"
echo "  DATA_REGISTRY_ADDRESS: $DATA_REGISTRY_ADDRESS"
echo "  CONSENT_MANAGER_ADDRESS: $CONSENT_MANAGER_ADDRESS"
echo "  AUDIT_LOG_ADDRESS: $AUDIT_LOG_ADDRESS"

cd /build/gateway
exec node dist/index.js
