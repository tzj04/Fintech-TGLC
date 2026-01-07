# TGLC Setup Guide

## What is TGLC?

Trust-Gated Liquidity Corridors - a platform enabling banks to issue credentials to businesses for requesting short-term liquidity through AI agents on the XRP Ledger.

## Prerequisites

- Node.js v18+
- Python v3.9+
- Git

## Quick Start

### 1. Clone Repository

```powershell
git clone <repository-url>
cd Fintech-TGLC
```

### 2. Backend Setup

```powershell
cd api

# (Recommended) Create and activate virtual environment, skip if not using a virual environment
python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env
```

### 3. Generate Issuer Wallet

```powershell
cd ..
python scripts/init_ledger.py
```

Output will show:

```
ISSUER_SEED=sXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
Issuer Address: rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 4. Configure Backend

The `.env.example` file contains all required backend environment variables
with safe defaults. Copying it ensures no variables are missing at runtime.

You must manually set:

- ISSUER_SEED
- XRPL_NETWORK (if not using default)

```
ISSUER_SEED=sXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 5. Start Backend

```powershell
cd api
uvicorn app.main:app --reload
```

Backend: http://localhost:8000

**Production:** `uvicorn app.main:app --host 0.0.0.0 --port 8000`

### 6. Frontend Setup

```powershell
cd web
npm install
copy .env.local.example .env.local
```

Edit `web/.env.local` and add the Issuer Address:

```
NEXT_PUBLIC_ISSUER_ADDRESS=rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 7. Start Frontend

```powershell
npm run dev
```

Frontend: http://localhost:3000

## Verify Installation

- Backend health: http://localhost:8000/health
- Frontend: http://localhost:3000

## API Endpoints

### Health

- `GET /health` - System status

### Credentials

- `POST /credentials/issue` - Issue credential token

```json
{
  "principal_address": "rXXX...",
  "amount": "1000000",
  "currency": "CORRIDOR_ELIGIBLE"
}
```

### Liquidity

- `POST /liquidity/request` - Request liquidity

```json
{
  "principal_did": "did:xrpl:...",
  "principal_address": "rXXX...",
  "amount_xrp": 1000,
  "proof_data": {"metrics": {...}}
}
```

- `POST /liquidity/verify-proof` - Verify performance proof

```json
{
  "metrics": {
    "default_rate": 0.02,
    "avg_settlement_days": 5
  }
}
```

## How It Works

1. **Bank creates wallet** → runs `init_ledger.py`
2. **Bank issues credentials** → gives businesses access tokens
3. **Business requests liquidity** → AI agent evaluates request
4. **System verifies proof** → checks business performance
5. **Smart escrow executes** → automatically releases funds

## Features

- **Credential Management** - Banks issue/revoke access tokens on XRPL
- **Liquidity Requests** - Businesses request funds through API
- **Proof Verification** - Validates business performance history
- **Smart Escrows** - Automated fund release/clawback

## Project Structure

```
tglc/
├── api/              # Backend (Python/FastAPI)
│   ├── routes/       # API endpoints
│   ├── services/     # XRPL operations
│   └── agent/        # AI agent logic
├── web/              # Frontend (Next.js/React)
│   ├── lib/          # XRPL utilities
│   └── components/   # UI components
└── scripts/          # Setup scripts
```

## Environment Variables

**Backend (api/.env):**

- `ISSUER_SEED` - Secret key (from init_ledger.py)
- `XRPL_NETWORK` - "testnet" or "mainnet"

**Frontend (web/.env.local):**

- `NEXT_PUBLIC_ISSUER_ADDRESS` - Public address (from init_ledger.py)
- `NEXT_PUBLIC_XRPL_NETWORK` - "testnet" or "mainnet"

## Troubleshooting

**Linter errors about xrpl imports:**

- Run `pip install -r requirements.txt` from `api/` directory
- Restart your IDE

**Missing ISSUER_SEED:**

- Run `python scripts/init_ledger.py` from project root

**Port already in use:**

- Change ports in `.env` files or stop other services

**Note on Virtual Environments:**

- Venv is optional for local development
- If you use venv: `python -m venv venv` then `.\venv\Scripts\activate`
- To exit venv: type `deactivate` or close terminal

## Security Notes

- Never commit `.env` files (already in `.gitignore`)
- ISSUER_SEED is secret - keep it safe
- Frontend never sees ISSUER_SEED
- Use testnet for development
- CORS is restricted in production (set `ENV=production` and `CORS_ORIGINS`)
- All inputs are validated (XRPL addresses, amounts, etc.)
- Error messages don't expose internal details
