'use client';

import { useState } from 'react';
import { apiClient, ProofVerificationResponse } from '@/lib/api';
import { Button, Input } from './ui';

export function ProofVerifier() {
  const [proofData, setProofData] = useState('{"metrics": {"default_rate": 0.02, "avg_settlement_days": 5}}');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProofVerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = JSON.parse(proofData);
      const response = await apiClient.verifyProof(data);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify proof');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Verify Proof</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-foreground">
            Proof Data (JSON)
          </label>
          <textarea
            value={proofData}
            onChange={(e) => setProofData(e.target.value)}
            rows={4}
            required
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        <Button type="submit" disabled={loading} loading={loading} fullWidth>
          Verify
        </Button>
        {result && (
          <div className="text-sm p-2 bg-muted/30 rounded-md border border-border">
            <pre className="text-xs overflow-auto text-foreground">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        {error && (
          <div className="text-sm text-destructive p-2 bg-destructive/10 rounded-md border border-destructive/20">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}

