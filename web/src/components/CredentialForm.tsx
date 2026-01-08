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
  original_currency?: string;
}

export function CredentialForm() {
  const { address: agentAddress, isConnected } = useWallet();
  const [borrowerAddress, setBorrowerAddress] = useState('');
  const [amount, setAmount] = useState('1000000');
  const [currency, setCurrency] = useState('CORRIDOR_ELIGIBLE');
  const [loading, setLoading] = useState(false);
  const [txDetails, setTxDetails] = useState<TransactionDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!borrowerAddress.trim()) {
      setError('Please enter the borrower\'s XRPL address');
      return;
    }
    
    if (!/^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(borrowerAddress.trim())) {
      setError('Invalid XRPL address format. Must start with "r" and be 25-34 characters.');
      return;
    }

    setLoading(true);
    setTxDetails(null);
    setError(null);

    try {
      const response = await apiClient.issueCredential(borrowerAddress.trim(), amount, currency);
      setTxDetails({
        transaction: response.transaction,
        issuer: response.issuer,
        status: response.status,
        message: response.message || 'Transaction prepared successfully. The borrower must sign and submit this transaction.',
        original_currency: (response as any).original_currency || currency
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to prepare credential transaction';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const handleReset = () => {
    setTxDetails(null);
    setError(null);
    setLoading(false);
    setBorrowerAddress('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const generateShareLink = (transaction: Record<string, any>): string => {
    const json = JSON.stringify(transaction);
    // URL-safe base64: replace +/= with -_. for URL compatibility
    const encoded = btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '.');
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/sign-credential/${encoded}`;
  };

  const formatCurrency = (curr: string) => {
    if (!curr) return '';
    if (curr.length === 3 && /^[A-Z]{3}$/.test(curr)) return curr;
    if (curr.length === 40) {
      try {
        const hex = curr.replace(/0+$/, '');
        const decoded = Buffer.from(hex, 'hex').toString('utf8');
        return decoded || curr;
      } catch {
        return curr;
      }
    }
    return curr;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2 text-foreground">Issue Credential</h2>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>What this does:</strong> Creates a trust line on XRPL that allows a borrower to receive your issued currency (like a credit limit).
          </p>
          <p>
            <strong>Requirements:</strong> The borrower's account must be funded with XRP before they can sign. If the account isn't funded, you'll see an error.
          </p>
          <p>
            <strong>Process:</strong> You prepare the transaction → Share link with borrower → Borrower signs → Trust line created on XRPL.
          </p>
        </div>
      </div>
      
      {isConnected && agentAddress && (
        <div className="mb-4 p-3 bg-muted/30 rounded-md border border-border">
          <p className="text-xs text-muted-foreground mb-1">Agent Wallet (You)</p>
          <p className="text-sm font-mono text-foreground">{agentAddress}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Borrower's XRPL Address"
          value={borrowerAddress}
          onChange={(e) => setBorrowerAddress(e.target.value)}
          placeholder="rXXXXXXXXXXXXXXXXXXXXXXXXXX"
          required
          pattern="^r[1-9A-HJ-NP-Za-km-z]{25,34}$"
          title="Must be a valid XRPL address starting with 'r'"
          description="The borrower's XRPL address. Their account must be funded with XRP before they can sign."
          className="font-mono"
        />

        <Input
          label="Trust Limit"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          pattern="^\d+(\.\d+)?$"
          title="Must be a positive number"
          description="Maximum amount of currency the borrower can hold (e.g., 1000000)"
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
          <div className="text-sm text-destructive p-4 bg-destructive/10 rounded-md border border-destructive/20">
            <p className="font-semibold mb-2">❌ Error</p>
            <p className="mb-2">{error}</p>
            {error.includes('does not exist') || error.includes('not funded') ? (
              <div className="mt-3 pt-3 border-t border-destructive/20">
                <p className="text-xs mb-2">The borrower's account needs to be funded first:</p>
                <a
                  href="https://xrpl.org/xrp-testnet-faucet.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline hover:opacity-80 inline-block"
                >
                  → Fund account on XRPL Testnet Faucet
                </a>
              </div>
            ) : null}
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
                <span className="text-success/80 font-medium">Borrower Address:</span>
                <div className="flex items-center gap-2">
                  <code className="text-success font-mono bg-success/20 px-2 py-1 rounded">
                    {txDetails.transaction.account?.slice(0, 8)}...{txDetails.transaction.account?.slice(-6)}
                  </code>
                  <button
                    onClick={() => copyToClipboard(txDetails.transaction.account)}
                    className="text-success hover:text-success/80"
                    title="Copy address"
                  >
                    📋
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-t border-success/20">
                <span className="text-success/80 font-medium">Currency:</span>
                <code className="text-success font-mono bg-success/20 px-2 py-1 rounded">
                  {txDetails.original_currency || formatCurrency(txDetails.transaction.limit_amount?.currency || currency)}
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
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="sm"
                  fullWidth
                  className="mt-3"
                >
                  Issue Another Credential
                </Button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-md">
                  <p className="text-sm font-semibold text-primary mb-2">📋 Share Link with Borrower</p>
                  <p className="text-xs text-primary/80 mb-3">
                    Copy this link and send it to the borrower via email, chat, or any secure channel. When they open it, they'll be prompted to connect their wallet and sign.
                  </p>
                  <p className="text-xs text-primary/60 mb-3">
                    <strong>Note:</strong> Make sure the borrower's account is funded with XRP before they try to sign, otherwise they'll see an error.
                  </p>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      readOnly
                      value={generateShareLink(txDetails.transaction)}
                      className="flex-1 px-3 py-2 text-xs bg-background border border-border rounded-md font-mono"
                    />
                    <Button
                      onClick={() => {
                        copyToClipboard(generateShareLink(txDetails.transaction));
                        alert('Link copied! Send this to the borrower.');
                      }}
                      size="sm"
                    >
                      Copy
                    </Button>
                  </div>
                  <a
                    href={generateShareLink(txDetails.transaction)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs underline text-primary hover:opacity-80"
                  >
                    Open link in new tab →
                  </a>
                </div>

                <div className="p-3 bg-muted/30 border border-border rounded-md">
                  <p className="text-xs text-muted-foreground">
                    <strong>Borrower's address:</strong>{' '}
                    <code className="bg-muted px-1 rounded font-mono">
                      {txDetails.transaction.account}
                    </code>
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Issue Another
                  </Button>
                  <a
                    href={`https://testnet.xrpl.org/accounts/${txDetails.transaction.account}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs underline text-muted-foreground hover:opacity-80 flex-1 text-center self-center"
                  >
                    View on XRPL →
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

