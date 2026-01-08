const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface LiquidityRequest {
  principal_did: string;
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
}

export interface LiquidityRequestResponse {
  status: string;
  tx_hash?: string;
  amount_xrp?: number;
  reason?: string;
}

export interface ProofVerificationResponse {
  valid: boolean;
  confidence_score: number;
  default_rate?: number;
}

function validateXrplAddress(address: string): boolean {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(address);
}

class APIClient {
  private baseUrl = API_URL;

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async healthCheck(): Promise<HealthStatus> {
    return this.request<HealthStatus>('/health');
  }

  async requestLiquidity(data: LiquidityRequest): Promise<LiquidityRequestResponse> {
    if (!validateXrplAddress(data.principal_address)) {
      throw new Error('Invalid XRPL address format');
    }
    if (data.amount_xrp <= 0 || data.amount_xrp > 1000000000) {
      throw new Error('Amount must be between 0 and 1,000,000,000 XRP');
    }
    return this.request<LiquidityRequestResponse>('/liquidity/request', { method: 'POST', body: JSON.stringify(data) });
  }

  async verifyProof(proofData: Record<string, any>): Promise<ProofVerificationResponse> {
    if (!proofData || typeof proofData !== 'object') {
      throw new Error('Invalid proof data');
    }
    return this.request<ProofVerificationResponse>('/liquidity/verify-proof', { method: 'POST', body: JSON.stringify(proofData) });
  }

  async issueCredential(principalAddress: string, amount = '1000000', currency = 'CORRIDOR_ELIGIBLE'): Promise<CredentialIssueResponse> {
    if (!validateXrplAddress(principalAddress)) {
      throw new Error('Invalid XRPL address format');
    }
    if (!/^\d+(\.\d+)?$/.test(amount)) {
      throw new Error('Amount must be a positive number');
    }
    if (currency.length < 3 || currency.length > 40 || !/^[A-Z0-9]+$/.test(currency)) {
      throw new Error('Currency must be 3-40 uppercase alphanumeric characters');
    }
    return this.request<CredentialIssueResponse>('/credentials/issue', {
      method: 'POST',
      body: JSON.stringify({ principal_address: principalAddress, amount, currency }),
    });
  }
}

export const apiClient = new APIClient();
