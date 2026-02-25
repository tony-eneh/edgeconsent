#!/bin/sh
set -e

echo "Waiting for Hardhat node..."
until wget -qO- http://hardhat:8545 >/dev/null 2>&1; do
  sleep 1
done
echo "Hardhat node is up."

# Deploy contracts and capture output
OUTPUT=$(npx hardhat run scripts/deploy.ts --network localhost 2>&1)
echo "$OUTPUT"

# Extract contract addresses from the JSON block at the end
SUBJECT_ADDR=$(echo "$OUTPUT" | grep '"SubjectAttributeRegistry"' | sed 's/.*: "\(0x[a-fA-F0-9]*\)".*/\1/')
DATA_ADDR=$(echo "$OUTPUT" | grep '"DataResourceRegistry"' | sed 's/.*: "\(0x[a-fA-F0-9]*\)".*/\1/')
CONSENT_ADDR=$(echo "$OUTPUT" | grep '"ConsentPolicyManager"' | sed 's/.*: "\(0x[a-fA-F0-9]*\)".*/\1/')
AUDIT_ADDR=$(echo "$OUTPUT" | grep '"ConsentAuditLog"' | sed 's/.*: "\(0x[a-fA-F0-9]*\)".*/\1/')

# Write .env for the gateway to the shared volume
cat > /shared/.env.contracts <<EOF
SUBJECT_REGISTRY_ADDRESS=${SUBJECT_ADDR}
DATA_REGISTRY_ADDRESS=${DATA_ADDR}
CONSENT_MANAGER_ADDRESS=${CONSENT_ADDR}
AUDIT_LOG_ADDRESS=${AUDIT_ADDR}
EOF

echo ""
echo "Contract addresses written to /shared/.env.contracts"
cat /shared/.env.contracts
