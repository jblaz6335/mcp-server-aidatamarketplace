import requests
import json

MARKETPLACE_URL = "https://ai-data-marketplace-1042299154756.us-central1.run.app"

def fetch_free_preview(endpoint="/api/v1/candles?ticker=bitcoin"):
    """Fetch free preview sample without payment"""
    separator = "&" if "?" in endpoint else "?"
    url = f"{MARKETPLACE_URL}{endpoint}{separator}preview=true"
    response = requests.get(url)
    print(f"--- FREE PREVIEW ({endpoint}) ---")
    print(json.dumps(response.json(), indent=2))
    return response.json()

def request_invoice(endpoint="/api/v1/candles?ticker=bitcoin"):
    """Request the Base USDC invoice for an endpoint."""
    response = requests.get(f"{MARKETPLACE_URL}{endpoint}")
    if response.status_code != 402:
        response.raise_for_status()
    return response.json()["x402_invoice"]

def fetch_paid_data(endpoint, tx_hash, payment_id):
    """Fetch a full payload after an external wallet pays the invoice."""
    headers = {
        "x-402-payment-tx": tx_hash,
        "x-402-payment-id": payment_id
    }
    url = f"{MARKETPLACE_URL}{endpoint}"
    response = requests.get(url, headers=headers)
    print(f"--- PAID DATA ({endpoint}) ---")
    print(json.dumps(response.json(), indent=2))
    return response.json()

if __name__ == "__main__":
    fetch_free_preview()
    print(json.dumps(request_invoice(), indent=2))
