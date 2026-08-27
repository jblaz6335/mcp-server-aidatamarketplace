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
