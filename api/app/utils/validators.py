import re
from decimal import Decimal
from typing import Optional


def validate_xrpl_address(address: str) -> str:
    if not isinstance(address, str) or not re.match(r'^r[1-9A-HJ-NP-Za-km-z]{25,34}$', address):
        raise ValueError("Invalid XRPL address format")
    return address


def validate_amount(amount: str) -> str:
    try:
        val = Decimal(amount)
        if val <= 0:
            raise ValueError
    except (ValueError, TypeError):
        raise ValueError(f"Invalid amount: {amount}")
    return amount


def validate_currency(currency: str) -> str:
    if not isinstance(currency, str) or not re.fullmatch(r"[A-Z0-9]{3,40}", currency):
        raise ValueError(f"Invalid XRPL issued currency: {currency}")
    return currency


def validate_xrp_amount(amount_xrp: float) -> float:
    try:
        val = Decimal(amount_xrp)
        if val <= 0:
            raise ValueError
    except (ValueError, TypeError):
        raise ValueError(f"Invalid XRP amount: {amount_xrp}")
    return amount_xrp


def validate_condition(condition: Optional[str]) -> Optional[str]:
    if condition and not re.fullmatch(r"[A-Fa-f0-9]{64,}", condition):
        raise ValueError(f"Invalid cryptographic condition (hex): {condition}")
    return condition


def validate_fulfillment(fulfillment: Optional[str]) -> Optional[str]:
    if fulfillment and not re.fullmatch(r"[A-Fa-f0-9]+", fulfillment):
        raise ValueError(f"Invalid fulfillment (hex): {fulfillment}")
    return fulfillment

