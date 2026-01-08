# TGLC Setup Guide

## What is This?

TGLC (Trust-Gated Liquidity Corridors) lets banks issue digital credentials to businesses on the XRP Ledger. Businesses use these credentials to request short-term loans through AI agents.

**In plain English:** A bank says "this business is trustworthy" by giving them a token. The business can then borrow money automatically.

---

## Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Python | 3.9+ | [python.org](https://python.org) |
| Git | Any | [git-scm.com](https://git-scm.com) |

---

## Step 1: Install Crossmark Wallet

Crossmark is a browser extension that lets you interact with the XRP Ledger (like MetaMask for Ethereum).

1. Go to [crossmark.io](https://crossmark.io)
2. Install the browser extension
3. Create a new wallet or import existing
4. **Switch to Testnet:**
   - Click settings (gear icon)
   - Select "Testnet" network
5. **Get free test XRP:**
   - Visit [faucet.tequ.dev](https://faucet.tequ.dev)
   - Paste your wallet address
   - Click "Get Test XRP"

> **Why?** Your Crossmark wallet represents a business requesting credentials. The backend wallet (created next) represents the bank issuing them.

---

## Step 2: Clone & Install

```bash
git clone <repository-url>
cd Fintech-TGLC
```

### Backend

```bash
cd api
pip install -r requirements.txt
```

### Frontend

```bash
cd ../web
npm install
```

---

## Step 3: Generate Issuer Wallet

The "issuer" is the bank's wallet that creates credentials.

```bash
cd ..
python scripts/init_ledger.py
```

**Output:**

```
Generating new issuer wallet...
ISSUER_SEED=sEd7rBGKe4Y3c...  ← SECRET (save this)
Issuer Address: rPT1Sjq2Y...   ← PUBLIC (share this)
```

> **Under the hood:** This creates a new XRP wallet on testnet and funds it with 1000 test XRP via the faucet. The SEED is like a password—never share it.

---

## Step 4: Configure Environment

### Backend (`api/.env`)

Create `api/.env`:

```env
ISSUER_SEED=sEd7rBGKe4Y3c...
XRPL_NETWORK=testnet
```

| Variable | What it does |
|----------|--------------|
| `ISSUER_SEED` | Secret key from Step 3. Lets the backend sign transactions as the bank. |
| `XRPL_NETWORK` | `testnet` for testing, `mainnet` for real money. |

### Frontend (`web/.env.local`)

Create `web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ISSUER_ADDRESS=rPT1Sjq2Y...
NEXT_PUBLIC_XRPL_NETWORK=testnet
```

| Variable | What it does |
|----------|--------------|
| `NEXT_PUBLIC_API_URL` | Where the frontend finds the backend. |
| `NEXT_PUBLIC_ISSUER_ADDRESS` | Public address from Step 3. Frontend shows this to users. |
| `NEXT_PUBLIC_XRPL_NETWORK` | Must match backend. Tells Crossmark which network to use. |

---

## Step 5: Run

### Terminal 1 — Backend

```bash
cd api
uvicorn app.main:app --reload
```

Runs at: http://localhost:8000

### Terminal 2 — Frontend

```bash
cd web
npm run dev
```

Runs at: http://localhost:3000

---

## Step 6: Verify

| Check | URL | Expected |
|-------|-----|----------|
| Backend health | http://localhost:8000/health | `{"status": "healthy", ...}` |
| Frontend | http://localhost:3000 | Dashboard loads |
| Wallet connect | Click "Connect Crossmark" | Shows your address |

---

## How It Works

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│   Backend   │────▶│ XRP Ledger  │
│  (Next.js)  │     │  (FastAPI)  │     │  (Testnet)  │
└─────────────┘     └─────────────┘     └─────────────┘
      │                    │                    │
 Your browser        Signs txns with       Stores credentials
 + Crossmark         ISSUER_SEED           permanently
```

1. **Connect wallet** → Crossmark provides your address
2. **Issue credential** → Backend creates a trust line on XRPL
3. **Request liquidity** → Backend verifies credential, creates escrow
4. **Funds release** → Smart escrow auto-executes when conditions met

---

## API Quick Reference

### Issue Credential

```bash
curl -X POST http://localhost:8000/credentials/issue \
  -H "Content-Type: application/json" \
  -d '{"principal_address": "rYourAddress..."}'
```

### Request Liquidity

```bash
curl -X POST http://localhost:8000/liquidity/request \
  -H "Content-Type: application/json" \
  -d '{
    "principal_address": "rYourAddress...",
    "amount_xrp": 100
  }'
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `ISSUER_SEED is not set` | Create `api/.env` with the seed from Step 3 |
| `Cannot connect to wallet` | Ensure Crossmark is on Testnet |
| `Port 8000 in use` | Kill other processes or change port |
| `Module not found` | Run `pip install -r requirements.txt` or `npm install` |

---

## Security

- **Never commit `.env` files** — they're in `.gitignore`
- **ISSUER_SEED is secret** — treat it like a bank password
- **Use testnet for development** — mainnet uses real XRP
- **Frontend never sees ISSUER_SEED** — only the public address
