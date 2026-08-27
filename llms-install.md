# DopamineDesk MCP installation guide

Install the public npm package as a local stdio MCP server. Use the safe default configuration first. It exposes free product discovery, live previews, and manual payment workflows without a private key or automatic spending.

## Safe default configuration

```json
{
  "mcpServers": {
    "dopaminedesk-x402-marketplace": {
      "command": "npx",
      "args": ["-y", "dopaminedesk-ai-data-marketplace-mcp@2.11.3"],
      "env": { "X402_TOOL_MODE": "compact", "X402_AUTO_PAY": "false" }
    }
  }
}
```

After starting the server:

1. Call `find_marketplace_products` with a plain-language task.
2. Inspect `recommended_purchase`, which contains the strongest match, exact price, required inputs, and ready tool calls.
3. Replace the example values with the buyer's real inputs and run `recommended_purchase.preview_call` when available.
4. Only use a paid mode after the user explicitly chooses a product and payment method.

## Payment safety

- Do not request or store a wallet private key for the default installation.
- Do not set `X402_AUTO_PAY` unless the user explicitly asks for locally signed automatic purchases.
- Never invent, copy, or transmit a payment signature or transaction hash.
- Treat the live preview and payment-required response as the authoritative price and contract.
- If automatic purchasing is later enabled, use a dedicated low-balance Base wallet and set `X402_MAX_PAYMENT_USDC` to a hard per-call cap.

## Verification

```bash
npx -y dopaminedesk-ai-data-marketplace-mcp@2.11.3
```

The compact configuration exposes `find_marketplace_products` and `purchase_marketplace_product`. Remove `X402_TOOL_MODE` or set it to `full` to also expose the product-specific tools. Neither mode needs a key to start or browse. The public verification record is available at:

`https://ai-data-marketplace-1042299154756.us-central1.run.app/.well-known/marketplace-verification.json`

## Credit purchase path without a local wallet

The marketplace is indexed in APIHub's external x402 catalog. A buyer with APIHub credits can let APIHub sign and settle the x402 request instead of configuring a Base wallet or gas locally:

```bash
npx @apihubio/cli register
npx @apihubio/cli topup 5
npx @apihubio/cli call https://ai-data-marketplace-1042299154756.us-central1.run.app/api/v1/evm_block_number
```

APIHub is an independent third party with its own account, credit, markup, and terms. Direct x402 remains available for self-custody buyers. In either path, confirm the endpoint price before making the paid call.
