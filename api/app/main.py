from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os
import logging
from .routes import credentials, liquidity

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="TGLC API", version="0.1.0")

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
if os.getenv("ENV") == "production":
    cors_origins = [origin.strip() for origin in cors_origins if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(credentials.router)
app.include_router(liquidity.router)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"}
    )

@app.get("/")
def health():
    return {"status": "online", "network": os.getenv("XRPL_NETWORK", "testnet")}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "network": os.getenv("XRPL_NETWORK", "testnet"),
        "issuer_configured": bool(os.getenv("ISSUER_SEED"))
    }
