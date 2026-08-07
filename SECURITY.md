# Security Policy

This repository publishes the Model Context Protocol adapter for the DopamineDesk
x402 marketplace. The marketplace itself advertises this policy from
`https://ai-data-marketplace-1042299154756.us-central1.run.app/.well-known/security.txt`.

## Reporting a vulnerability

Use GitHub private vulnerability reporting:
**[Report a vulnerability](https://github.com/jblaz6335/mcp-server-aidatamarketplace/security/advisories/new)**

That opens a private advisory visible only to you and the maintainer. Put the full
details there - reproduction steps and proof-of-concept code are welcome in a private
advisory.

**Do not open a public issue for a security report**, and never include private keys,
wallet seed phrases, API keys, or payment credentials anywhere, including a private
advisory. We never need them to reproduce a finding.

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
