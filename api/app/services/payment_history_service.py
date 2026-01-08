from typing import List, Optional

from datetime import datetime
from decimal import Decimal

from app.services.xrpl_client import XRPLClient, xrpl_time_to_datetime
from app.models.payment import Payment


class PaymentHistoryService:
    """
    Read-side service for XRPL payment history.

    Responsibilities:
    - Fetch validated transactions from XRPL
    - Filter relevant transaction types
    - Normalise XRPL data into Payment domain model
    """

    SUPPORTED_TX_TYPES = {
        "Payment",
        "EscrowCreate",
        "EscrowFinish",
        "Clawback",
    }

    def __init__(self, xrpl_client: XRPLClient | None = None):
        self.xrpl = xrpl_client or XRPLClient()

    # =========================================================
    # Public API
    # =========================================================
    def get_payment_history(
        self,
        address: str,
        limit: int = 50,
        marker: Optional[dict] = None,
    ) -> dict:
        """
        Return normalised payment history.

        Output shape:
        {
            "payments": List[Payment],
            "marker": dict | None
        }
        """
        raw = self.xrpl.get_account_transactions(
            address=address,
            limit=limit,
            marker=marker,
        )

        payments: List[Payment] = []

        for entry in raw["transactions"]:
            payment = self._map_tx_entry(entry)
            if payment:
                payments.append(payment)

        return {
            "payments": payments,
            "marker": raw.get("marker"),
        }

    # =========================================================
    # Internal helpers
    # =========================================================
    def _map_tx_entry(self, entry: dict) -> Optional[Payment]:
        """
        Convert a single XRPL tx entry into a Payment model.
        Returns None if tx is not relevant.
        """
        tx = entry.get("tx")
        meta = entry.get("meta")

        if not tx or not meta:
            return None

        tx_type = tx.get("TransactionType")
        if tx_type not in self.SUPPORTED_TX_TYPES:
            return None

        # -------------------------
        # Timestamp handling
        # -------------------------
        if "date" not in tx:
            # Unvalidated / edge-case tx
            return None

        dt: datetime = xrpl_time_to_datetime(tx["date"])

        # -------------------------
        # Status mapping
        # -------------------------
        result = meta.get("TransactionResult")
        status = (
            "Completed"
            if result == "tesSUCCESS"
            else "Failed"
        )

        # -------------------------
        # Amount handling
        # -------------------------
        amount = self._extract_amount(tx)

        # -------------------------
        # Construct domain object
        # -------------------------
        return Payment(
            id=tx["hash"],
            date=dt.strftime("%Y-%m-%d"),
            time=dt.strftime("%H:%M:%S"),
            amount=float(amount),
            type=tx_type,
            status=status,
            txHash=tx["hash"],
        )

    def _extract_amount(self, tx: dict) -> Decimal:
        """
        Extract amount from XRPL transaction.

        Handles:
        - XRP (drops → XRP)
        - Issued currencies
        """
        amount = tx.get("Amount")

        if amount is None:
            return Decimal("0")

        # XRP payment (drops)
        if isinstance(amount, str):
            return Decimal(amount) / Decimal("1000000")

        # Issued currency
        if isinstance(amount, dict):
            return Decimal(amount.get("value", "0"))

        return Decimal("0")
