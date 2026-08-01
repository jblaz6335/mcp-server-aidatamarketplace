# AI Data Marketplace MCP Server

[![Base Mainnet](https://img.shields.io/badge/Network-Base_Mainnet-blue)](https://base.org)
[![x402 Protocol](https://img.shields.io/badge/Protocol-x402-green)](https://ai-data-marketplace-1042299154756.us-central1.run.app/.well-known/x402.json)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Server-purple)](https://modelcontextprotocol.io)

An autonomous Model Context Protocol (MCP) server & machine-to-machine data marketplace powered by the **x402 Payment Protocol** on **Base Mainnet**. 

Featuring institutional **Databento CME Futures Orderflow (MNQ)**, B2B leads, government contracts, crypto signals, and developer email lists.

---

## 🌐 Live Production Endpoint

- **Base URL:** `https://ai-data-marketplace-1042299154756.us-central1.run.app`
- **OpenAPI Spec:** `https://ai-data-marketplace-1042299154756.us-central1.run.app/openapi.json`
- **LLM Manifest:** `https://ai-data-marketplace-1042299154756.us-central1.run.app/llms.txt`
- **x402 Manifest:** `https://ai-data-marketplace-1042299154756.us-central1.run.app/.well-known/x402.json`

---

## 🎁 Free Preview Mode (`?preview=true`)

Agent developers can test data quality and schemas for **free** without paying an invoice. Simply append `?preview=true` to any endpoint:

```bash
curl -s "https://ai-data-marketplace-1042299154756.us-central1.run.app/api/v1/databento_orderflow?preview=true"
```

---

## 💳 Available Endpoints & Pricing

| Endpoint | Description | Cost (USDC) |
| :--- | :--- | :--- |
| `GET /api/v1/databento_orderflow` | **Databento Institutional CME Futures Orderflow (MNQ MBO/MBP)** | **0.25 USDC** |
| `GET /api/v1/candles` | Financial crypto & asset candles | **0.05 USDC** |
| `GET /api/v1/leads` | B2B verified company leads | **0.05 USDC** |
| `POST /api/v1/enrich_leads` | Firmographics & domain enrichment | **0.10 USDC** |
| `GET /api/v1/gigs` | Freelance arbitrage gig opportunities | **0.10 USDC** |
| `GET /api/v1/signals` | Algorithmic crypto trading signals | **0.20 USDC** |
| `GET /api/v1/contracts` | Federal & state government contracts | **0.10 USDC** |
| `GET /api/v1/foreclosures` | Real estate & debt-collected properties | **0.15 USDC** |
| `GET /api/v1/github_emails` | GitHub developer contact lists | **0.10 USDC** |
| `GET /api/v1/flights` | Live flight tracking data feeds | **0.05 USDC** |

---

## ⚡ Python Integration Snippet (`client.py`)

```python
import requests

MARKETPLACE_URL = "https://ai-data-marketplace-1042299154756.us-central1.run.app"

# 1. Test Free Preview
preview = requests.get(f"{MARKETPLACE_URL}/api/v1/databento_orderflow?preview=true").json()
print("Preview:", preview)

# 2. Paid Call (Include x402 payment headers)
headers = {"x-402-payment-tx": "0x_YOUR_BASE_USDC_TX_HASH", "x-402-payment-id": "req-101"}
data = requests.get(f"{MARKETPLACE_URL}/api/v1/databento_orderflow", headers=headers).json()
print("Full Data:", data)
```

---

## 📜 License
MIT License. Open source MCP server for agentic data discovery.
