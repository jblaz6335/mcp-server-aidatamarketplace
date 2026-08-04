# x402 payment flow

This Model Context Protocol server discovers and exposes the 65 currently billable DopamineDesk marketplace tools from the production OpenAPI document.

## Standard x402 v2

1. Call a tool without payment fields.
2. Read `payment_required` or the original base64 `payment_required_header` from the HTTP 402 tool result.
3. Give that challenge to a compatible x402 buyer client. The buyer client signs the exact Base-USDC authorization outside this MCP adapter.
4. Retry the same MCP tool with the returned signature in `payment_signature`.
5. On success, inspect `payment_response_header` for the facilitator settlement response and use the delivered product output.

The marketplace uses the standard `PAYMENT-REQUIRED`, `PAYMENT-SIGNATURE`, and `PAYMENT-RESPONSE` flow with the exact EVM scheme on Base mainnet through PayAI.

## Capped one-call auto-pay

Set `X402_AUTO_PAY=true`, provide a dedicated buyer key through `X402_EVM_PRIVATE_KEY`, and set `X402_MAX_PAYMENT_USDC` to the largest single request the agent may authorize. A tool call with `auto_pay: true` then performs the standard challenge, local signature, settlement, and retry automatically.

The adapter refuses prices above the configured cap and refuses to combine auto-pay with previews, manual signatures, transaction hashes, or bearer credit. Use a dedicated low-balance buyer wallet. The key stays in the local MCP process and is never sent to the seller.

## Confirmed-transaction compatibility path

Older integrations can pay the invoice with an external wallet and retry with both `tx_hash` and the invoice `payment_id`. The marketplace verifies the Base-USDC transfer on-chain and consumes the transaction once.

If a live provider fails before delivery, a confirmed transaction remains retryable for the same invoice. Failed calls made with a pre-funded agent token have their deducted credit returned.

Never use a primary wallet key or seed phrase. Manual signing may remain in a separate compatible buyer client; optional auto-pay should use only a dedicated low-balance buyer key supplied through local environment configuration.
