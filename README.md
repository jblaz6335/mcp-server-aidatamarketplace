# DopamineDesk x402 Marketplace MCP Server

[![Base Mainnet](https://img.shields.io/badge/Network-Base_Mainnet-blue)](https://base.org)
[![x402 Protocol](https://img.shields.io/badge/Protocol-x402_v2-green)](https://ai-data-marketplace-1042299154756.us-central1.run.app/.well-known/x402)
[![x402scan](https://img.shields.io/badge/x402scan-live_catalog-00c2ff)](https://www.x402scan.com/server/8dd63536-ba25-40f4-b36a-7d05ed18d007)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Server-purple)](https://modelcontextprotocol.io)
[![npm](https://img.shields.io/npm/v/dopaminedesk-ai-data-marketplace-mcp?label=npm)](https://www.npmjs.com/package/dopaminedesk-ai-data-marketplace-mcp)
[![Tests](https://github.com/jblaz6335/mcp-server-aidatamarketplace/actions/workflows/test.yml/badge.svg)](https://github.com/jblaz6335/mcp-server-aidatamarketplace/actions/workflows/test.yml)

Decision-ready machine-to-machine reports paid per request with the **x402 Payment Protocol** on **Base Mainnet**.

**No API key. No account. No subscription.** Buy one current answer in USDC when a workflow needs it. The catalog includes transaction preflight, company intelligence, x402 endpoint verification, website due diligence, VIN safety, market checks, security research, and atomic EVM reads.

Every billable route accepts `?preview=true`. The preview is a live contract proof showing the source, freshness, required inputs, and response shape. It deliberately withholds the decision-ready values delivered by the paid call.

## Buyer-ready outcomes

| Product | What the paid call delivers | Price (USDC) |
| :--- | :--- | :--- |
| [`transaction_preflight`](https://ai-data-marketplace-1042299154756.us-central1.run.app/products/transaction_preflight?utm_source=github&utm_medium=readme&utm_campaign=buyer_outcomes) | Read-only transaction simulation evidence before signing | **0.005** |
| [`company_intelligence`](https://ai-data-marketplace-1042299154756.us-central1.run.app/products/company_intelligence?utm_source=github&utm_medium=readme&utm_campaign=buyer_outcomes) | Company enrichment and vendor research brief | **0.010** |
| [`x402_endpoint_preflight`](https://ai-data-marketplace-1042299154756.us-central1.run.app/products/x402_endpoint_preflight?utm_source=github&utm_medium=readme&utm_campaign=buyer_outcomes) | x402 endpoint verification, challenge linting, and buyer compatibility evidence | **0.003** |
| [`website_due_diligence`](https://ai-data-marketplace-1042299154756.us-central1.run.app/products/website_due_diligence?utm_source=github&utm_medium=readme&utm_campaign=buyer_outcomes) | Website trust, security, metadata, and risk evidence in one report | **0.040** |
| [`vehicle_safety_report`](https://ai-data-marketplace-1042299154756.us-central1.run.app/products/vehicle_safety_report?utm_source=github&utm_medium=readme&utm_campaign=buyer_outcomes) | VIN decode, recall, complaint, and buyer safety evidence | **0.008** |
| [`crypto_market_snapshot`](https://ai-data-marketplace-1042299154756.us-central1.run.app/products/crypto_market_snapshot?utm_source=github&utm_medium=readme&utm_campaign=buyer_outcomes) | Current multi-asset pricing and market context | **0.010** |

These are complete paid deliverables, not teaser text. The lower-level catalog remains available for workflows that need a single chain read, filing, sanctions check, quote, or verification result.

## Install

```bash
npx -y dopaminedesk-ai-data-marketplace-mcp
```

Use it from any stdio-compatible MCP client:

```json
{
  "mcpServers": {
    "dopaminedesk-data-marketplace": {
      "command": "npx",
      "args": ["-y", "dopaminedesk-ai-data-marketplace-mcp"]
    }
  }
}
```

Official MCP Registry name: `io.github.jblaz6335/ai-data-marketplace`.

## Inspect a live contract

```bash
curl "https://ai-data-marketplace-1042299154756.us-central1.run.app/api/v1/company_intelligence?preview=true&domain=example.com"
```

The proof includes source, freshness, request parameters, top-level fields, response shape, and a purchase block. Decision-ready values remain in the paid result.

## Optional one-call purchasing

Version 2.9.0 can complete the x402 challenge, authorization, retry, and settlement automatically. The buyer key stays inside the local MCP process and is never sent to the marketplace. Use a dedicated low-balance Base wallet, not a primary wallet.

```json
{
  "mcpServers": {
    "dopaminedesk-data-marketplace": {
      "command": "npx",
      "args": ["-y", "dopaminedesk-ai-data-marketplace-mcp"],
      "env": {
        "X402_AUTO_PAY": "true",
        "X402_EVM_PRIVATE_KEY": "YOUR_DEDICATED_BUYER_WALLET_KEY",
        "X402_MAX_PAYMENT_USDC": "0.25"
      }
    }
  }
}
```

Call a product with `auto_pay: true`. The adapter refuses disabled, conflicting, invalid, or over-cap purchases. It never falls back to an uncapped payment.

## Verification and engineering scope

The [public verification hub](https://ai-data-marketplace-1042299154756.us-central1.run.app/verification) and [machine verification record](https://ai-data-marketplace-1042299154756.us-central1.run.app/.well-known/marketplace-verification.json) expose the production evidence.

I built this adapter around these constraints:

- the production OpenAPI contract is the source of truth for tool discovery;
- live contract proofs verify the source and schema without replacing the paid product;
- automatic purchasing is opt-in, locally signed, and protected by a hard per-call cap;
- conflicting, malformed, disabled, and over-cap payment attempts fail closed;
- settlement details stay attached to the delivered result for reconciliation.

Run the verification suite locally:

```bash
npm ci
npm test
```

## Production contracts

- **Store:** https://ai-data-marketplace-1042299154756.us-central1.run.app/
- **OpenAPI:** https://ai-data-marketplace-1042299154756.us-central1.run.app/openapi.json
- **Postman:** https://ai-data-marketplace-1042299154756.us-central1.run.app/postman.json
- **LLM manifest:** https://ai-data-marketplace-1042299154756.us-central1.run.app/llms.txt
- **x402 manifest:** https://ai-data-marketplace-1042299154756.us-central1.run.app/.well-known/x402
- **x402scan:** https://www.x402scan.com/server/8dd63536-ba25-40f4-b36a-7d05ed18d007

The MCP adapter builds its tool list from the production OpenAPI document. Counts, prices, availability, data mode, and source declarations come from the live contract instead of a hand-written endpoint list.

Every billable product uses x402 v2 exact payments on Base mainnet through the Coinbase CDP facilitator:

1. Call the endpoint and read the base64 `PAYMENT-REQUIRED` response header.
2. Sign the exact authorization with a compatible x402 buyer client.
3. Retry with `PAYMENT-SIGNATURE`.
4. Read settlement details from `PAYMENT-RESPONSE`.

See [PAYMENT_FLOW.md](PAYMENT_FLOW.md) for the manual and legacy confirmed-transaction paths.

## Published distribution

- [npm package](https://www.npmjs.com/package/dopaminedesk-ai-data-marketplace-mcp)
- [Official MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.jblaz6335%2Fai-data-marketplace)
- [Smithery](https://smithery.ai/server/jblaz6335/dopaminedesk-agent-data-arcade)
- [x402scan](https://www.x402scan.com/server/8dd63536-ba25-40f4-b36a-7d05ed18d007)

## License

MIT License. Open-source MCP buyer adapter and marketplace client.
