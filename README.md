# AI Data Marketplace MCP Server

[![Base Mainnet](https://img.shields.io/badge/Network-Base_Mainnet-blue)](https://base.org)
[![x402 Protocol](https://img.shields.io/badge/Protocol-x402-green)](https://ai-data-marketplace-1042299154756.us-central1.run.app/.well-known/x402.json)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Server-purple)](https://modelcontextprotocol.io)

Model Context Protocol (MCP) server and machine-to-machine data API gateway powered by the **x402 Payment Protocol** on **Base Mainnet**.

The production catalog contains **43 capability-audited billable tools** and **92 total catalog entries**. The billable set consists of 36 live-source tools, 1 verified government-contract snapshot, 5 input-sensitive processors, and 1 verified payment-credit service. Of all catalog entries, 46 are operational, 40 are preview-only fixtures, and 6 are explicitly unavailable. Every API response identifies its data mode, availability, billing state, and backing source.

The MCP adapter builds its tool list from the production OpenAPI document. It does not maintain a stale hand-written endpoint list.

---

## Production API Service

- **Base Service URL:** `https://ai-data-marketplace-1042299154756.us-central1.run.app`
- **OpenAPI Specification:** `https://ai-data-marketplace-1042299154756.us-central1.run.app/openapi.json`
- **Postman 1-Click Collection:** `https://ai-data-marketplace-1042299154756.us-central1.run.app/postman.json`
- **LLM Manifest:** `https://ai-data-marketplace-1042299154756.us-central1.run.app/llms.txt`
- **x402 Protocol Manifest:** `https://ai-data-marketplace-1042299154756.us-central1.run.app/.well-known/x402.json`

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

See the production x402 manifest or OpenAPI document for the complete live list. Preview-only fixtures return `TOOL_NOT_FOR_SALE` without `preview=true`. Unavailable concepts return HTTP 501 and never accept payment.

---

## Integration Client (`client.py`)

```python
import requests

MARKETPLACE_URL = "https://ai-data-marketplace-1042299154756.us-central1.run.app"

# 1. Request an invoice
invoice_response = requests.get(f"{MARKETPLACE_URL}/api/v1/candles?ticker=bitcoin")
invoice = invoice_response.json()["x402_invoice"]
print("Pay this Base USDC invoice with an external wallet:", invoice)

# 2. After paying externally, retry with the real transaction hash and invoice ID
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
