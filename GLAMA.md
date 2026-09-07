# Glama build and evaluation

I keep `Dockerfile.glama` as a standalone compact-mode container recipe. It installs
locked dependencies without lifecycle scripts, includes the MIT license, and runs
as the unprivileged Node user. Glama's admin UI generates its own Dockerfile from
the fields below; it does not directly use this standalone recipe. The regular
`Dockerfile` retains the full tool catalog for existing users.

## Admin configuration

After claiming the server with the repository owner's GitHub account, sync the
repository in Glama's Repository panel. In the Dockerfile panel, select Node.js 24
and set the following fields. This JavaScript package has no build script.

Build steps:

```json
["npm ci --omit=dev --ignore-scripts --no-audit --no-fund"]
```

CMD arguments:

```json
["mcp-proxy", "--", "env", "X402_TOOL_MODE=compact", "X402_AUTO_PAY=false", "node", "index.js"]
```

Leave the environment schema empty (`{"type":"object","properties":{},"required":[]}`)
and placeholder parameters at `{}`. Pin a commit only after Glama has synced it.
Glama supplies its own Debian base image and proxy/runtime setup. Review the
generated Dockerfile before starting a Build test, then inspect the test result
before making a release. The local recipe's unprivileged-user setting is not a
claim about Glama's generated runtime.

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
