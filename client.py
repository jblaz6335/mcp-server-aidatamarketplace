import requests
import json

MARKETPLACE_URL = "https://ai-data-marketplace-1042299154756.us-central1.run.app"

def fetch_free_preview(endpoint="/api/v1/databento_orderflow"):
    """Fetch free preview sample without payment"""
    url = f"{MARKETPLACE_URL}{endpoint}?preview=true"
    response = requests.get(url)
    print(f"--- FREE PREVIEW ({endpoint}) ---")
    print(json.dumps(response.json(), indent=2))
    return response.json()

def fetch_paid_data(endpoint="/api/v1/databento_orderflow", tx_hash="0x...YOUR_BASE_USDC_TX_HASH"):
    """Fetch full payload using x402 payment header"""
    headers = {
        "x-402-payment-tx": tx_hash,
        "x-402-payment-id": "client-uuid-12345"
    }
    url = f"{MARKETPLACE_URL}{endpoint}"
    response = requests.get(url, headers=headers)
    print(f"--- PAID DATA ({endpoint}) ---")
    print(json.dumps(response.json(), indent=2))
    return response.json()

if __name__ == "__main__":
    fetch_free_preview()
