# TGLC 1-Day Sprint Plan

**Team:** A, B, C | **Duration:** 8 hours | **Network:** Testnet

---

## Project Overview

TGLC enables banks to issue revocable credential tokens to businesses, allowing AI agents to request short-term liquidity through smart escrows on the XRP Ledger. Businesses must stake partial capital (30%) before requesting liquidity. The platform automates what traditionally requires manual bank processes, foreign account balances, and slow settlements.

**Core Flow:** Business stakes capital → Bank issues credential → AI agent requests liquidity with proof → System verifies → Smart escrow deploys → Funds release on completion

---

## Phase 1: Fix Core Transaction Flow (1.5h)

The backend services exist but don't actually submit transactions to the blockchain. This phase makes the XRPL transactions real.

| Dev | Task |
|-----|------|
| **A** | **Fix credential submission** — The credential endpoint prepares a TrustSet transaction but never broadcasts it. Change it to actually submit the transaction so businesses receive on-chain credentials that prove their liquidity access rights. *Start by looking at `credential_service.py` — there's a `submit_trust_set()` method that actually submits. The route currently calls `create_trust_set()` instead.* |
| **B** | **Fix escrow submission** — The AI agent evaluates requests and builds escrow transactions but never submits them. Make it submit the EscrowCreate so funds actually lock on-chain when liquidity is approved. *Start by looking at `escrow_service.py` — there's a `submit_escrow_create()` method. The bot currently calls `create_escrow()` instead.* |
| **C** | **Fix liquidity response** — Currently runs escrow creation as a background task with no feedback. Change it to return the transaction hash immediately so users can track their escrow on the blockchain explorer. *Start by looking at `routes/liquidity.py` — remove the `background_tasks.add_task()` and call the agent directly, then return its result.* |

**Why this matters:** Without these fixes, the entire platform is a simulation. Nothing reaches the blockchain, which defeats the purpose of building on XRPL.

---

## Phase 2: Complete Credential Lifecycle (1.5h)

Credentials must be revocable for compliance. Banks need the ability to revoke access when businesses violate terms or fail to meet obligations.

| Dev | Task |
|-----|------|
| **A** | **Build credential revocation** — Create an endpoint that sets the trust line limit to zero, effectively revoking the credential. This blocks the business from requesting further liquidity while preserving the audit trail on-chain. *Start by copying `submit_trust_set()` in `credential_service.py` and modify it to set `value="0"` in the IssuedCurrencyAmount. Create a new route `/credentials/revoke` that calls it.* |
| **B** | **Build credential status check** — Create an endpoint that queries the XRPL for the trust line between a business and issuer. Return whether the credential exists, its current limit, and whether it's been revoked. *Start by using `xrpl.models.requests.AccountLines` to query trust lines. Create a new route `/credentials/{address}` that returns the trust line info.* |
| **C** | **Add revocation to frontend** — Add a revoke button to the credential form that calls the revocation endpoint. Show credential status (active/revoked) in the UI so banks can see which businesses still have access. *Start by adding a new API method in `web/src/lib/api.ts` for revoke, then add a button in `CredentialForm.tsx` that calls it.* |

**Why this matters:** Revocable credentials are a core compliance requirement stated in the README. Without revocation, banks cannot enforce policy violations or respond to regulatory requirements.

---

## Phase 3: Capital Stake Workflow (1.5h)

Businesses must lock partial capital (30% stake) before requesting liquidity. This reduces risk for the bank and ensures skin in the game.

| Dev | Task |
|-----|------|
| **A** | **Build stake escrow endpoint** — Create an endpoint where businesses lock their stake in an escrow to the platform. This must happen before any liquidity request. The stake amount should be calculated as 30% of their requested liquidity limit. *Start by creating a new route `/stake/create` that uses `escrow_service.submit_escrow_create()`. The destination should be the platform's issuer address.* |
| **B** | **Enforce stake requirement** — Modify the liquidity request flow to check if the business has an active stake escrow. Reject requests from businesses who haven't staked. Return clear error messages explaining the stake requirement. *Start by querying escrows for the principal address before processing in `routes/liquidity.py`. If no stake escrow exists to the issuer, return 400 with "Stake required".* |
| **C** | **Build stake UI** — Add a stake form where businesses enter their desired liquidity limit and see the required stake (30%). Show stake status in the dashboard so businesses know if they're eligible to request liquidity. *Start by creating a new component `StakeForm.tsx` similar to `LiquidityForm.tsx`. Calculate and display `amount * 0.3` as the required stake.* |

**Why this matters:** The README specifies that businesses "lock a partial stake in escrow (e.g., 30%)—required regardless of historical performance." This is the capital efficiency mechanism that differentiates TGLC from traditional systems.

---

## Phase 4: Escrow Operations & Dashboard (1.5h)

Users need to query, finish, and cancel escrows through both API and UI. This completes the escrow lifecycle.

| Dev | Task |
|-----|------|
| **A** | **Build escrow query endpoint** — Create an endpoint that queries the XRPL for all escrows associated with an address. Return pending, completed, and cancelled escrows with their amounts, conditions, and timestamps. *Start by creating `routes/escrow.py` with a `GET /{address}` route. Use `xrpl.models.requests.AccountObjects` with `type="escrow"` to query.* |
| **B** | **Build escrow action endpoints** — Create endpoints to finish escrows (release funds to recipient) and cancel escrows (return funds to sender). Include the clawback logic that returns stake to business or forfeits it to the bank based on settlement success. *Start by adding `POST /escrow/finish` and `POST /escrow/cancel` routes that call `escrow_service.submit_escrow_finish()` and `submit_escrow_cancel()`.* |
| **C** | **Build escrow dashboard** — Create a table showing all escrows for the connected user. Include columns for amount, status, destination, and creation date. Add finish and cancel buttons that call the respective endpoints. *Start by creating `EscrowList.tsx` that fetches from `/escrow/{address}` and renders a table. Add onClick handlers for finish/cancel buttons.* |

**Why this matters:** The escrow lifecycle (create → monitor → finish/cancel) with proper stake handling is the core value proposition. The clawback mechanism protects banks while enabling capital efficiency.

---

## Phase 5: Transaction Tracking & Database (1h)

Production systems need persistent storage to track transaction states, handle failures, and provide audit trails.

| Dev | Task |
|-----|------|
| **A** | **Set up transaction database** — Create a SQLite/PostgreSQL schema to store transaction records: hash, type (credential/escrow/stake), status (pending/confirmed/failed), timestamp, and associated addresses. *Start by creating `api/app/db.py` with SQLAlchemy models. Create a `Transaction` model with fields: id, hash, tx_type, status, created_at, address.* |
| **B** | **Implement transaction logging** — After every XRPL submission, write the transaction to the database. Update status when confirmation is received. This enables retry logic and provides audit history. *Start by importing the db module in each service file. After `submit_and_wait()` returns, create a Transaction record with the result hash and status.* |
| **C** | **Build transaction history endpoint** — Create an endpoint that returns all transactions for an address from the database. Include filters for type and status. This supplements on-chain queries with faster local lookups. *Start by creating `routes/transactions.py` with `GET /{address}` that queries the Transaction table. Add optional query params `?type=escrow&status=confirmed`.* |

**Why this matters:** Without persistent storage, the platform loses track of transactions during restarts, can't retry failed submissions, and has no audit trail for compliance reviews.

---

## Phase 6: Error Recovery & Reliability (1h)

Production systems must handle failures gracefully. XRPL transactions can fail for many reasons (network issues, insufficient funds, sequence errors).

| Dev | Task |
|-----|------|
| **A** | **Implement retry logic** — Wrap XRPL submissions in retry logic with exponential backoff. Handle common failure cases: network timeouts, sequence number conflicts, and insufficient fees. Log all retry attempts. *Start by creating a wrapper function in `xrpl_client.py` that catches exceptions from `submit_and_wait()` and retries up to 3 times with 1s, 2s, 4s delays.* |
| **B** | **Add input validation** — Validate all API inputs before processing: address format, amount ranges, proof data structure. Return descriptive error messages that help users fix their requests. *Start by adding Pydantic validators to request models in each route file. Use `@field_validator` decorators to check address format (starts with 'r', 25-34 chars).* |
| **C** | **Add error boundaries** — Wrap frontend components in error boundaries so failures don't crash the entire app. Show user-friendly error messages instead of raw exceptions. Add a global error handler for API failures. *Start by creating `ErrorBoundary.tsx` as a class component with `componentDidCatch`. Wrap main components in `page.tsx`. In `api.ts`, catch errors and format them nicely.* |

**Why this matters:** A single unhandled error can break the user experience or, worse, leave transactions in inconsistent states. Robust error handling is the difference between a demo and a production system.

---

## Phase 7: Security & Rate Limiting (0.5h)

Public APIs need protection against abuse. Rate limiting prevents denial-of-service and protects the platform's XRPL wallet from being drained by malicious actors.

| Dev | Task |
|-----|------|
| **A** | **Add rate limiting** — Implement per-IP and per-address rate limits on all endpoints. Credential issuance and escrow creation should have stricter limits than read operations. Return 429 status with retry-after header when limits are exceeded. *Start by installing `slowapi` package. In `main.py`, create a Limiter and add `@limiter.limit("5/minute")` decorators to POST routes.* |
| **B** | **Add request logging** — Log all API requests with timestamp, IP, endpoint, and response status. This enables security monitoring and helps identify abuse patterns. *Start by creating a FastAPI middleware in `main.py` that logs request info before/after each handler. Use Python's `logging` module with a structured format.* |
| **C** | **Secure environment config** — Ensure no secrets are exposed in responses or logs. Validate that CORS is properly configured for production domains. Add health check that doesn't expose sensitive configuration. *Start by reviewing all log statements to ensure ISSUER_SEED is never printed. In `main.py`, update CORS origins for production. Make `/health` return only status, not config details.* |

**Why this matters:** An unprotected API is a liability. Rate limiting and logging are baseline security requirements for any production financial service.

---

## Phase 8: Deploy & Monitor (0.5h)

The platform needs to be accessible and observable in production.

| Dev | Task |
|-----|------|
| **A** | **Deploy backend** — Deploy the FastAPI backend to a cloud provider. Configure environment variables for production (mainnet/testnet selection, issuer seed, database URL). Verify all endpoints respond correctly. *Start by creating a `Dockerfile` or using Railway/Render. Set env vars in the deployment dashboard. Test with `curl https://your-api.com/health`.* |
| **B** | **Deploy frontend** — Deploy to Vercel or similar. Configure API URL environment variable. Verify production build works end-to-end with the deployed backend. *Start by pushing to GitHub and connecting to Vercel. Set `NEXT_PUBLIC_API_URL` in Vercel's environment settings. Run through the full flow on the deployed site.* |
| **C** | **Set up monitoring** — Add structured logging that can be aggregated (JSON format). Log transaction submissions, API errors, and rate limit hits. Set up alerts for critical failures (database down, XRPL connection lost). *Start by configuring Python logging to output JSON. Add try/except around XRPL client creation to log connection failures. Use Vercel/Railway built-in logs to monitor.* |

**Why this matters:** A deployable, observable product proves the concept works in a real environment and can be maintained over time.

---

## Progress Tracker

*Add ✅ next to completed items and commit to track progress*

### Phase 1: Core Transaction Flow
| Task | Dev | Status |
|------|-----|--------|
| Fix credential submission | A | |
| Fix escrow submission | B |✅|
| Fix liquidity response | C |✅|

### Phase 2: Credential Lifecycle
| Task | Dev | Status |
|------|-----|--------|
| Build credential revocation | A | |
| Build credential status check | B | |
| Add revocation to frontend | C | |

### Phase 3: Capital Stake Workflow
| Task | Dev | Status |
|------|-----|--------|
| Build stake escrow endpoint | A | |
| Enforce stake requirement | B | |
| Build stake UI | C | |

### Phase 4: Escrow Operations & Dashboard
| Task | Dev | Status |
|------|-----|--------|
| Build escrow query endpoint | A | |
| Build escrow action endpoints | B | |
| Build escrow dashboard | C | |

### Phase 5: Transaction Tracking & Database
| Task | Dev | Status |
|------|-----|--------|
| Set up transaction database | A | |
| Implement transaction logging | B | |
| Build transaction history endpoint | C | |

### Phase 6: Error Recovery & Reliability
| Task | Dev | Status |
|------|-----|--------|
| Implement retry logic | A | |
| Add input validation | B | |
| Add error boundaries | C | |

### Phase 7: Security & Rate Limiting
| Task | Dev | Status |
|------|-----|--------|
| Add rate limiting | A | |
| Add request logging | B | |
| Secure environment config | C | |

### Phase 8: Deploy & Monitor
| Task | Dev | Status |
|------|-----|--------|
| Deploy backend | A | |
| Deploy frontend | B | |
| Set up monitoring | C | |
