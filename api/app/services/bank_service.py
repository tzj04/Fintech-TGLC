# api/services/bank_service.py
from typing import Dict, List, Optional
import logging
from pathlib import Path
import json
from uuid import uuid4

from .xrpl_client import XRPLClient
from ..utils.validators import validate_xrpl_address

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
BANKS_FILE = DATA_DIR / "banks.json"

_banks: Dict[str, Dict] = {}


class BankService:
    def __init__(self):
        self.xrpl = XRPLClient()
        self._load_banks()

    # -------------------------
    # Load / save JSON
    # -------------------------
    def _load_banks(self):
        """Load banks from banks.json into memory."""
        global _banks
        try:
            with open(BANKS_FILE, "r") as f:
                raw_banks = json.load(f)
                _banks = {}
                for b in raw_banks:
                    # Ensure backward compatibility with older JSONs
                    bank_id = b.get("bank_id") or str(uuid4())
                    wallet_address = b["wallet_address"]
                    bank_data = {
                        "bank_id": bank_id,
                        "bank_name": b.get("bank_name", "Unnamed Bank"),
                        "wallet_address": wallet_address,
                        "credit_policy": b.get("credit_policy", {
                            "min": b.get("min_credit_score", 500),
                            "max": b.get("max_per_loan", 1000),
                            "risk_score_threshold": 300
                        }),
                        "issued_tokens": b.get("issued_tokens", []),
                        "trustlines": b.get("trustlines", []),
                        "balance_xrp": b.get("balance_xrp", 0.0),
                        "active": b.get("active", True),
                        "seed": b.get("seed")  # Include seed for auto-signing
                    }
                    _banks[wallet_address] = bank_data
                logger.info(f"Loaded banks: {list(_banks.keys())}")
        except FileNotFoundError:
            logger.warning("banks.json not found, starting with empty bank list")
            _banks = {}
        except Exception as e:
            logger.error(f"Failed to load banks.json: {e}")
            _banks = {}

    def _save_banks(self):
        """Persist in-memory banks to banks.json."""
        try:
            with open(BANKS_FILE, "w") as f:
                json.dump(list(_banks.values()), f, indent=2)
                logger.info("banks.json updated")
        except Exception as e:
            logger.error(f"Failed to save banks.json: {e}")

    # -------------------------
    # Register a new bank
    # -------------------------
    def register_bank(
        self,
        bank_name: str,
        wallet_address: str,
        max_per_loan: float,
        min_credit_score: int = 500,
        issued_tokens: Optional[List[Dict]] = None
    ) -> Dict:
        validate_xrpl_address(wallet_address)
        account_info = self.xrpl.get_account_info(wallet_address)
        balance_drops = int(account_info.get("account_data", {}).get("Balance", 0))
        balance_xrp = float(balance_drops) / 1_000_000

        bank_data = {
            "bank_id": str(uuid4()),
            "bank_name": bank_name,
            "wallet_address": wallet_address,
            "credit_policy": {
                "min": min_credit_score,
                "max": max_per_loan,
                "risk_score_threshold": 300
            },
            "issued_tokens": issued_tokens or [],
            "trustlines": [],
            "balance_xrp": balance_xrp,
            "active": True
        }

        _banks[wallet_address] = bank_data
        self._save_banks()
        logger.info(f"Bank registered: {bank_name} ({wallet_address})")
        return bank_data

    # -------------------------
    # Find banks for liquidity request
    # -------------------------
    def find_matching_banks(self, amount_xrp: float, credit_score: int) -> List[Dict]:
        matches = []
        for bank in _banks.values():
            policy = bank["credit_policy"]
            if (
                policy["max"] >= amount_xrp
                and policy["min"] <= credit_score
                and bank["balance_xrp"] >= amount_xrp
                and bank.get("active", True)
            ):
                matches.append(bank)
        # Sort by permissiveness (min_credit_score ascending)
        return sorted(matches, key=lambda x: x["credit_policy"]["min"])

    # -------------------------
    # List all banks
    # -------------------------
    def get_all_banks(self) -> List[Dict]:
        return list(_banks.values())

    # -------------------------
    # Optional: Update balances dynamically
    # -------------------------
    def refresh_balances(self):
        """Update balance_xrp for all banks from XRPL."""
        for bank in _banks.values():
            wallet_address = bank["wallet_address"]
            try:
                account_info = self.xrpl.get_account_info(wallet_address)
                balance_drops = int(account_info.get("account_data", {}).get("Balance", 0))
                bank["balance_xrp"] = float(balance_drops) / 1_000_000
            except Exception as e:
                logger.warning(f"Failed to refresh balance for {wallet_address}: {e}")
        self._save_banks()
