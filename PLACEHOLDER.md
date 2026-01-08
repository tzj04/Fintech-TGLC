# How to Test This Repository Locally

This guide will walk you through setting up and testing the TGLC (Trust-Gated Liquidity Corridors) platform on your local machine. This is a full-stack application with a Python backend and a Next.js frontend.

## What You Need

Before starting, make sure you have:
- **Python 3.9 or higher** installed
- **Node.js 18 or higher** installed
- **Git** (you already have this since you cloned the repo)

## Step 1: Set Up the Backend (Python API)

### 1.1 Navigate to the backend folder
```powershell
cd api
```

### 1.2 Install Python dependencies
```powershell
pip install -r requirements.txt
```

### 1.3 Generate an issuer wallet
You need to create a wallet that will act as the "bank" in this system. From the project root (not the `api` folder):

```powershell
cd ..
python scripts/init_ledger.py
```

This will output something like:
```
ISSUER_SEED=sXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
Issuer Address: rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Copy the `ISSUER_SEED` value** - you'll need it in the next step.

### 1.4 Create the backend environment file
Go back to the `api` folder and create a file named `.env`:

```powershell
cd api
```

Create `api/.env` with this content (replace `sXXXXXXXXXXXXXXXX...` with the seed from step 1.3):

```env
XRPL_NETWORK=testnet
ISSUER_SEED=sXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
CORS_ORIGINS=http://localhost:3000
ENV=development
```

**Important:** Replace `sXXXXXXXXXXXXXXXX...` with the actual seed you got from step 1.3.

### 1.5 Start the backend server
```powershell
uvicorn app.main:app --reload
```

You should see output like:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

**Keep this terminal window open** - the backend needs to keep running.

### 1.6 Verify the backend is working
Open your browser and go to: http://localhost:8000/health

You should see:
```json
{
  "status": "healthy",
  "network": "testnet",
  "issuer_configured": true
}
```

If `issuer_configured` is `false`, check that your `.env` file has the correct `ISSUER_SEED`.

---

## Step 2: Set Up the Frontend (Next.js Web App)

### 2.1 Open a NEW terminal window
Keep the backend running in the first terminal, and open a second terminal for the frontend.

### 2.2 Navigate to the frontend folder
```powershell
cd web
```

### 2.3 Install Node.js dependencies
```powershell
npm install
```

This may take a minute or two.

### 2.4 Create the frontend environment file
Create a file named `.env.local` in the `web` folder with this content:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2.5 Start the frontend server
```powershell
npm run dev
```

You should see output like:
```
- Local:        http://localhost:3000
```

### 2.6 Verify the frontend is working
Open your browser and go to: http://localhost:3000

You should see the TGLC dashboard interface.

---

## Step 3: Test the Application

Now that both servers are running, let's test the main features:

### Test 1: Issue a Credential

1. **Get a test XRPL address:**
   - Go to: https://xrpl.org/xrp-testnet-faucet.html
   - Click "Generate credentials"
   - Copy the address (starts with `r`) - you'll use this as a test "business"

2. **In the frontend (http://localhost:3000):**
   - Find the "Issue Credential" form
   - Enter:
     - **Principal Address**: Paste the testnet address you just got
     - **Amount**: `1000000` (default)
     - **Currency**: `CORRIDOR_ELIGIBLE` (default)
   - Click "Issue"
   - You should see a success message with an issuer address

3. **Verify it worked:**
   - The success message should show the transaction was submitted
   - You can verify on the XRPL testnet explorer by copying the transaction hash (if shown)

### Test 2: Request Liquidity

1. **In the frontend:**
   - Find the "Request Liquidity" form
   - Enter:
     - **Principal DID**: `did:xrpl:rYourTestAddress` (use the same address from Test 1)
     - **Principal Address**: The same testnet address from Test 1
     - **Amount (XRP)**: `100` (or any number > 0)
   - Click "Request"
   - You should see a success message with a transaction hash

2. **Verify it worked:**
   - The response should show "approved" status
   - You'll get a transaction hash - you can view it on the XRPL testnet explorer

### Test 3: Verify Proof (Optional)

You can test the proof verification endpoint directly via the API:

```powershell
curl -X POST http://localhost:8000/liquidity/verify-proof -H "Content-Type: application/json" -d "{\"metrics\": {\"default_rate\": 0.02}}"
```

Or use a tool like Postman to send a POST request to `http://localhost:8000/liquidity/verify-proof` with this body:
```json
{
  "metrics": {
    "default_rate": 0.02
  }
}
```

---

## Troubleshooting

### Backend won't start
- **Error: "ISSUER_SEED not found"**
  - Make sure you created `api/.env` file
  - Check that `ISSUER_SEED` is set correctly in the file
  - Make sure there are no extra spaces or quotes around the seed

- **Error: "Module not found"**
  - Run `pip install -r requirements.txt` again
  - Make sure you're in the `api` folder when running this

- **Port 8000 already in use**
  - Stop any other application using port 8000
  - Or change the port: `uvicorn app.main:app --reload --port 8001` (then update frontend `.env.local`)

### Frontend won't start
- **Error: "Cannot find module"**
  - Run `npm install` again
  - Make sure you're in the `web` folder

- **Error: "Failed to fetch" or CORS errors**
  - Make sure the backend is running on port 8000
  - Check that `NEXT_PUBLIC_API_URL` in `web/.env.local` is `http://localhost:8000`
  - Verify `CORS_ORIGINS` in `api/.env` includes `http://localhost:3000`

- **Port 3000 already in use**
  - Stop any other application using port 3000
  - Or the frontend will automatically use the next available port (check the terminal output)

### Health check shows `issuer_configured: false`
- Check `api/.env` file exists and has `ISSUER_SEED` set
- Make sure the seed starts with `s` and is the full value from `init_ledger.py`
- Restart the backend server after changing `.env`

---

## What's Happening Behind the Scenes

- **Backend (port 8000)**: A Python FastAPI server that handles XRPL transactions, credential issuance, and liquidity requests
- **Frontend (port 3000)**: A Next.js React application that provides the user interface
- **XRPL Testnet**: A test version of the XRP Ledger blockchain - no real money is used

When you issue a credential, the backend creates a trust line on the XRPL testnet. When you request liquidity, it creates an escrow transaction. All of this happens on the testnet, so it's safe to experiment.

---

## Next Steps

Once you've verified everything works:
- Explore the API documentation at http://localhost:8000/docs (FastAPI auto-generated docs)
- Try different amounts and addresses
- Check transactions on the XRPL testnet explorer: https://testnet.xrpl.org/
- Read the code to understand how it works

---

## Quick Reference

**Backend commands:**
```powershell
cd api
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend commands:**
```powershell
cd web
npm install
npm run dev
```

**Backend URL:** http://localhost:8000  
**Frontend URL:** http://localhost:3000  
**Backend Health Check:** http://localhost:8000/health  
**API Docs:** http://localhost:8000/docs

