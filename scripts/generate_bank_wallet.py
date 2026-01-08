#!/usr/bin/env python3
"""
Generate a valid XRPL testnet wallet for bank auto-signing.
Usage: python3 generate_bank_wallet.py
"""

from xrpl.wallet import Wallet

# Generate a new test wallet
wallet = Wallet.create()

print("\n" + "="*60)
print("XRPL Testnet Wallet Generated")
print("="*60)
print(f"\nSeed:    {wallet.seed}")
print(f"Address: {wallet.classic_address}")
print(f"\nPublic Key: {wallet.public_key}")
print("\n" + "="*60)
print("UPDATE banks.json with:")
print("="*60)
print(f"""
{{
  "bank_id": "bank001",
  "bank_name": "Bank Alpha",
  "wallet_address": "{wallet.classic_address}",
  "seed": "{wallet.seed}",
  "issued_tokens": [
    {{ "currency": "USD", "issuer": "{wallet.classic_address}" }}
  ],
  "credit_policy": {{
    "min": 1,
    "max": 10000,
    "risk_score_threshold": 300
  }},
  "trustlines": [],
  "balance_xrp": 50000.0,
  "active": true
}}
""")

print("\nNext steps:")
print("1. Copy the seed and address above")
print("2. Update api/data/banks.json with the new values")
print("3. (Optional) Fund the account at: https://xrpl.org/xrp-testnet/faucet.html")
print("   OR use the Developer Console at: https://xrpl.org/resources/dev-tools/xrp-faucets/")
print("="*60)
