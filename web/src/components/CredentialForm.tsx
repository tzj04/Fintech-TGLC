'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { useWallet } from '@/lib/use-wallet';
import { Button, Input } from './ui';
import { cn } from '@/lib/utils/cn';

interface TransactionDetails {
  transaction: Record<string, any>;
  issuer: string;
  status: string;
  message: string;
  txHash?: string;
}

export function CredentialForm() {
  const { address: connectedAddress, isConnected, signAndSubmit } = useWallet();
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('1000000');
  const [currency, setCurrency] = useState('CORRIDOR_ELIGIBLE');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [txDetails, setTxDetails] = useState<TransactionDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const principalAddress = isConnected && connectedAddress ? connectedAddress : address;
    
    if (!principalAddress) {
      setError('Please enter a principal address or connect your wallet');
      return;
    }

    setLoading(true);
    setTxDetails(null);
    setError(null);

    try {
      const response = await apiClient.issueCredential(principalAddress, amount, currency);
      setTxDetails({
        transaction: response.transaction,
        issuer: response.issuer,
        status: response.status,
        message: (response as any).message || 'Transaction prepared successfully'
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to issue credential';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignAndSubmit = async () => {
    if (!txDetails) {
      setError('No transaction to sign');
      return;
    }

    if (!isConnected || !connectedAddress) {
      setError('Please connect your wallet first');
      return;
    }

    if (connectedAddress !== txDetails.transaction.account) {
      setError('Connected wallet address does not match transaction account');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const txData = txDetails.transaction;
      const tx = {
        TransactionType: 'TrustSet' as const,
        Account: txData.account,
        LimitAmount: txData.limit_amount,
        Fee: txData.fee,
        Sequence: txData.sequence,
        LastLedgerSequence: txData.last_ledger_sequence,
      };

      const result = await signAndSubmit(tx);
      const hash = result?.response?.data?.hash || result?.hash;
      
      if (hash) {
        setTxDetails({
          ...txDetails,
          txHash: hash,
          status: 'submitted',
          message: 'Transaction submitted successfully!'
        });
      } else {
        throw new Error('Failed to get transaction hash');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to sign and submit transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatCurrency = (curr: string) => {
    if (curr.length === 3) return curr;
    if (curr.length === 40) {
      try {
        const hex = curr.replace(/0+$/, '');
        return Buffer.from(hex, 'hex').toString('utf8') || curr;
      } catch {
        return curr;
      }
    }
    return curr;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Issue Credential</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {isConnected && connectedAddress ? (
          <div className="w-full px-3 py-2 border border-success/30 rounded-md bg-success/10 text-foreground text-sm font-mono flex items-center justify-between">
            <span>{connectedAddress}</span>
            <span className="text-xs text-success">✓ Connected</span>
          </div>
        ) : (
          <Input
            label="Principal Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="rXXX..."
            required={!isConnected}
            pattern="^r[1-9A-HJ-NP-Za-km-z]{25,34}$"
            title="Must be a valid XRPL address starting with 'r'"
            description="Enter address or connect wallet above"
            className="font-mono"
          />
        )}

        <Input
          label="Trust Limit"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          pattern="^\d+(\.\d+)?$"
          title="Must be a positive number"
          description="Maximum amount of currency the principal can hold"
        />

        <Input
          label="Currency Code"
          value={currency}
          onChange={(e) => setCurrency(e.target.value.toUpperCase())}
          pattern="^[A-Z0-9]{3,40}$"
          title="3-40 uppercase alphanumeric characters"
          description="Currency identifier (e.g., CORRIDOR_ELIGIBLE)"
          className="font-mono"
        />

        <Button type="submit" disabled={loading} loading={loading} fullWidth>
          {loading ? 'Preparing Transaction...' : 'Prepare Credential'}
        </Button>

        {error && (
          <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-md border border-destructive/20">
            <p className="font-medium mb-1">Error</p>
            <p>{error}</p>
            {error.includes('does not exist') && (
              <a
                href="https://xrpl.org/xrp-testnet-faucet.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline mt-2 inline-block hover:opacity-80"
              >
                Fund account on testnet faucet →
              </a>
            )}
          </div>
        )}

        {txDetails && (
          <div className="text-sm text-success p-4 bg-success/10 rounded-md border border-success/20">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-base mb-1">✓ Transaction Prepared</p>
                <p className="text-xs text-success/80">{txDetails.message}</p>
              </div>
              <span className="px-2 py-1 bg-success/20 text-success rounded text-xs font-medium">
                {txDetails.status}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-2 border-t border-success/20">
                <span className="text-success/80 font-medium">Issuer:</span>
                <div className="flex items-center gap-2">
                  <code className="text-success font-mono bg-success/20 px-2 py-1 rounded">
                    {txDetails.issuer.slice(0, 8)}...{txDetails.issuer.slice(-6)}
                  </code>
                  <button
                    onClick={() => copyToClipboard(txDetails.issuer)}
                    className="text-success hover:text-success/80"
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-t border-success/20">
                <span className="text-success/80 font-medium">Principal:</span>
                <code className="text-success font-mono bg-success/20 px-2 py-1 rounded">
                  {txDetails.transaction.account?.slice(0, 8)}...{txDetails.transaction.account?.slice(-6)}
                </code>
              </div>

              <div className="flex justify-between items-center py-2 border-t border-success/20">
                <span className="text-success/80 font-medium">Currency:</span>
                <code className="text-success font-mono bg-success/20 px-2 py-1 rounded">
                  {formatCurrency(txDetails.transaction.limit_amount?.currency || currency)}
                </code>
              </div>

              <div className="flex justify-between items-center py-2 border-t border-success/20">
                <span className="text-success/80 font-medium">Trust Limit:</span>
                <code className="text-success font-mono bg-success/20 px-2 py-1 rounded">
                  {txDetails.transaction.limit_amount?.value || amount}
                </code>
              </div>

              <div className="flex justify-between items-center py-2 border-t border-success/20">
                <span className="text-success/80 font-medium">Fee:</span>
                <code className="text-success font-mono bg-success/20 px-2 py-1 rounded">
                  {txDetails.transaction.fee} drops
                </code>
              </div>
            </div>

            {txDetails.txHash ? (
              <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-md">
                <p className="text-xs text-success font-medium mb-2">✓ Transaction Submitted</p>
                <a
                  href={`https://testnet.xrpl.org/transactions/${txDetails.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline text-success hover:opacity-80 break-all"
                >
                  View on XRPL Explorer: {txDetails.txHash.slice(0, 16)}...
                </a>
              </div>
            ) : isConnected && connectedAddress === txDetails.transaction.account ? (
              <div className="mt-4 space-y-2">
                <Button
                  onClick={handleSignAndSubmit}
                  disabled={submitting}
                  loading={submitting}
                  variant="success"
                  fullWidth
                >
                  Sign & Submit with Crossmark
                </Button>
                <a
                  href={`https://testnet.xrpl.org/accounts/${txDetails.transaction.account}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline text-success hover:opacity-80 block text-center"
                >
                  View account on XRPL Explorer →
                </a>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-md">
                <p className="text-xs text-warning font-medium mb-2">⚠️ Next Steps:</p>
                <ol className="text-xs text-warning/80 space-y-1 list-decimal list-inside">
                  <li>Connect wallet matching this address</li>
                  <li>Sign and submit transaction</li>
                  <li>Verify on XRPL explorer</li>
                </ol>
                <a
                  href={`https://testnet.xrpl.org/accounts/${txDetails.transaction.account}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline mt-2 inline-block text-warning hover:opacity-80"
                >
                  View account on XRPL Explorer →
                </a>
              </div>
            )}

            <Button
              onClick={() => copyToClipboard(JSON.stringify(txDetails.transaction, null, 2))}
              variant="outline"
              size="sm"
              fullWidth
              className="mt-3"
            >
              📋 Copy Transaction JSON
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

