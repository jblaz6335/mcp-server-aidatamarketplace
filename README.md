# AI Data Marketplace MCP Server

[![Base Mainnet](https://img.shields.io/badge/Network-Base_Mainnet-blue)](https://base.org)
[![x402 Protocol](https://img.shields.io/badge/Protocol-x402-green)](https://ai-data-marketplace-1042299154756.us-central1.run.app/.well-known/x402.json)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Server-purple)](https://modelcontextprotocol.io)

Model Context Protocol (MCP) server and machine-to-machine data API gateway powered by the **x402 Payment Protocol** on **Base Mainnet**.

Provides high-precision institutional datasets—including **Databento CME Futures Orderflow (MNQ MBO/MBP)**, B2B company leads, government contract awards, crypto signals, and developer contact data.

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
curl -s "https://ai-data-marketplace-1042299154756.us-central1.run.app/api/v1/databento_orderflow?preview=true"
```

---

## Endpoints & Pricing Catalog

| Endpoint | Data Type / Description | Settlement (USDC) |
| :--- | :--- | :--- |
| `GET /api/v1/databento_orderflow` | Databento CME Futures Orderflow (MNQ MBO/MBP depth & trades) | **0.25 USDC** |
| `GET /api/v1/github_trending` | Trending AI GitHub Repositories & Star Velocity | **0.10 USDC** |
| `GET /api/v1/leads` | B2B verified company records | **0.05 USDC** |
| `POST /api/v1/enrich_leads` | Firmographics & domain enrichment | **0.10 USDC** |
| `GET /api/v1/contracts` | Federal & state government contract awards | **0.10 USDC** |
| `GET /api/v1/github_emails` | GitHub developer contact records | **0.10 USDC** |
| `GET /api/v1/foreclosures` | Real estate & debt-collected properties | **0.15 USDC** |
| `GET /api/v1/signals` | Algorithmic trading signals & metrics | **0.20 USDC** |
| `GET /api/v1/gigs` | Freelance arbitrage opportunity leads | **0.10 USDC** |
| `GET /api/v1/market_research` | Industry technology & trend reports | **0.15 USDC** |
| `GET /api/v1/flights` | Live flight tracking & route feeds | **0.05 USDC** |
| `GET /api/v1/candles` | Market price candle data | **0.05 USDC** |

---

## Integration Client (`client.py`)

```python
import requests

MARKETPLACE_URL = "https://ai-data-marketplace-1042299154756.us-central1.run.app"

# 1. Schema Evaluation (Free Preview)
preview = requests.get(f"{MARKETPLACE_URL}/api/v1/databento_orderflow?preview=true").json()
print("Preview Schema:", preview)

# 2. Paid Query (Execute via x402 header)
headers = {
    "x-402-payment-tx": "0x_YOUR_BASE_USDC_TX_HASH",
    "x-402-payment-id": "client-request-101"
}
data = requests.get(f"{MARKETPLACE_URL}/api/v1/databento_orderflow", headers=headers).json()
print("Payload Result:", data)
```

---

## License
MIT License. Open-source Model Context Protocol server.
