# Add DopamineDesk to an existing workflow

I built this adapter so an agent can find a product, inspect its contract, and make an authorized purchase without a hand-maintained list of endpoints.

## Start without a wallet

Use Node.js 20 or newer. Merge the `dopaminedesk` entry from `mcp-client.json` into a stdio MCP client's configuration. Do not replace a file that already contains other servers.

For VS Code, merge the `servers.dopaminedesk` entry from `vscode-mcp.json` into `.vscode/mcp.json`. Follow the client's trust prompt. [VS Code configuration reference](https://code.visualstudio.com/docs/agents/reference/mcp-configuration).

These examples use compact mode: two tools, with the complete live catalog behind them. Auto-pay is explicitly off. No API key, wallet key, account, or deposit is needed for discovery and previews. Existing clients can keep full mode.

## Verify the integration before buying

From a checked-out copy with dependencies installed, run:

```bash
node examples/smoke-client.mjs
```

This starts the local stdio adapter, lists tools, searches for a website due diligence report, and requests the free contract preview with `example.com`. The preview describes the paid result; it is not the full report. The script never signs, pays, or runs on a schedule.

To try two buyer tasks that already have paid demand, run:

```bash
node examples/try-shopify-and-ssl.mjs
```

It asks the compact MCP client to find a Shopify catalog lookup and a TLS certificate check, then requests each free live preview. It prints the exact product price and confirms that neither preview settled a payment. The example domains are public and carry no credentials. No wallet is configured.

For a stock research and Base token security workflow, run:

```bash
node examples/try-stock-and-token.mjs
```

This finds a public-company research brief and a token audit, then requests free previews for AAPL and the Base WETH contract. It prints the listed paid price and confirms no payment was made. A preview describes the response contract and is not the full paid result. Token security signals are not a guarantee of safety; market data is not investment advice.

Coinbase-powered agents can use the same x402 endpoints; this example exercises the DopamineDesk MCP adapter, not a Coinbase account or Coinbase's payment flow. Coinbase's Bazaar search also supports a `payTo` filter: `0x8647F7D7a1368a467Ad1FF757fBc2e7167973558`. Search for `stock research` or `token audit`, with `curatedOnly: false`, to narrow results to this merchant. Check the returned resource, input schema, and current price before any purchase.

## Three places to use a paid result

| Existing workflow | Product | When to call |
| --- | --- | --- |
| Vendor onboarding | `website_due_diligence` | When a new vendor domain needs public technical checks. Keep human review for conclusions. |
| Agent-readable website checks | `audit-website-ai-search-visibility-agent-readiness` | After a meaningful website change, or on a buyer-approved review schedule. |
| Confirming a transaction | `evm_receipt` | When a specific submitted transaction needs a normalized receipt. Do not poll without a bounded retry policy. |

Start with `find_marketplace_products`, replace example inputs with actual task inputs, and inspect the returned price and preview. Reuse a fresh cached result when it answers the task. Only purchase after the buyer authorizes the product and spending limit. The adapter's cap is per call, not a monthly budget; the calling workflow must enforce its own total budget and retry limits.

For a paid call, the adapter supports a buyer-supplied payment signature or separately enabled, locally signed auto-pay. The repository README documents those options. Do not put a wallet key in a prompt, shared workflow file, or support message.

## Compatibility limits

These are client configuration files, not a claim of endorsement or an installed integration on someone else's account. The stdio protocol is tested using the MCP SDK. Each host still controls installation, tool permissions, and payment authorization. The authenticated remote `/mcp` publisher endpoint is not interchangeable with this local adapter.
