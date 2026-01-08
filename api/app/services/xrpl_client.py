import os
import threading
from pathlib import Path
from dotenv import load_dotenv
from datetime import datetime

from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from xrpl.transaction import submit_and_wait
from xrpl.models.transactions import TrustSet, Payment, EscrowCreate, EscrowFinish, Clawback
from xrpl.models.requests import AccountInfo

# =====================
# Load environment variables
# =====================
BASE_DIR = Path(__file__).resolve().parents[2]  # /api
load_dotenv(BASE_DIR / ".env")


# =====================
# Exceptions
# =====================
class XRPLClientError(Exception):
    """Base exception for XRPL client errors."""
    pass


class XRPLSubmissionError(XRPLClientError):
    """Raised when a transaction submission fails."""
    pass


# =====================
# XRPL Client
# =====================
class XRPLClient:
    """
    Singleton gateway to the XRP Ledger.

    Responsibilities:
    - Manage network connection
    - Manage signing wallet
    - Submit transactions
    - Provide convenience helpers: trustlines, payments, escrow, clawback
    """

    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._init()
        return cls._instance

    def _init(self):
        # -------------------------
        # Network configuration
        # -------------------------
        network = os.getenv("XRPL_NETWORK", "testnet").lower()
        if network == "mainnet":
            rpc_url = "https://xrplcluster.com/"
        elif network == "testnet":
            rpc_url = "https://s.altnet.rippletest.net:51234/"
        elif network == "devnet":
            rpc_url = "https://s.devnet.rippletest.net:51234/"
        else:
            raise ValueError(f"Unsupported XRPL_NETWORK: {network}")

        self._client = JsonRpcClient(rpc_url)

        # -------------------------
        # Wallet / signer
        # -------------------------
        seed = os.getenv("ISSUER_SEED")
        if not seed:
            raise RuntimeError("ISSUER_SEED is not set in environment")
        self._wallet = Wallet.from_seed(seed)
        self._network = network

    # =========================================================
    # Properties
    # =========================================================
    @property
    def client(self) -> JsonRpcClient:
        return self._client

    @property
    def network(self) -> str:
        return self._network

    @property
    def address(self) -> str:
        return self._wallet.classic_address

    # =========================================================
    # Core submit
    # =========================================================
    def submit(self, tx):
        """Sign and submit a transaction to XRPL."""
        try:
            result = submit_and_wait(tx, self._client, self._wallet)
            if not result.is_successful():
                raise XRPLSubmissionError(f"Transaction failed: {result.result}")
            return result
        except XRPLSubmissionError:
            raise
        except Exception as e:
            raise XRPLSubmissionError(f"XRPL submission error: {e}") from e

    # =========================================================
    # Convenience helpers
    # =========================================================
    def get_account_info(self):
        """Return basic account info for the platform wallet."""
        try:
            req = AccountInfo(account=self.address, ledger_index="validated")
            response = self._client.request(req)
            return response.result
        except Exception as e:
            raise XRPLClientError(f"Failed to fetch account info: {e}") from e

    # -------------------------
    # Trustline
    # -------------------------
    def set_trustline(self, account: str, limit_amount: float, currency: str,
                      issuer: str, expiration: datetime | None = None) -> dict:
        """Set or update a TrustLine for a business account."""
        try:
            tx = TrustSet(
                account=account,
                limit_amount={
                    "currency": currency,
                    "issuer": issuer,
                    "value": str(limit_amount)
                }
            )
            response = self.submit(tx)
            result = response.result
            if expiration:
                result["expires_at"] = expiration.isoformat()
            return result
        except Exception as e:
            raise XRPLSubmissionError(f"Failed to set TrustLine: {e}") from e

    # -------------------------
    # Payment
    # -------------------------
    def submit_payment(self, destination: str, amount: float, currency: str = "XRP") -> dict:
        """Submit a payment to a destination account."""
        try:
            tx = Payment(
                account=self.address,
                amount=str(amount) if currency.upper() == "XRP" else {
                    "currency": currency,
                    "issuer": self.address,
                    "value": str(amount)
                },
                destination=destination
            )
            response = self.submit(tx)
            return response.result
        except Exception as e:
            raise XRPLSubmissionError(f"Failed to submit payment: {e}") from e

    # -------------------------
    # Escrow
    # -------------------------
    def create_escrow(self, destination: str, amount: float, finish_after: int) -> dict:
        """Lock funds in escrow until finish_after (Unix timestamp)."""
        try:
            tx = EscrowCreate(
                account=self.address,
                destination=destination,
                amount=str(amount),
                finish_after=finish_after
            )
            response = self.submit(tx)
            return response.result
        except Exception as e:
            raise XRPLSubmissionError(f"Failed to create escrow: {e}") from e

    def finish_escrow(self, owner: str, escrow_sequence: int) -> dict:
        """Release funds from escrow."""
        try:
            tx = EscrowFinish(
                owner=owner,
                offer_sequence=escrow_sequence,
                account=self.address
            )
            response = self.submit(tx)
            return response.result
        except Exception as e:
            raise XRPLSubmissionError(f"Failed to finish escrow: {e}") from e

    # -------------------------
    # Clawback
    # -------------------------
    def clawback(self, from_account: str, amount: float) -> dict:
        """Claw back issued currency"""
        try:
            tx = Clawback(
                issuer=self.address,
                from_account=from_account,
                amount=str(amount)
            )
            response = self.submit(tx)
            return response.result
        except Exception as e:
            raise XRPLSubmissionError(f"Failed to clawback funds: {e}") from e
