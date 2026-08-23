# DopamineDesk MCP installation guide

Install the public npm package as a local stdio MCP server. Use the safe default configuration first. It exposes free product discovery, live previews, and manual payment workflows without a private key or automatic spending.

## Safe default configuration

```json
{
  "mcpServers": {
    "dopaminedesk-x402-marketplace": {
      "command": "npx",
      "args": ["-y", "dopaminedesk-ai-data-marketplace-mcp@2.10.1"]
    }
  }
}
```

After starting the server:

1. Call `find_marketplace_products` with a plain-language task.
2. Inspect the returned prices, sources, inputs, and preview links.
3. Call `purchase_marketplace_product` with the returned `operation_id`, product inputs, and `preview: true`.
4. Only use a paid mode after the user explicitly chooses a product and payment method.

## Payment safety

- Do not request or store a wallet private key for the default installation.
- Do not set `X402_AUTO_PAY` unless the user explicitly asks for locally signed automatic purchases.
- Never invent, copy, or transmit a payment signature or transaction hash.
- Treat the live preview and payment-required response as the authoritative price and contract.
- If automatic purchasing is later enabled, use a dedicated low-balance Base wallet and set `X402_MAX_PAYMENT_USDC` to a hard per-call cap.

## Verification

```bash
npx -y dopaminedesk-ai-data-marketplace-mcp@2.10.1
```

The server should start over stdio and expose `find_marketplace_products`, `purchase_marketplace_product`, and the product-specific tools. The public verification record is available at:

`https://ai-data-marketplace-1042299154756.us-central1.run.app/.well-known/marketplace-verification.json`
