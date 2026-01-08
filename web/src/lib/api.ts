const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface LiquidityRequest {
  principal_did?: string;
  principal_address: string;
  amount_xrp: number;
  proof_data?: Record<string, any>;
}

export interface HealthStatus {
  status: string;
  network: string;
  issuer_configured?: boolean;
}

export interface CredentialIssueResponse {
  transaction: Record<string, any>;
  issuer: string;
  status: string;
  message?: string;
  original_currency?: string;
}

export interface LiquidityRequestResponse {
  status: string;
  tx_hash?: string;
  transaction?: Record<string, any>;
  amount_xrp?: number;
  reason?: string;
  credit?: CreditScore;
  unlock_timestamp?: number;
  message?: string;
  matched_bank?: {
    name: string;
    wallet: string;
  };
}

export interface Bank {
  bank_name: string;
  wallet_address: string;
  max_per_loan: number;
  min_credit_score: number;
  balance_xrp: number;
}

export interface BankRegistration {
  bank_name: string;
  wallet_address: string;
  max_per_loan: number;
  min_credit_score?: number;
}

export interface CreditScore {
  score: number;
  rating: string;
  max_eligible: number;
  factors: {
    trust_lines: number;
    successful_payments: number;
    default_rate: number;
    volatility: number;
  };
}

export interface ProofVerificationResponse {
  valid: boolean;
  confidence_score: number;
  default_rate?: number;
}

export interface Payment {
  id: string;
  date: string;
  time: string;
  amount: number;
  type: string;
  status: string;
  txHash: string;
}

export interface PaymentHistoryResponse {
  payments: Payment[];
}

function validateXrplAddress(address: string): boolean {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(address);
}

class APIClient {
  private baseUrl = API_URL;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: { "Content-Type": "application/json", ...options.headers },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            `Endpoint not found: ${url}\n` +
            `Please ensure:\n` +
            `1. Backend server is running (uvicorn app.main:app --reload --port 8000)\n` +
            `2. Backend is accessible at ${this.baseUrl}\n` +
            `3. Route is registered correctly`
          );
        }
        
        const error = await response
          .json()
          .catch(() => ({ detail: response.statusText }));
        throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(
          `Cannot connect to backend at ${this.baseUrl}\n` +
          `Please ensure the backend server is running:\n` +
          `cd api && uvicorn app.main:app --reload --port 8000`
        );
      }
      throw error;
    }
  }

  async healthCheck(): Promise<HealthStatus> {
    return this.request<HealthStatus>("/health");
  }

  async requestLiquidity(
    data: LiquidityRequest
  ): Promise<LiquidityRequestResponse> {
    if (!validateXrplAddress(data.principal_address)) {
      throw new Error("Invalid XRPL address format");
    }
    if (data.amount_xrp <= 0 || data.amount_xrp > 1000000000) {
      throw new Error("Amount must be between 0 and 1,000,000,000 XRP");
    }
    return this.request<LiquidityRequestResponse>("/api/liquidity/request", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async verifyProof(
    proofData: Record<string, any>
  ): Promise<ProofVerificationResponse> {
    if (!proofData || typeof proofData !== "object") {
      throw new Error("Invalid proof data");
    }
    return this.request<ProofVerificationResponse>(
      "/api/liquidity/verify-proof",
      {
        method: "POST",
        body: JSON.stringify(proofData),
      }
    );
  }

  async issueCredential(
    principalAddress: string,
    amount = "1000000",
    currency = "CORRIDOR_ELIGIBLE"
  ): Promise<CredentialIssueResponse> {
    if (!validateXrplAddress(principalAddress)) {
      throw new Error("Invalid XRPL address format");
    }
    if (!/^\d+(\.\d+)?$/.test(amount)) {
      throw new Error("Amount must be a positive number");
    }
    if (
      currency.length < 3 ||
      currency.length > 40 ||
      !/^[A-Z0-9]+$/.test(currency)
    ) {
      throw new Error(
        "Currency must be 3-40 uppercase alphanumeric characters"
      );
    }
    return this.request<CredentialIssueResponse>("/api/credentials/issue", {
      method: "POST",
      body: JSON.stringify({
        principal_address: principalAddress,
        amount,
        currency,
      }),
    });
  }

  async fetchPaymentHistory(
    address: string,
    limit = 50
  ): Promise<PaymentHistoryResponse[]> {
    return this.request<PaymentHistoryResponse[]>(
      `/api/payments/history?address=${encodeURIComponent(
        address
      )}&limit=${limit}`
    );
  }

  async getCreditScore(address: string): Promise<CreditScore> {
    if (!validateXrplAddress(address)) {
      throw new Error("Invalid XRPL address format");
    }
    return this.request<CreditScore>(`/api/credentials/score/${address}`);
  }

  async registerBank(data: BankRegistration): Promise<{ status: string; bank: Bank }> {
    if (!validateXrplAddress(data.wallet_address)) {
      throw new Error("Invalid XRPL address format");
    }
    return this.request<{ status: string; bank: Bank }>("/api/banks/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async finishEscrow(borrowerWallet: string, escrowSequence: number, ownerWallet: string): Promise<{ status: string; transaction: Record<string, any>; message: string }> {
    if (!validateXrplAddress(borrowerWallet) || !validateXrplAddress(ownerWallet)) {
      throw new Error("Invalid XRPL address format");
    }
    return this.request("/api/liquidity/finish-escrow", {
      method: "POST",
      body: JSON.stringify({
        borrower_wallet: borrowerWallet,
        escrow_sequence: escrowSequence,
        owner_wallet: ownerWallet,
      }),
    });
  }
}

export const apiClient = new APIClient();
