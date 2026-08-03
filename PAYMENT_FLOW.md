# x402 payment flow

This Model Context Protocol server discovers and exposes the 43 currently billable DopamineDesk marketplace tools from the production OpenAPI document.

## Standard x402 v2

1. Call a tool without payment fields.
2. Read `payment_required` or the original base64 `payment_required_header` from the HTTP 402 tool result.
3. Give that challenge to a compatible x402 buyer client. The buyer client signs the exact Base-USDC authorization outside this MCP adapter.
4. Retry the same MCP tool with the returned signature in `payment_signature`.
5. On success, inspect `payment_response_header` for the facilitator settlement response and use the delivered product output.

The marketplace uses the standard `PAYMENT-REQUIRED`, `PAYMENT-SIGNATURE`, and `PAYMENT-RESPONSE` flow with the exact EVM scheme on Base mainnet through PayAI.

## Confirmed-transaction compatibility path

Older integrations can pay the invoice with an external wallet and retry with both `tx_hash` and the invoice `payment_id`. The marketplace verifies the Base-USDC transfer on-chain and consumes the transaction once.

If a live provider fails before delivery, a confirmed transaction remains retryable for the same invoice. Failed calls made with a pre-funded agent token have their deducted credit returned.

Never put a private key or seed phrase in this MCP server. Signing belongs in the buyer wallet or compatible x402 buyer client.
