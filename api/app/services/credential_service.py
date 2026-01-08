# /api/app/services/credential_service.py

from xrpl.wallet import Wallet
from xrpl.models.transactions import TrustSet
from xrpl.models.amounts import IssuedCurrencyAmount
from xrpl.transaction import submit_and_wait, autofill
from xrpl.clients import JsonRpcClient
from .xrpl_client import XRPLClient
from ..utils.validators import validate_xrpl_address, validate_amount, validate_currency

from dotenv import load_dotenv
from pathlib import Path
import os
import logging

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
    # Prepare a TrustSet transaction (unsigned)
    # =====================
    def create_trust_set(self, principal_address: str, amount: str = "1000000", currency: str = "CORRIDOR_ELIGIBLE") -> dict:
        validate_xrpl_address(principal_address)
        validate_amount(amount)
        validate_currency(currency)

        tx = TrustSet(
            account=principal_address,
            limit_amount=IssuedCurrencyAmount(
                currency=currency,
                issuer=self.issuer_wallet.classic_address,
                value=amount
            )
        )

        # Autofill (sequence, fee, lastLedgerSequence)
        prepared_tx = autofill(tx, self.xrpl_client)
        logger.info(f"Prepared TrustSet transaction for {principal_address}")

        return {
            "transaction": prepared_tx.to_dict(),
            "issuer": self.issuer_wallet.classic_address
        }

    # =====================
    # Sign and submit TrustSet transaction
    # =====================
    def submit_trust_set(self, principal_address: str, amount: str = "1000000", currency: str = "CORRIDOR_ELIGIBLE") -> dict:
        validate_xrpl_address(principal_address)
        validate_amount(amount)
        validate_currency(currency)

        tx = TrustSet(
            account=principal_address,
            limit_amount=IssuedCurrencyAmount(
                currency=currency,
                issuer=self.issuer_wallet.classic_address,
                value=amount
            )
        )

        try:
            from xrpl.models.requests import AccountInfo
            
            account_info_req = AccountInfo(account=principal_address, ledger_index="validated")
            account_info = self.xrpl_client.request(account_info_req)
            
            if "error" in account_info.result:
                error_code = account_info.result.get("error")
                if error_code == "actNotFound":
                    raise ValueError(f"Principal account {principal_address} does not exist or is not funded. Please fund the account first using the XRPL testnet faucet: https://xrpl.org/xrp-testnet-faucet.html")
            
            if "status" in account_info.result and account_info.result["status"] == "error":
                error_code = account_info.result.get("error_code")
                if error_code == "actNotFound":
                    raise ValueError(f"Principal account {principal_address} does not exist or is not funded. Please fund the account first using the XRPL testnet faucet: https://xrpl.org/xrp-testnet-faucet.html")
            
            prepared_tx = autofill(tx, self.xrpl_client)
            logger.info(f"Prepared TrustSet transaction for {principal_address}")
            
            tx_dict = prepared_tx.to_dict()
            return {
                "transaction": tx_dict,
                "issuer": self.issuer_wallet.classic_address,
                "status": "prepared",
                "message": "Transaction prepared successfully. Principal must sign and submit this transaction."
            }
        except ValueError:
            raise
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Failed to prepare TrustSet for {principal_address}: {error_msg}", exc_info=True)
            
            if "actNotFound" in error_msg or "account not found" in error_msg.lower() or "rpcACT_NOT_FOUND" in error_msg:
                raise ValueError(f"Principal account {principal_address} does not exist or is not funded. Please fund the account first using the XRPL testnet faucet: https://xrpl.org/xrp-testnet-faucet.html")
            
            if "sequence" in error_msg.lower() or "autofill" in error_msg.lower():
                raise ValueError(f"Failed to prepare transaction. Account may not be funded. Error: {error_msg}")
            
            raise ValueError(f"Failed to prepare transaction: {error_msg}")
