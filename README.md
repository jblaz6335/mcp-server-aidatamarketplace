# AI Data Marketplace MCP Server

[![Base Mainnet](https://img.shields.io/badge/Network-Base_Mainnet-blue)](https://base.org)
[![x402 Protocol](https://img.shields.io/badge/Protocol-x402-green)](https://ai-data-marketplace-1042299154756.us-central1.run.app/.well-known/x402.json)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Server-purple)](https://modelcontextprotocol.io)

Model Context Protocol (MCP) server and machine-to-machine data API gateway powered by the **x402 Payment Protocol** on **Base Mainnet**.

The production catalog currently contains **10 billable tools** and **92 total catalog entries**. Every API response identifies its data mode as `live_source`, `curated_snapshot`, `sample`, or `service`. Sample tools are available for transparent inspection but cannot accept payment.

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
| `GET /api/v1/candles` | Live CoinGecko market price data | **0.05 USDC** |
| `POST /api/v1/enrich_leads` | Live Clearbit company suggestions | **0.10 USDC** |
| `GET /api/v1/market_research` | Live Hacker News trend data | **0.15 USDC** |
| `GET /api/v1/leads` | Curated B2B lead snapshot | **0.05 USDC** |
| `GET /api/v1/contracts` | Curated government-contract snapshot | **0.10 USDC** |
| `GET /api/v1/github_emails` | Curated developer-contact snapshot | **0.10 USDC** |
| `GET /api/v1/foreclosures` | Curated distressed-property snapshot | **0.15 USDC** |
| `GET /api/v1/signals` | Curated algorithmic-signal snapshot | **0.20 USDC** |
| `GET /api/v1/gigs` | Curated freelance-gig snapshot | **0.10 USDC** |
| `GET /api/v1/flights` | Curated flight-data snapshot | **0.05 USDC** |

Other catalog entries are labeled `sample` and return `TOOL_NOT_FOR_SALE` when called without `preview=true`.

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
