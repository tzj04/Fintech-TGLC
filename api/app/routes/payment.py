from fastapi import APIRouter, Query, HTTPException

from app.services.payment_history_service import PaymentHistoryService

router = APIRouter(
    prefix="/payments",
    tags=["payments"],
)


@router.get("/history")
def get_payment_history(
    address: str = Query(..., description="XRPL account address"),
    limit: int = Query(50, ge=1, le=100),
):
    """
    Return recent XRPL-backed payment history.

    Notes:
    - Only validated transactions
    - Most recent first
    - No pagination (v1)
    """
    try:
        service = PaymentHistoryService()
        result = service.get_payment_history(
            address=address,
            limit=limit,
        )
        # Hide marker for now
        return result["payments"]
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch payment history: {e}",
        )
