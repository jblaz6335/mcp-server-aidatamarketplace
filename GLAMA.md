# Glama build and evaluation

I use `Dockerfile.glama` for Glama's stdio build. It installs locked dependencies
without lifecycle scripts, includes the MIT license, and runs as the unprivileged
Node user. The regular `Dockerfile` retains the full tool catalog for existing users.

## Admin configuration

After claiming the server with the repository owner's GitHub account, paste the
contents of `Dockerfile.glama` into Glama's Docker build configuration. The build
context is the repository root. Start the container with `node index.js` over stdio.

Keep `X402_TOOL_MODE=compact` and `X402_AUTO_PAY=false`. No credentials are required.
Do not supply a wallet key, payment signature, transaction proof, or bearer credit.
The public authenticated publisher `/mcp` interface is separate from this stdio
adapter and is not the Glama connection URL.

Initialization and `tools/list` expose `find_marketplace_products` and
`purchase_marketplace_product` without contacting the marketplace. Product discovery
and previews contact the public API. A preview must set `preview: true`; it returns
a limited live contract proof, not the paid result. Auto-pay requests are refused.
An unpaid product call may return an HTTP 402 challenge; do not authorize or retry
it with payment data during evaluation.

## No-payment verification

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
node examples/smoke-client.mjs
```

The integration tests exercise initialization, tool discovery, previews, and
auto-pay refusal against a local fixture. The payment protocol test uses a public
dummy key and a loopback fixture only; it does not settle a real payment. The smoke
client requests a free live preview with auto-pay disabled and no wallet key.

A passing local test is not a Glama evaluation. Inspect Glama's build and
introspection results, run the available quality evaluation, and make a Glama
release only after its prerequisites pass. Record the actual build, release, and
score before requesting the directory PR to be reopened. A GitHub or npm release
does not substitute for a Glama release.
