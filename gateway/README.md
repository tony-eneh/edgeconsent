# Gateway — Policy Enforcement Gateway

Express.js middleware that mediates between frontend clients and on-chain consent policies.

## Responsibilities

- Authenticate data processors (JWT / wallet-based)
- Translate access requests into on-chain policy evaluations
- Issue capability tokens for approved access
- Cache policy evaluation results for performance
- Forward audit events to the on-chain audit log
