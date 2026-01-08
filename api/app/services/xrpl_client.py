# api/services/xrpl_client.py
import os
import threading
from pathlib import Path
from dotenv import load_dotenv
from datetime import datetime, timedelta

from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from xrpl.transaction import submit_and_wait
from xrpl.models.transactions import TrustSet, Payment, EscrowCreate, EscrowFinish, Clawback
from xrpl.models.requests import AccountInfo, AccountLines, AccountTx

# ============================
# Load environment variables
# ============================
BASE_DIR = Path(__file__).resolve().parents[2]  # /api
load_dotenv(BASE_DIR / ".env")

# =====================
# Exceptions
# =====================
class XRPLClientError(Exception):
    pass

class XRPLSubmissionError(XRPLClientError):
    pass

# =====================
# XRPL Datetime Conversion Helper
# =====================
XRPL_EPOCH = datetime(2000, 1, 1)

def xrpl_time_to_datetime(xrpl_time: int) -> datetime:
    return XRPL_EPOCH + timedelta(seconds=xrpl_time)

# =====================
# XRPL Client Singleton
# =====================
class XRPLClient:
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
        network = os.getenv("XRPL_NETWORK", "testnet").lower()
        rpc_urls = {
            "mainnet": "https://xrplcluster.com/",
            "testnet": "https://s.altnet.rippletest.net:51234/",
            "devnet": "https://s.devnet.rippletest.net:51234/"
        }
        self._client = JsonRpcClient(rpc_urls.get(network, rpc_urls["testnet"]))
        self._network = network

        seed = os.getenv("ISSUER_SEED")
        if not seed:
            raise RuntimeError("ISSUER_SEED is not set")
        self._wallet = Wallet.from_seed(seed)

    @property
    def client(self) -> JsonRpcClient:
        return self._client

    @property
    def wallet(self) -> Wallet:
        return self._wallet

    @property
    def address(self) -> str:
        return self._wallet.classic_address

    # -------------------------
    # Core submit helper
    # -------------------------
    def submit(self, tx, wallet: Wallet | None = None) -> dict:
        wallet_to_use = wallet or self._wallet
        try:
            result = submit_and_wait(tx, self._client, wallet_to_use)
            if not result.is_successful():
                raise XRPLSubmissionError(f"Transaction failed: {result.result}")
            return result.result
        except Exception as e:
            raise XRPLSubmissionError(f"XRPL submission error: {e}") from e

    # -------------------------
    # Account info / transactions
    # -------------------------
    def get_account_info(self, address: str | None = None) -> dict:
        try:
            req = AccountInfo(account=address or self.address, ledger_index="validated")
            response = self._client.request(req)
            return response.result
        except Exception as e:
            raise XRPLClientError(f"Failed to fetch account info: {e}") from e

    def get_account_lines(self, address: str) -> list:
        try:
            req = AccountLines(account=address, ledger_index="validated")
            response = self._client.request(req)
            return response.result.get("lines", [])
        except Exception as e:
            raise XRPLClientError(f"Failed to fetch account lines: {e}") from e

    def get_account_transactions(
        self,
        address: str | None = None,
        limit: int = 50,
        marker: dict | None = None
    ) -> dict:
        try:
            req = AccountTx(
                account=address or self.address,
                ledger_index_min=-1,
                ledger_index_max=-1,
                limit=limit,
                marker=marker,
                binary=False,
                forward=False
            )
            response = self._client.request(req)
            return {
                "transactions": response.result.get("transactions", []),
                "marker": response.result.get("marker")
            }
        except Exception as e:
            raise XRPLClientError(f"Failed to fetch account transactions: {e}") from e

    # -------------------------
    # Trustline
    # -------------------------
    def set_trustline(
        self,
        account: str,
        limit_amount: float,
        currency: str,
        issuer: str,
        expiration: datetime | None = None,
        wallet: Wallet | None = None
    ) -> dict:
        wallet_to_use = wallet or self._wallet
        try:
            tx = TrustSet(
                account=account,
                limit_amount={
                    "currency": currency,
                    "issuer": issuer,
                    "value": str(limit_amount)
                }
            )
            result = self.submit(tx, wallet_to_use)
            if expiration:
                result["expires_at"] = expiration.isoformat()
            return result
        except Exception as e:
            raise XRPLSubmissionError(f"Failed to set TrustLine: {e}") from e

    # -------------------------
    # Payment
    # -------------------------
    def submit_payment(
        self,
        destination: str,
        amount: float,
        currency: str = "XRP",
        wallet: Wallet | None = None
    ) -> dict:
        wallet_to_use = wallet or self._wallet
        try:
            if currency.upper() == "XRP":
                amount_value = str(int(amount * 1_000_000))  # convert XRP to drops
            else:
                amount_value = {"currency": currency, "issuer": wallet_to_use.classic_address, "value": str(amount)}

            tx = Payment(
                account=wallet_to_use.classic_address,
                amount=amount_value,
                destination=destination
            )
            return self.submit(tx, wallet_to_use)
        except Exception as e:
            raise XRPLSubmissionError(f"Failed to submit payment: {e}") from e

    # -------------------------
    # Escrow
    # -------------------------
    def create_escrow(
        self,
        destination: str,
        amount: float,
        finish_after: int,  # Unix timestamp
        wallet: Wallet | None = None
    ) -> dict:
        wallet_to_use = wallet or self._wallet
        try:
            tx = EscrowCreate(
                account=wallet_to_use.classic_address,
                destination=destination,
                amount=str(int(amount * 1_000_000)),  # convert XRP to drops
                finish_after=finish_after
            )
            return self.submit(tx, wallet_to_use)
        except Exception as e:
            raise XRPLSubmissionError(f"Failed to create escrow: {e}") from e

    def finish_escrow(
        self,
        owner: str,
        escrow_sequence: int,
        wallet: Wallet | None = None
    ) -> dict:
        wallet_to_use = wallet or self._wallet
        try:
            tx = EscrowFinish(
                owner=owner,
                offer_sequence=escrow_sequence,
                account=wallet_to_use.classic_address
            )
            return self.submit(tx, wallet_to_use)
        except Exception as e:
            raise XRPLSubmissionError(f"Failed to finish escrow: {e}") from e

    # -------------------------
    # Clawback
    # -------------------------
    def clawback(
        self,
        from_account: str,
        amount: float,
        wallet: Wallet | None = None
    ) -> dict:
        wallet_to_use = wallet or self._wallet
        try:
            tx = Clawback(
                issuer=wallet_to_use.classic_address,
                from_account=from_account,
                amount=str(amount)
            )
            return self.submit(tx, wallet_to_use)
        except Exception as e:
            raise XRPLSubmissionError(f"Failed to clawback funds: {e}") from e

    # -------------------------
    # Helper: check bank trustline
    # -------------------------
    def has_trustline(self, bank: dict, currency: str) -> bool:
        """Return True if the bank has a trustline for the given currency."""
        for t in bank.get("trustlines", []):
            if t["currency"].upper() == currency.upper():
                return True
        return False

    # -------------------------
    # Helper: generate transaction URL
    # -------------------------
    def get_transaction_url(self, tx_hash: str) -> str:
        """
        Generate a transaction explorer URL based on network.
        
        Args:
            tx_hash: Transaction hash
            
        Returns:
            Full URL to view transaction on explorer
        """
        explorer_urls = {
            "mainnet": "https://xrpl.org/transactions",
            "testnet": "https://testnet.xrpl.org/transactions",
            "devnet": "https://devnet.xrpl.org/transactions"
        }
        base_url = explorer_urls.get(self._network, explorer_urls["testnet"])
        return f"{base_url}/{tx_hash}"

    # -------------------------
    # Helper: create wallet from seed and sign transaction
    # -------------------------
    def sign_and_submit_with_wallet(self, tx, wallet_seed: str) -> dict:
        """
        Sign and submit a transaction using a provided wallet seed.
        Useful for auto-signing transactions from bank wallets.
        """
        try:
            bank_wallet = Wallet.from_seed(wallet_seed)
            return self.submit(tx, bank_wallet)
        except Exception as e:
            raise XRPLSubmissionError(f"Failed to sign and submit with bank wallet: {e}") from e
