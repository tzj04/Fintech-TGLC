import os
import threading
from pathlib import Path
from dotenv import load_dotenv

from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from xrpl.transaction import submit_and_wait


# =====================
# Load environment variables
# =====================
BASE_DIR = Path(__file__).resolve().parents[2]  # /api
load_dotenv(BASE_DIR / ".env")


class XRPLClientError(Exception):
    """Base exception for XRPL client errors."""
    # TODO for testing
    pass


class XRPLSubmissionError(XRPLClientError):
    """Raised when a transaction submission fails."""
    # TODO for testing
    pass


class XRPLClient:
    """
    Singleton gateway to the XRP Ledger.

    Responsibilities:
    - Manage network connection
    - Manage signing wallet
    - Submit transactions
    - Hide raw XRPL SDK from the rest of the app
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
            raise ValueError(f"Unsupported XRPL_NETWORK: {network}. Use 'mainnet', 'testnet', or 'devnet'")

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
    # Public interface (what services are allowed to use)
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

    def submit(self, tx):
        """
        Sign and submit a transaction to XRPL.

        All XRPL writes MUST go through this method.
        """
        try:
            result = submit_and_wait(
                transaction=tx,
                client=self._client,
                wallet=self._wallet,
            )

            if not result.is_successful():
                raise XRPLSubmissionError(
                    f"Transaction failed: {result.result}"
                )

            return result

        except XRPLSubmissionError:
            raise
        except Exception as e:
            raise XRPLSubmissionError(
                f"XRPL submission error: {e}"
            ) from e

    # =========================================================
    # Convenience helpers (optional but useful)
    # =========================================================

    def get_account_info(self):
        """
        Return basic account info for the platform wallet.
        """
        from xrpl.models.requests import AccountInfo

        try:
            req = AccountInfo(
                account=self.address,
                ledger_index="validated",
            )
            response = self._client.request(req)
            return response.result
        except Exception as e:
            raise XRPLClientError(f"Failed to fetch account info: {e}") from e
