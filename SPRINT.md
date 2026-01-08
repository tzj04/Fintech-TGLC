# TGLC Development Roadmap

**Status:** Active Development | **Network:** Testnet/Devnet/Mainnet (configurable)

---

## Project Overview

TGLC enables banks to issue revocable credential tokens to businesses, allowing AI agents to request short-term liquidity through smart escrows on the XRP Ledger. Businesses must stake partial capital (30%) before requesting liquidity. The platform automates what traditionally requires manual bank processes, foreign account balances, and slow settlements.

**Core Flow:** Business stakes capital → Bank issues credential → AI agent requests liquidity with proof → System verifies → Smart escrow deploys → Funds release on completion

**Current State:** Basic infrastructure exists with credential issuance (prepared transactions), proof verification, and agent framework. Core blockchain integration and escrow workflows need completion.

---

## Phase 1: Fix Core Transaction Flow & Agent Integration (2h)

**Status:** ⚠️ Partially Complete — Critical issues block production use

The backend has transaction preparation but incomplete blockchain integration. Agents are instantiated incorrectly and escrow creation is missing from the liquidity flow.

| Dev | Task | Current State |
|-----|------|---------------|
| **A** | **Fix credential submission pattern** — Currently `submit_trust_set()` only prepares unsigned transactions for principals to sign. Decide on pattern: (1) Issuer signs and submits (requires issuer to pay fees), or (2) Return prepared transaction for principal to sign via wallet. If issuer submits, modify `submit_trust_set()` to use `submit_and_wait()` with `issuer_wallet`. If principal signs, update frontend to handle signing flow. *Current: `credential_service.py` line 68-120 only prepares transactions.* | ⚠️ Partial |
| **B** | **Fix agent instantiation** — `BusinessAgent` and `BankAgent` are instantiated without required dependencies in `routes/liquidity.py`. `BusinessAgent()` needs `RiskModel`, `LiquidityEngine`, `CredentialService`. `BankAgent()` needs `ProofVerifier`, `PolicyEngine`, `ExposureState`, `XRPLClient`. Fix by creating proper dependency injection or factory methods. *Current: Line 63 and 72 in `liquidity.py` will fail at runtime.* | ❌ Broken |
| **C** | **Implement escrow creation in liquidity flow** — The liquidity request flow doesn't create escrows. After `BankAgent.evaluate()` approves, create an escrow from issuer to principal using `EscrowService.submit_escrow_create()`. Return transaction hash in response. *Current: No escrow creation exists. `BankAgent.act()` references non-existent `xrpl_client.submit_payment()`.* | ❌ Missing |
| **D** | **Fix BusinessAgent.prepare_request()** — The route calls `business_agent.prepare_request()` but `BusinessAgent` only has `act()` method. Either add `prepare_request()` method or refactor route to use `act()`. The method should accept `principal_did`, `principal_address`, `amount_xrp`, `proof_metrics` and return a `LiquidityRequest` object. | ❌ Missing |

**Why this matters:** Without these fixes, the platform cannot process liquidity requests end-to-end. The agent framework exists but isn't functional.

---

## Phase 2: Complete Credential Lifecycle (1.5h)

**Status:** ❌ Not Started

Credentials must be revocable for compliance. Banks need the ability to revoke access when businesses violate terms or fail to meet obligations.

| Dev | Task | Notes |
|-----|------|-------|
| **A** | **Build credential revocation** — Create an endpoint that sets the trust line limit to zero, effectively revoking the credential. This blocks the business from requesting further liquidity while preserving the audit trail on-chain. *Create `revoke_credential()` method in `credential_service.py` that calls `submit_trust_set()` with `value="0"`. Create route `POST /credentials/revoke` that accepts `principal_address` and calls the service. Follow same signing pattern as Phase 1A.* | Must match credential issuance pattern |
| **B** | **Build credential status check** — Create an endpoint that queries the XRPL for the trust line between a business and issuer. Return whether the credential exists, its current limit, and whether it's been revoked (limit = 0). *Use `xrpl.models.requests.AccountLines` with `account=principal_address` and filter by `issuer=issuer_wallet.classic_address`. Create route `GET /credentials/{address}` that returns trust line info.* | Read-only operation |
| **C** | **Add revocation to frontend** — Add a revoke button to the credential form that calls the revocation endpoint. Show credential status (active/revoked) in the UI so banks can see which businesses still have access. *Add `revokeCredential()` method in `web/src/lib/api.ts`. Add revoke button in `CredentialForm.tsx` that calls it. Display status badge based on limit value.* | UI enhancement |

**Why this matters:** Revocable credentials are a core compliance requirement stated in the README. Without revocation, banks cannot enforce policy violations or respond to regulatory requirements.

---

## Phase 3: Capital Stake Workflow (2h)

**Status:** ❌ Not Started — Critical for README compliance

Businesses must lock partial capital (30% stake) before requesting liquidity. This reduces risk for the bank and ensures skin in the game. This is a core differentiator per README.

| Dev | Task | Dependencies |
|-----|------|--------------|
| **A** | **Build stake escrow endpoint** — Create an endpoint where businesses lock their stake in an escrow to the platform. This must happen before any liquidity request. The stake amount should be calculated as 30% of their requested liquidity limit. *Create route `POST /stake/create` that accepts `principal_address` and `liquidity_limit`. Calculate `stake_amount = liquidity_limit * 0.3`. Use `EscrowService.submit_escrow_create()` with principal's wallet (requires wallet connection), destination=issuer address. Return transaction hash.* | Requires Phase 4A (escrow query) for verification |
| **B** | **Enforce stake requirement** — Modify the liquidity request flow to check if the business has an active stake escrow. Reject requests from businesses who haven't staked. Return clear error messages explaining the stake requirement. *Before processing in `routes/liquidity.py`, query escrows for principal address using `AccountObjects` request. Filter for escrows to issuer address with status="pending". If none found, return 400 with "Stake required: Please create a stake escrow before requesting liquidity".* | Requires Phase 4A |
| **C** | **Build stake UI** — Add a stake form where businesses enter their desired liquidity limit and see the required stake (30%). Show stake status in the dashboard so businesses know if they're eligible to request liquidity. *Create `web/src/components/StakeForm.tsx` similar to `CredentialForm.tsx`. Calculate and display `stakeAmount = liquidityLimit * 0.3`. Add API method `createStake()` in `api.ts`. Show stake status in borrower dashboard.* | Frontend only |

**Why this matters:** The README specifies that businesses "lock a partial stake in escrow (e.g., 30%)—required regardless of historical performance." This is the capital efficiency mechanism that differentiates TGLC from traditional systems.

---

## Phase 4: Escrow Operations & Dashboard (2h)

**Status:** ❌ Not Started — Foundation for Phase 3

Users need to query, finish, and cancel escrows through both API and UI. This completes the escrow lifecycle and enables stake verification.

| Dev | Task | Implementation Notes |
|-----|------|---------------------|
| **A** | **Build escrow query endpoint** — Create an endpoint that queries the XRPL for all escrows associated with an address. Return pending, completed, and cancelled escrows with their amounts, conditions, and timestamps. *Create `routes/escrow.py` with `GET /escrow/{address}` route. Use `xrpl.models.requests.AccountObjects(account=address, type="escrow")`. Parse response to extract: `Amount`, `Destination`, `FinishAfter`, `CancelAfter`, `Condition`. Determine status: "pending" (no finish/cancel), "finished" (ledger shows completion), "cancelled" (ledger shows cancellation). Include in router.py.* | Required for Phase 3B |
| **B** | **Build escrow action endpoints** — Create endpoints to finish escrows (release funds to recipient) and cancel escrows (return funds to sender). Include the clawback logic that returns stake to business or forfeits it to the bank based on settlement success. *Add `POST /escrow/finish` (requires `owner_address`, `offer_sequence`, optional `fulfillment` for conditional escrows) and `POST /escrow/cancel` (requires `owner_address`, `offer_sequence`). Call `EscrowService.submit_escrow_finish()` and `submit_escrow_cancel()`. For stake escrows, implement logic: if settlement successful → return stake to business, else → forfeit to bank.* | Requires wallet signing |
| **C** | **Build escrow dashboard** — Create a table showing all escrows for the connected user. Include columns for amount, status, destination, and creation date. Add finish and cancel buttons that call the respective endpoints. *Create `web/src/components/EscrowList.tsx` that fetches from `GET /escrow/{address}` and renders a table. Add API methods `finishEscrow()` and `cancelEscrow()` in `api.ts`. Add onClick handlers for finish/cancel buttons. Show in borrower dashboard and agent dashboard.* | Frontend component |

**Why this matters:** The escrow lifecycle (create → monitor → finish/cancel) with proper stake handling is the core value proposition. The clawback mechanism protects banks while enabling capital efficiency. Phase 3 depends on this for stake verification.

---

## Phase 5: Transaction Tracking & Database (1.5h)

**Status:** ❌ Not Started — Important for production reliability

Production systems need persistent storage to track transaction states, handle failures, and provide audit trails.

| Dev | Task | Database Choice |
|-----|------|----------------|
| **A** | **Set up transaction database** — Create a SQLite/PostgreSQL schema to store transaction records: hash, type (credential/escrow/stake), status (pending/confirmed/failed), timestamp, and associated addresses. *Create `api/app/db.py` with SQLAlchemy. Create `Transaction` model: `id` (primary key), `hash` (string, unique), `tx_type` (enum: credential/escrow/stake), `status` (enum: pending/confirmed/failed), `created_at` (datetime), `address` (string), `amount` (string, optional), `metadata` (JSON, optional). Initialize database connection. For SQLite: use `sqlite:///tglc.db`. For PostgreSQL: use connection string from env.* | SQLite for dev, PostgreSQL for prod |
| **B** | **Implement transaction logging** — After every XRPL submission, write the transaction to the database. Update status when confirmation is received. This enables retry logic and provides audit history. *Import db module in `credential_service.py`, `escrow_service.py`. After `submit_and_wait()` returns, extract `hash` from `response.result`. Create Transaction record with `hash`, `tx_type`, `status="confirmed"` if successful, `status="failed"` if error. Log before submission as `status="pending"` if needed.* | Critical for audit trail |
| **C** | **Build transaction history endpoint** — Create an endpoint that returns all transactions for an address from the database. Include filters for type and status. This supplements on-chain queries with faster local lookups. *Create `routes/transactions.py` with `GET /transactions/{address}`. Accept query params: `?type=escrow&status=confirmed`. Query Transaction table filtered by `address`. Return list of transactions with pagination (limit/offset). Include in router.py.* | Read-only endpoint |

**Why this matters:** Without persistent storage, the platform loses track of transactions during restarts, can't retry failed submissions, and has no audit trail for compliance reviews.

---

## Phase 6: Error Recovery & Reliability (1.5h)

**Status:** ⚠️ Partial — Basic validation exists, retry logic missing

Production systems must handle failures gracefully. XRPL transactions can fail for many reasons (network issues, insufficient funds, sequence errors).

| Dev | Task | Current State |
|-----|------|---------------|
| **A** | **Implement retry logic** — Wrap XRPL submissions in retry logic with exponential backoff. Handle common failure cases: network timeouts, sequence number conflicts, and insufficient fees. Log all retry attempts. *Create `retry_submit()` wrapper function in `xrpl_client.py` that wraps `submit_and_wait()`. Retry up to 3 times with exponential backoff (1s, 2s, 4s). Catch `XRPLException` and check error codes: `tecUNFUNDED_PAYMENT`, `tefPAST_SEQ`, `telINSUF_FEE_P`. Don't retry on `tefMAX_LEDGER` (too late). Log each retry attempt with error details.* | ❌ Missing |
| **B** | **Fix and enhance input validation** — Some validation exists but incomplete. Fix missing `re` import in `routes/credentials.py` and `routes/liquidity.py`. Add comprehensive validation: address format, amount ranges, proof data structure. Return descriptive error messages. *Fix: Add `import re` at top of route files. Enhance: Add `@field_validator` for `amount_xrp` to check `> 0` and `<= 1_000_000_000`. Validate `principal_did` format. Add validation for `proof_data.metrics` structure if provided.* | ⚠️ Partial (missing imports) |
| **C** | **Add error boundaries** — `ErrorBoundary.tsx` exists but may not be fully integrated. Ensure it wraps main components and provides user-friendly error messages. Add global error handler for API failures. *Check if `ErrorBoundary.tsx` is used in `layout.tsx` or page components. If not, wrap main app sections. In `web/src/lib/api.ts`, catch fetch errors and format: `{ message: string, code?: string }`. Display errors in UI with retry options.* | ⚠️ Partial (exists but integration unclear) |

**Why this matters:** A single unhandled error can break the user experience or, worse, leave transactions in inconsistent states. Robust error handling is the difference between a demo and a production system.

---

## Phase 7: Security & Rate Limiting (1h)

**Status:** ⚠️ Partial — Basic CORS exists, rate limiting missing

Public APIs need protection against abuse. Rate limiting prevents denial-of-service and protects the platform's XRPL wallet from being drained by malicious actors.

| Dev | Task | Security Level |
|-----|------|----------------|
| **A** | **Add rate limiting** — Implement per-IP and per-address rate limits on all endpoints. Credential issuance and escrow creation should have stricter limits than read operations. Return 429 status with retry-after header when limits are exceeded. *Install `slowapi` package. In `main.py`, create `limiter = Limiter(key_func=get_remote_address)`. Add `@limiter.limit("10/minute")` to GET routes, `@limiter.limit("5/minute")` to POST routes. For credential/escrow endpoints, use `@limiter.limit("3/minute")`. Return 429 with `Retry-After` header on limit exceeded.* | Critical for production |
| **B** | **Add request logging** — Log all API requests with timestamp, IP, endpoint, and response status. This enables security monitoring and helps identify abuse patterns. *Create FastAPI middleware in `main.py` that logs: timestamp, method, path, client IP, status code, response time. Use structured logging (JSON format for production). Log before and after each request. Exclude health check endpoints from verbose logging.* | Important for monitoring |
| **C** | **Secure environment config** — Ensure no secrets are exposed in responses or logs. Validate that CORS is properly configured for production domains. Add health check that doesn't expose sensitive configuration. *Review all log statements: ensure `ISSUER_SEED` is never printed (only log `issuer_wallet.classic_address`). In `main.py`, validate CORS origins from env var, reject wildcard in production. Update `/health` to return only `status`, `network`, `issuer_configured` (boolean) — no addresses or seeds.* | Security critical |

**Why this matters:** An unprotected API is a liability. Rate limiting and logging are baseline security requirements for any production financial service.

---

## Phase 8: Deploy & Monitor (1h)

**Status:** ❌ Not Started — Final production step

The platform needs to be accessible and observable in production.

| Dev | Task | Deployment Target |
|-----|------|-------------------|
| **A** | **Deploy backend** — Deploy the FastAPI backend to a cloud provider. Configure environment variables for production (mainnet/testnet selection, issuer seed, database URL). Verify all endpoints respond correctly. *Create `api/Dockerfile` with Python 3.11, install dependencies from `requirements.txt`, expose port 8000. Deploy to Railway/Render/Fly.io. Set env vars: `ISSUER_SEED`, `XRPL_NETWORK`, `DATABASE_URL` (if PostgreSQL), `CORS_ORIGINS`. Test with `curl https://your-api.com/health`. Verify all routes respond.* | Railway/Render recommended |
| **B** | **Deploy frontend** — Deploy to Vercel or similar. Configure API URL environment variable. Verify production build works end-to-end with the deployed backend. *Push to GitHub, connect to Vercel. Set env vars: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_ISSUER_ADDRESS`, `NEXT_PUBLIC_XRPL_NETWORK`. Run `npm run build` locally to verify. Test full flow: connect wallet → issue credential → create stake → request liquidity → view escrows.* | Vercel recommended |
| **C** | **Set up monitoring** — Add structured logging that can be aggregated (JSON format). Log transaction submissions, API errors, and rate limit hits. Set up alerts for critical failures (database down, XRPL connection lost). *Configure Python logging in `main.py` to output JSON format: `{"timestamp": "...", "level": "...", "message": "...", "context": {...}}`. Add try/except around XRPL client initialization to log connection failures. Use platform logs (Vercel/Railway) for monitoring. Set up alerts for: 5xx errors > 10/min, XRPL connection failures, database connection failures.* | Platform-native logs |

**Why this matters:** A deployable, observable product proves the concept works in a real environment and can be maintained over time.

---

## Progress Tracker

*Status Legend: ✅ Complete | ⚠️ Partial | ❌ Not Started | 🔄 In Progress*

### Phase 1: Core Transaction Flow & Agent Integration
| Task | Dev | Status | Notes |
|------|-----|--------|-------|
| Fix credential submission pattern | A | ⚠️ | Only prepares transactions, needs signing decision |
| Fix agent instantiation | B | ❌ | Agents instantiated without dependencies |
| Implement escrow creation in liquidity flow | C | ❌ | No escrow creation exists |
| Fix BusinessAgent.prepare_request() | D | ❌ | Method doesn't exist |

### Phase 2: Credential Lifecycle
| Task | Dev | Status | Notes |
|------|-----|--------|-------|
| Build credential revocation | A | ❌ | Core compliance requirement |
| Build credential status check | B | ❌ | Required for UI |
| Add revocation to frontend | C | ❌ | UI enhancement |

### Phase 3: Capital Stake Workflow
| Task | Dev | Status | Notes |
|------|-----|--------|-------|
| Build stake escrow endpoint | A | ❌ | Depends on Phase 4A |
| Enforce stake requirement | B | ❌ | Depends on Phase 4A |
| Build stake UI | C | ❌ | Frontend component |

### Phase 4: Escrow Operations & Dashboard
| Task | Dev | Status | Notes |
|------|-----|--------|-------|
| Build escrow query endpoint | A | ❌ | Foundation for Phase 3 |
| Build escrow action endpoints | B | ❌ | Finish/cancel operations |
| Build escrow dashboard | C | ❌ | Frontend component |

### Phase 5: Transaction Tracking & Database
| Task | Dev | Status | Notes |
|------|-----|--------|-------|
| Set up transaction database | A | ❌ | SQLAlchemy setup |
| Implement transaction logging | B | ❌ | Audit trail |
| Build transaction history endpoint | C | ❌ | Read-only endpoint |

### Phase 6: Error Recovery & Reliability
| Task | Dev | Status | Notes |
|------|-----|--------|-------|
| Implement retry logic | A | ❌ | Critical for reliability |
| Fix and enhance input validation | B | ⚠️ | Missing imports, needs enhancement |
| Add error boundaries | C | ⚠️ | Component exists, integration unclear |

### Phase 7: Security & Rate Limiting
| Task | Dev | Status | Notes |
|------|-----|--------|-------|
| Add rate limiting | A | ❌ | Critical for production |
| Add request logging | B | ⚠️ | Basic logging exists, needs structure |
| Secure environment config | C | ⚠️ | CORS configured, needs review |

### Phase 8: Deploy & Monitor
| Task | Dev | Status | Notes |
|------|-----|--------|-------|
| Deploy backend | A | ❌ | Final step |
| Deploy frontend | B | ❌ | Final step |
| Set up monitoring | C | ❌ | Observability |

---

## Critical Path

**Must complete in order:**
1. Phase 1 (all tasks) — Blocks all other functionality
2. Phase 4A — Required for Phase 3
3. Phase 3 — Core README requirement
4. Phase 2 — Compliance requirement
5. Phases 5-8 — Production readiness

**Current Blocker:** Phase 1 tasks prevent the platform from processing liquidity requests end-to-end.
