# TGLC API Documentation

This document describes the FastAPI backend endpoints that power the Trust-Gated Liquidity Corridors (TGLC) platform on the XRP Ledger.

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: Configure via environment variables

## Overview

The TGLC API provides services for banks and businesses to manage liquidity corridors on the XRP Ledger. It handles credential issuance, liquidity requests, and proof verification—all while maintaining security and compliance.

---

## Health & Status Endpoints

### `GET /`

**What it does**: Quick check to see if the API is running.

**Response**:
```json
{
  "status": "online",
  "network": "testnet"
}
```

**In simple terms**: Tells you the server is up and which XRPL network it's connected to (testnet or mainnet).

---

### `GET /health`

**What it does**: Detailed health check that verifies the API is properly configured.

**Response**:
```json
{
  "status": "healthy",
  "network": "testnet",
  "issuer_configured": true
}
```

**In simple terms**: Confirms the API is healthy and that the bank's issuer wallet is properly set up. If `issuer_configured` is `false`, the API can't issue credentials.

---

## Credential Endpoints

### `POST /credentials/issue`

**What it does**: Allows a bank to issue a credential token to a business, giving them permission to request liquidity in a specific corridor.

**Request Body**:
```json
{
  "principal_address": "rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "amount": "1000000",
  "currency": "CORRIDOR_ELIGIBLE"
}
```

**Parameters**:
- `principal_address` (required): The XRPL address of the business receiving the credential
- `amount` (optional): The maximum amount the business can request (default: "1000000")
- `currency` (optional): The currency code for the credential (default: "CORRIDOR_ELIGIBLE")

**Response**:
```json
{
  "transaction": { ... },
  "issuer": "rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "status": "submitted"
}
```

**In simple terms**: The bank grants a business permission to request liquidity. This creates a trust line on the XRP Ledger that acts like a credit limit. The business can now request funds up to the specified amount.

**Error Responses**:
- `400`: Invalid address format or missing required fields
- `500`: Server error during credential issuance

---

## Liquidity Endpoints

### `POST /liquidity/request`

**What it does**: Allows a business (via an AI agent) to request short-term liquidity. The system verifies the business's performance history and processes the request asynchronously.

**Request Body**:
```json
{
  "principal_did": "did:xrpl:rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "principal_address": "rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "amount_xrp": 1000,
  "proof_data": {
    "metrics": {
      "default_rate": 0.02,
      "avg_settlement_days": 5
    }
  }
}
```

**Parameters**:
- `principal_did` (required): The decentralized identifier (DID) representing the business or AI agent
- `principal_address` (required): The XRPL address of the business
- `amount_xrp` (required): The amount of XRP requested (must be greater than 0)
- `proof_data` (optional): Performance metrics proving the business's track record

**Response**:
```json
{
  "status": "processing",
  "proof_verified": true
}
```

**In simple terms**: A business requests money through their AI agent. The system checks their past performance (if provided) and starts processing the request in the background. The response tells you if the proof was valid and that processing has started.

**Error Responses**:
- `400`: Invalid address, invalid amount, or invalid proof data
- `500`: Server error during request processing

---

### `POST /liquidity/verify-proof`

**What it does**: Validates a business's performance proof without processing a liquidity request. Useful for checking proof validity before submitting a request.

**Request Body**:
```json
{
  "metrics": {
    "default_rate": 0.02,
    "avg_settlement_days": 5
  }
}
```

**Response**:
```json
{
  "valid": true,
  "confidence_score": 100,
  "default_rate": 0.02,
  "reason": "Low default rate"
}
```

**Response Fields**:
- `valid`: Whether the proof meets minimum requirements (score >= 50)
- `confidence_score`: A score from 0-100 based on performance metrics
- `default_rate`: The default rate from the proof data
- `reason`: Explanation of why the score was assigned

**In simple terms**: Checks if a business's performance history is good enough to qualify for liquidity. A higher confidence score means better rates or lower collateral requirements. The system looks at things like how often they've defaulted on past loans.

**Error Responses**:
- `400`: Invalid proof data format or missing required metrics

---

## How It All Works Together

1. **Bank issues credential** → `POST /credentials/issue`
   - Bank grants a business permission to request liquidity
   - Creates a trust line on XRPL

2. **Business requests liquidity** → `POST /liquidity/request`
   - Business (via AI agent) requests funds
   - System verifies performance proof
   - Request is processed asynchronously

3. **Verify proof separately** → `POST /liquidity/verify-proof`
   - Optional step to check proof validity before requesting

---

## Error Handling

All endpoints return standard HTTP status codes:
- `200`: Success
- `400`: Bad request (invalid input)
- `500`: Internal server error

Error responses follow this format:
```json
{
  "detail": "Error message describing what went wrong"
}
```

---

## Security Notes

- All XRPL transactions are signed server-side using the issuer's private key
- The frontend never sees or handles private keys
- CORS is configured to restrict cross-origin requests in production
- All inputs are validated before processing
- Error messages don't expose sensitive internal details

---

## XRPL Integration

The backend uses `xrpl-py` to interact with the XRP Ledger:
- **Testnet**: `wss://s.altnet.rippletest.net:51233`
- **Mainnet**: `wss://xrplcluster.com/`

The network is configured via the `XRPL_NETWORK` environment variable.

