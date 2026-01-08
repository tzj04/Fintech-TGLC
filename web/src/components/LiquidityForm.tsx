'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { Button, Input } from './ui';

export function LiquidityForm() {
  const [did, setDid] = useState('');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setTxHash(null);
    setError(null);

    try {
      const response = await apiClient.requestLiquidity({
        principal_did: did,
        principal_address: address,
        amount_xrp: parseFloat(amount),
      });
      
      if (response.status === 'approved' && response.tx_hash) {
        setResult(`Approved! Escrow created: ${response.amount_xrp} XRP`);
        setTxHash(response.tx_hash);
      } else {
        setResult(`Status: ${response.status}${response.reason ? ` - ${response.reason}` : ''}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request liquidity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Request Liquidity</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Principal DID"
          value={did}
          onChange={(e) => setDid(e.target.value)}
          placeholder="did:xrpl:..."
          required
        />
        <Input
          label="Principal Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="rXXX..."
          required
          className="font-mono"
        />
        <Input
          label="Amount (XRP)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="1000"
          required
          step="0.01"
        />
        <Button type="submit" disabled={loading} loading={loading} fullWidth>
          Request
        </Button>
        {result && (
          <div className="text-sm text-success p-2 bg-success/10 rounded-md border border-success/20">
            {result}
            {txHash && (
              <div className="mt-2">
                <a
                  href={`https://testnet.xrpl.org/transactions/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:opacity-80 break-all"
                >
                  {txHash}
                </a>
              </div>
            )}
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

