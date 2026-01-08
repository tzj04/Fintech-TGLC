from pydantic import BaseModel
from typing import Literal

class Payment(BaseModel):
    id: str
    date: str
    time: str
    amount: float
    type: str
    status: Literal["Completed", "Pending", "Failed"]
    txHash: str
