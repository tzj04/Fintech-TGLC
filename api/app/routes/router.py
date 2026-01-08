from fastapi import APIRouter

from .credentials import router as credentials_router
from .liquidity import router as liquidity_router

router = APIRouter()

router.include_router(credentials_router)
router.include_router(liquidity_router)
