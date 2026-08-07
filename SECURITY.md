# Security Policy

This repository publishes the Model Context Protocol adapter for the DopamineDesk
x402 marketplace. The marketplace itself advertises this policy from
`https://ai-data-marketplace-1042299154756.us-central1.run.app/.well-known/security.txt`.

## Reporting a vulnerability

Open an issue titled **"Security contact request"** containing nothing but a request
for a private channel. Do not put the vulnerability details in it.

**Do not include in a public issue:** reproduction steps, proof-of-concept code,
private keys, wallet seed phrases, API keys, transaction hashes tied to a real
wallet, or any payment credential.

We will reply on the issue with a private channel and take the details there.

## What this software does and does not hold

The MCP adapter runs on the buyer's machine. When optional auto-pay is enabled it
reads `X402_EVM_PRIVATE_KEY` from the buyer's own environment, signs an x402
authorization locally, and sends only the resulting signature. **The marketplace
never receives a buyer private key**, and this repository stores no credentials.

Buyers using auto-pay should use a dedicated low-balance wallet on Base and set
`X402_MAX_PAYMENT_USDC` to cap every purchase.

## Scope

In scope:

- The adapter in this repository, including the auto-pay signing path
- The payment challenge, verification, and settlement flow of the marketplace API
- Anything that could cause a buyer to be charged without receiving the product,
  or to be charged more than the advertised price

Out of scope:

- Vulnerabilities in the upstream public data sources the products read from
- Availability of third-party facilitators or public RPC endpoints
- Findings that require a buyer to disclose their own private key

## Supported versions

The latest published npm version of `dopaminedesk-ai-data-marketplace-mcp` is the
only supported release.
