# /api/app/services/credential_service.py

from xrpl.wallet import Wallet
from xrpl.models.transactions import TrustSet
from xrpl.models.amounts import IssuedCurrencyAmount
from xrpl.transaction import safe_sign_and_autofill_transaction, send_reliable_submission
from xrpl.clients import JsonRpcClient
from .xrpl_client import XRPLClient

from dotenv import load_dotenv
from pathlib import Path
import os
import logging
import decimal
import re

# =====================
# Setup logging
# =====================
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# =====================
# Load environment variables
# =====================
BASE_DIR = Path(__file__).resolve().parents[2]  # /api
load_dotenv(BASE_DIR / ".env")


class CredentialService:
    def __init__(self):
        self.xrpl_client: JsonRpcClient = XRPLClient().client
        seed = os.getenv("ISSUER_SEED")
        if not seed:
            raise ValueError("ISSUER_SEED not found in environment variables")
        self.issuer_wallet = Wallet.from_seed(seed)
        logger.info(f"Issuer wallet loaded: {self.issuer_wallet.classic_address}")

    # =====================
    # Validation helpers
    # =====================
    @staticmethod
    def validate_address(address: str):
        if not isinstance(address, str) or not address.startswith("r") or len(address) < 25:
            raise ValueError(f"Invalid XRPL address: {address}")

    @staticmethod
    def validate_amount(amount: str):
        try:
            val = decimal.Decimal(amount)
            if val <= 0:
                raise ValueError
        except:
            raise ValueError(f"Invalid amount: {amount}")

    @staticmethod
    def validate_currency(currency: str):
        if not isinstance(currency, str) or not re.fullmatch(r"[A-Z0-9]{3,40}", currency):
            raise ValueError(f"Invalid XRPL issued currency: {currency}")

    # =====================
    # Prepare a TrustSet transaction (unsigned)
    # =====================
    def create_trust_set(self, principal_address: str, amount: str = "1000000", currency: str = "CORRIDOR_ELIGIBLE") -> dict:
        # Validation
        self.validate_address(principal_address)
        self.validate_amount(amount)
        self.validate_currency(currency)

        tx = TrustSet(
            account=principal_address,
            limit_amount=IssuedCurrencyAmount(
                currency=currency,
                issuer=self.issuer_wallet.classic_address,
                value=amount
            )
        )

        # Autofill (sequence, fee, lastLedgerSequence)
        prepared_tx = self.xrpl_client.autofill(tx)
        logger.info(f"Prepared TrustSet transaction for {principal_address}")

        return {
            "transaction": prepared_tx.to_dict(),
            "issuer": self.issuer_wallet.classic_address
        }

    # =====================
    # Sign and submit TrustSet transaction
    # =====================
    def submit_trust_set(self, principal_address: str, amount: str = "1000000", currency: str = "CORRIDOR_ELIGIBLE") -> dict:
        self.validate_address(principal_address)
        self.validate_amount(amount)
        self.validate_currency(currency)

        tx = TrustSet(
            account=principal_address,
            limit_amount=IssuedCurrencyAmount(
                currency=currency,
                issuer=self.issuer_wallet.classic_address,
                value=amount
            )
        )

        try:
            # Sign and autofill transaction
            signed_tx = safe_sign_and_autofill_transaction(tx, self.issuer_wallet, self.xrpl_client)
            # Submit transaction and wait for confirmation
            response = send_reliable_submission(signed_tx, self.xrpl_client)
            logger.info(f"TrustSet submitted successfully for {principal_address}. Hash: {response.result.get('tx_json', {}).get('hash')}")
            return response.result
        except Exception as e:
            logger.error(f"Failed to submit TrustSet for {principal_address}: {e}")
            raise
