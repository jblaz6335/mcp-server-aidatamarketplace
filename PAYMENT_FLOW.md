# x402 payment flow

This Model Context Protocol server discovers and exposes the 43 currently billable DopamineDesk marketplace tools from the production OpenAPI document.

1. Call a tool without payment fields to receive its HTTP 402 invoice.
2. Send the invoice amount as USDC on Base to the invoice destination.
3. Retry the tool with both `tx_hash` and the invoice `payment_id`.
4. The marketplace verifies the Base USDC transfer on-chain and consumes the transaction once.

If a live provider fails before delivery, an on-chain payment remains retryable for the same invoice. Failed calls made with a pre-funded agent token have their deducted credit returned.

Never put a private key or seed phrase in this MCP server. It only needs the public transaction hash and payment ID after an external wallet submits the payment.
