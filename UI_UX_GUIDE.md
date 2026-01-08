# TGLC UI/UX Guide

A simple guide to the TGLC platform interface and how it interacts with the XRP Ledger.

---

## Agent Dashboard

The bank/lender view for managing liquidity and credentials.

---

### Quick Actions (UX Component)

**Purpose:** Fast access to common tasks.

**What the user sees:**
- "Create New Loan" button
- "Review Applications" button
- "View Analytics" button

**How it works:**
- Navigation shortcuts to key features
- Visual icons for quick recognition
- Responsive grid layout

---

### Portfolio Overview

**Purpose:** Show the agent's total liquidity portfolio at a glance.

**What the user sees:**
- Total Portfolio Value (XRP)
- Active Borrowers count
- Average Interest Rate
- Pending Payments count

**How it works:**
- Queries XRPL for all escrows where agent is the source account
- Aggregates amounts and calculates statistics
- Updates in real-time as escrows are created/finished

---

### Issue Credential Form

**Purpose:** Create a trustline between borrower and agent.

**What the user sees:**
- Input field for borrower's XRPL address (or auto-filled from connected wallet)
- Trust Limit field (default: 1000000)
- Currency Code field (default: CORRIDOR_ELIGIBLE)
- "Prepare Credential" button
- Transaction details display after preparation
- "Sign & Submit" button (when borrower wallet connected)

**How it works:**
1. Agent enters borrower address and clicks "Prepare Credential"
2. Backend validates address exists on XRPL
3. Backend creates unsigned `TrustSet` transaction
4. Transaction details displayed to agent
5. Borrower connects wallet matching the address
6. Borrower clicks "Sign & Submit" to sign transaction
7. Transaction submitted to XRPL via wallet
8. Trust line created on XRPL between borrower and agent
9. Borrower can now request liquidity

**XRPL Transaction:** `TrustSet`
- Account: Borrower address (must sign)
- LimitAmount: `{ currency: "CORRIDOR_ELIGIBLE", issuer: agent, value: limit }`
- Note: TrustSet transactions must be signed by the account setting the trust line (borrower), not the issuer

---

### Pending Applications Dashboard

**Purpose:** Allows agents to approve or reject liquidity requests + shows borrower metrics.

**What the user sees:**
- List of pending requests with:
  - Borrower address
  - Requested amount (XRP)
  - Business metrics (default_rate, volatility)
  - Risk score
  - Credit decision details
- "Approve" and "Reject" buttons per request

**How it works:**
1. Borrower submits liquidity request via their dashboard
2. Request appears in agent's pending list
3. Agent reviews metrics and risk score
4. On approve: `EscrowCreate` transaction submitted to XRPL
5. On reject: Borrower notified with reason
6. Escrow appears in Active Escrows table

**XRPL Transaction (on approve):** `EscrowCreate`
- Account: Agent address (signs)
- Destination: Borrower address
- Amount: Approved XRP (converted to drops)
- Condition: Crypto-condition for release

---

### Table of Active Escrows

**Purpose:** Allow agent to manage their contracts/escrows.

**What the user sees:**
- Table of active escrows:
  - Borrower address
  - Amount locked (XRP)
  - Release date
  - Status
  - Days remaining
- "Release" button (when conditions met)
- "Cancel" button (if expired)

**How it works:**
1. Displays all escrows created by agent
2. Queries XRPL for escrow objects
3. Shows countdown to release date
4. Release: submits `EscrowFinish` with fulfillment
5. Cancel: submits `EscrowCancel` after expiry

**XRPL Transactions:**
- `EscrowFinish`: Release funds to borrower
- `EscrowCancel`: Return funds to agent (only if expired)

---

## Borrower Dashboard

The business view for requesting and managing liquidity.

---

### Quick Actions (UX Component)

**Purpose:** Fast access to common tasks.

**What the user sees:**
- "Browse Loans" button
- "Make Payment" button
- "View Credit" button

**How it works:**
- Navigation shortcuts to key features
- Visual icons for quick recognition
- Responsive grid layout

---

### Portfolio Overview

**Purpose:** Show borrower's financial overview at a glance.

**What the user sees:**
- Total Borrowed (XRP)
- Active Loans count
- Credit Score
- Next Payment Due

**How it works:**
- Aggregates data from XRPL escrows and trust lines
- Calculates credit metrics
- Updates in real-time

---

### Request Liquidity

**Purpose:** Borrower requests for liquidity and AI agent finds the best agent to look for a loan → instantly creates escrow (or needs confirmation).

**What the user sees:**
- Principal DID field (auto-filled from wallet)
- Principal Address field (auto-filled, read-only when connected)
- Amount (XRP) input
- "Request Liquidity" button

**How it works:**
1. Borrower connects wallet (address auto-fills)
2. Enters desired XRP amount
3. Clicks "Request Liquidity" button
4. Backend validates credential exists (trust line)
5. BankAgent evaluates request against policy
6. If approved: `EscrowCreate` submitted to XRPL instantly
7. Funds locked in escrow for borrower
8. Transaction hash displayed with explorer link

**XRPL Transaction:** `EscrowCreate`
- Account: Agent (bank) address (signs)
- Destination: Borrower address
- Amount: Requested XRP (converted to drops)
- Condition: Crypto-condition for release

---

### My Credentials (UI for Credit Score)

**Purpose:** View issued credentials and credit score.

**What the user sees:**
- Credit score (e.g., 720)
- Score rating (Excellent/Good/Fair/Poor)
- List of active credentials:
  - Issuer (bank) address
  - Currency type
  - Credit limit
  - Status (active/revoked)
- "Request New Credential" button

**How it works:**
- Queries XRPL for trust lines where borrower is the account
- Displays each trust line as a credential
- Calculates credit score from payment history and exposure
- Status based on trust line limit (0 = revoked)

**XRPL Query:** `account_lines`
- Account: Borrower address
- Returns all trust lines (credentials)

---

### Active Loans and Make Payment

**Purpose:** Shows all escrows and allows user to make payment.

**What the user sees:**
- List of active loans:
  - Lender address
  - Amount (XRP)
  - Release date
  - Days remaining
  - Progress bar showing time until release
- Payment section:
  - Loan selector dropdown
  - Amount to pay (XRP) input
  - "Pay Now" button

**How it works:**
1. Displays escrows where borrower is destination
2. Queries XRPL for escrow objects
3. Calculates time remaining
4. For payment:
   - Borrower selects loan and enters amount
   - Clicks "Pay Now"
   - Wallet prompts for signature
   - `Payment` transaction submitted to XRPL
   - Payment recorded and loan balance updated

**XRPL Queries/Transactions:**
- `account_objects`: Query escrows (Type: "escrow")
- `Payment`: Repay loan (Account: Borrower, Destination: Lender)

---

### Payment/Transaction History

**Purpose:** View past payments and transactions.

**What the user sees:**
- Table of payments:
  - Date
  - Amount (XRP)
  - Recipient
  - Transaction hash
  - Status
- Filter by date range
- Export option

**How it works:**
- Queries XRPL transaction history
- Filters for payment transactions
- Links to XRPL Explorer for each transaction

**XRPL Query:** `account_tx`
- Account: Borrower address
- Transaction type filter: "Payment"

---

## Common Components

---

### Header

**What the user sees:**
- Logo
- Navigation links
- Role switcher (Agent/Borrower)
- Wallet connect button
- User menu

**How it works:**
- Role stored in localStorage
- Wallet connection via Crossmark/Xaman
- Navigation updates based on role

---

### Wallet Status

**What the user sees:**
- Connection status (Connected/Disconnected)
- Wallet address (shortened)
- Network indicator (Testnet/Mainnet)
- XRP balance

**How it works:**
- Polls XRPL for balance
- Shows network from env config
- Click to copy address

---

### Transaction Status

**What the user sees:**
- Loading spinner during submission
- Success message with tx hash
- Error message if failed
- Link to XRPL Explorer

**How it works:**
- Displays while `submit_and_wait` runs
- Shows result from XRPL response
- Explorer link: `https://testnet.xrpl.org/transactions/{hash}`

---

## User Flows

### Flow 1: First-Time Borrower

1. Connect wallet on homepage
2. Switch role to "Borrower"
3. View empty credentials card
4. Contact agent for credential (off-platform)
5. Agent issues credential via their dashboard
6. Borrower signs TrustSet transaction
7. Credential appears in "My Credentials" card
8. Borrower can now request liquidity

### Flow 2: Request Liquidity

1. Open "Request Liquidity" card
2. Wallet address auto-fills
3. Enter XRP amount
4. Click "Request Liquidity"
5. Wait for approval
6. View escrow in "Active Loans" card
7. Funds available after release date

### Flow 3: Agent Approves Request

1. Open "Pending Applications" card
2. Review borrower metrics
3. Click "Approve"
4. Sign EscrowCreate transaction
5. Escrow appears in "Active Escrows" card
6. Monitor until release

### Flow 4: Make Payment

1. Open "Make Payment" card
2. Select loan
3. Enter payment amount
4. Click "Pay Now"
5. Sign Payment transaction
6. View in "Payment History"

---

## XRPL Integration Summary

| Action | Transaction Type | Signed By |
|--------|-----------------|-----------|
| Issue Credential | TrustSet | Borrower |
| Approve Liquidity | EscrowCreate | Agent |
| Release Funds | EscrowFinish | Agent |
| Cancel Escrow | EscrowCancel | Agent |
| Make Payment | Payment | Borrower |
| Add Stake | EscrowCreate | Borrower |

All transactions use `submit_and_wait` for reliable confirmation.

---

## Network Configuration

| Environment | WebSocket | Use Case |
|-------------|-----------|----------|
| Testnet | `wss://s.altnet.rippletest.net:51233` | Development |
| Devnet | `wss://s.devnet.rippletest.net:51233` | Testing new features |
| Mainnet | `wss://xrplcluster.com/` | Production |

Set via `XRPL_NETWORK` environment variable.
