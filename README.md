# AI Data Marketplace MCP Server

[![Base Mainnet](https://img.shields.io/badge/Network-Base_Mainnet-blue)](https://base.org)
[![x402 Protocol](https://img.shields.io/badge/Protocol-x402_v2-green)](https://ai-data-marketplace-1042299154756.us-central1.run.app/.well-known/x402)
[![x402scan](https://img.shields.io/badge/x402scan-43_resources-00c2ff)](https://www.x402scan.com/server/8dd63536-ba25-40f4-b36a-7d05ed18d007)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Server-purple)](https://modelcontextprotocol.io)

Model Context Protocol (MCP) server and machine-to-machine data API gateway powered by the **x402 Payment Protocol** on **Base Mainnet**.

## Install

Run directly with npm:

```bash
npx -y dopaminedesk-ai-data-marketplace-mcp
```

Claude Desktop or another stdio-compatible MCP client:

```json
{
  "mcpServers": {
    "dopaminedesk-data-arcade": {
      "command": "npx",
      "args": ["-y", "dopaminedesk-ai-data-marketplace-mcp"]
    }
  }
}
```

Official MCP Registry name: `io.github.jblaz6335/ai-data-marketplace`.

The production catalog contains **43 capability-audited billable tools** and **86 total public catalog entries**. The billable set consists of 36 live-source tools, 1 verified government-contract snapshot, 5 input-sensitive processors, and 1 verified payment-credit service. Of all public entries, 46 are operational and 40 are labeled preview-only fixtures. Every API response identifies its data mode, availability, billing state, and backing source.

The MCP adapter builds its tool list from the production OpenAPI document. It does not maintain a stale hand-written endpoint list.

---

## Production API Service

- **Base Service URL:** `https://ai-data-marketplace-1042299154756.us-central1.run.app`
- **OpenAPI Specification:** `https://ai-data-marketplace-1042299154756.us-central1.run.app/openapi.json`
- **Postman 1-Click Collection:** `https://ai-data-marketplace-1042299154756.us-central1.run.app/postman.json`
- **LLM Manifest:** `https://ai-data-marketplace-1042299154756.us-central1.run.app/llms.txt`
- **x402 Protocol Manifest:** `https://ai-data-marketplace-1042299154756.us-central1.run.app/.well-known/x402`
- **x402scan Marketplace Page:** `https://www.x402scan.com/server/8dd63536-ba25-40f4-b36a-7d05ed18d007`

The paid OpenAPI contract contains exactly the 43 billable products. The broader catalog endpoint retains 40 clearly labeled preview fixtures for evaluation, but those routes do not appear as purchasable OpenAPI products.

---

## Data Schema Inspection Mode

Client applications and autonomous agents can evaluate response schemas and data quality without executing a paid transaction by adding the `preview=true` parameter:

```bash
curl -s "https://ai-data-marketplace-1042299154756.us-central1.run.app/api/v1/candles?preview=true&ticker=bitcoin"
```

---

## Endpoints & Pricing Catalog

| Endpoint | Data Type / Description | Settlement (USDC) |
| :--- | :--- | :--- |
| `GET /api/v1/candles` | Live CoinGecko market price history | **0.05 USDC** |
| `GET /api/v1/stock_quotes` | Live market quote snapshot | **0.05 USDC** |
| `GET /api/v1/sec_edgar_filings` | Official SEC filing metadata and links | **0.10 USDC** |
| `GET /api/v1/token_audit` | Live GoPlus token security signals | **0.10 USDC** |
| `POST /api/v1/tx_simulator` | Read-only EVM call and gas simulation | **0.10 USDC** |
| `GET /api/v1/weather_forecast` | Live Open-Meteo forecast | **0.02 USDC** |
| `POST /api/v1/scrape_md` | Public page to bounded Markdown-like text | **0.01 USDC** |
| `POST /api/v1/enrich_leads` | Live Clearbit company suggestions | **0.10 USDC** |
| `GET /api/v1/leads` | Live official-city business registration prospects | **0.05 USDC** |
| `GET /api/v1/contracts` | 100 API-verified USAspending award records | **0.10 USDC** |
| `POST /api/v1/summarize` | Deterministic extractive summarization | **0.02 USDC** |
| `POST /api/v1/translate` | Live MyMemory translation | **0.02 USDC** |

See the production x402 manifest or OpenAPI document for the complete live list. Preview-only fixtures return `TOOL_NOT_FOR_SALE` without `preview=true`.

---

## Standard x402 v2 Payment Flow

Every billable product uses x402 v2 exact payments through the PayAI facilitator on Base mainnet:

1. Call a paid endpoint without payment and read the base64-encoded `PAYMENT-REQUIRED` response header.
2. Use an x402 v2 client and buyer wallet to sign the exact USDC authorization.
3. Retry with the resulting `PAYMENT-SIGNATURE` header.
4. On success, read the settled transaction details from `PAYMENT-RESPONSE`.

The MCP adapter returns both the decoded challenge and the original `payment_required_header`. A compatible buyer can sign that challenge and retry the same tool with the `payment_signature` input. Successful responses include `payment_response_header`.

The server advertises Bazaar discovery schemas for all 43 products. PayAI handles verification and settlement; USDC is delivered directly to the configured marketplace wallet.

## Legacy Integration Client (`client.py`)

The included Python helper preserves the confirmed-transaction fallback for older integrations that do not yet use an x402 v2 signing client:

```python
import requests

MARKETPLACE_URL = "https://ai-data-marketplace-1042299154756.us-central1.run.app"

# 1. Request the standard challenge and legacy invoice body
invoice_response = requests.get(f"{MARKETPLACE_URL}/api/v1/candles?ticker=bitcoin")
invoice = invoice_response.json()["x402_invoice"]
print("Pay this Base USDC invoice with an external wallet:", invoice)

# 2. After paying externally, retry with the real Base transaction hash and invoice ID
headers = {
    "x-402-payment-tx": "0x_YOUR_REAL_BASE_TRANSACTION_HASH",
    "x-402-payment-id": invoice["payment_id"]
}
data = requests.get(f"{MARKETPLACE_URL}/api/v1/candles?ticker=bitcoin", headers=headers).json()
print("Payload Result:", data)
```

---

## License
MIT License. Open-source Model Context Protocol server.
