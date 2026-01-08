'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWallet } from '@/lib/use-wallet';
import { Button } from '@/components/ui';

export default function SignCredentialPage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected, connect, signAndSubmit } = useWallet();
  const [tx, setTx] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ hash: string } | null>(null);

  useEffect(() => {
    const loadTransaction = async () => {
      try {
        const token = params.token as string;
        // Decode URL-safe base64: reverse -_. back to +/=
        const base64 = token.replace(/-/g, '+').replace(/_/g, '/').replace(/\./g, '=');
        const json = atob(base64);
        const transaction = JSON.parse(json);
        setTx(transaction);
      } catch (err) {
        console.error('Failed to decode credential link:', err);
        setError('Invalid credential link. Please request a new one from the agent.');
      } finally {
        setLoading(false);
      }
    };

    if (params.token) {
      loadTransaction();
    }
  }, [params.token]);

  const handleSign = async () => {
    if (!tx || !isConnected || !address) {
      if (!isConnected) {
        setError('Please connect your wallet first');
        return;
      }
      setError('Transaction not loaded');
      return;
    }

    if (address !== tx.account) {
      setError(`Wallet mismatch! This credential is for ${tx.account.slice(0, 8)}...${tx.account.slice(-6)}, but your wallet is ${address.slice(0, 8)}...${address.slice(-6)}`);
      return;
    }

    setSigning(true);
    setError(null);

    try {
      const transaction: any = {
        TransactionType: 'TrustSet',
        Account: tx.account,
        LimitAmount: tx.limit_amount,
        Fee: tx.fee,
        Sequence: tx.sequence,
      };

      if (tx.last_ledger_sequence) {
        transaction.LastLedgerSequence = tx.last_ledger_sequence;
      }

      const result = await signAndSubmit(transaction);
      const hash = result?.response?.data?.hash || result?.hash;

      if (hash) {
        setSuccess({ hash });
      } else {
        throw new Error('Failed to get transaction hash');
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to sign transaction';
      
      if (errorMsg.includes('actNotFound') || errorMsg.includes('account not found') || errorMsg.includes('not funded')) {
        setError('Your account is not funded. Please fund it first using the XRPL testnet faucet, then try again.');
      } else if (errorMsg.includes('sequence') || errorMsg.includes('preparation')) {
        setError('Transaction preparation failed. Your account may not be funded or the transaction expired. Please request a new credential from the agent.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading credential...</p>
        </div>
      </div>
    );
  }

  if (error && !tx) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => router.push('/borrower-dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-success/20 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-2 text-success">Credential Signed!</h1>
          <p className="text-muted-foreground mb-4">Trust line created successfully.</p>
          <a
            href={`https://testnet.xrpl.org/transactions/${success.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline text-primary hover:opacity-80 block mb-4"
          >
            View on XRPL Explorer
          </a>
          <Button onClick={() => router.push('/borrower-dashboard')} fullWidth>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Sign Credential</h1>
        <div className="text-sm text-muted-foreground mb-6 space-y-2">
          <p>
            An agent has prepared a credential (trust line) for you. This allows you to receive their issued currency.
          </p>
          <p className="text-xs bg-warning/10 border border-warning/20 rounded p-2">
            <strong>⚠️ Important:</strong> Your account must be funded with XRP before signing. If you see a "preparation error", fund your account first using the testnet faucet.
          </p>
        </div>

        {tx && (
          <div className="space-y-4 mb-6">
            <div className="p-4 bg-muted/30 rounded-md border border-border">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your Account:</span>
                  <code className="font-mono">{tx.account.slice(0, 8)}...{tx.account.slice(-6)}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issuer:</span>
                  <code className="font-mono">{tx.limit_amount.issuer.slice(0, 8)}...{tx.limit_amount.issuer.slice(-6)}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trust Limit:</span>
                  <code className="font-mono">{tx.limit_amount.value}</code>
                </div>
              </div>
            </div>

            {!isConnected ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Step 1: Connect your wallet to sign this credential</p>
                <Button onClick={() => connect('crossmark')} fullWidth>
                  Connect Crossmark
                </Button>
                <p className="text-xs text-muted-foreground">
                  Make sure you're connected with the wallet matching: <code className="font-mono bg-muted px-1 rounded">{tx.account.slice(0, 10)}...</code>
                </p>
              </div>
            ) : address !== tx.account ? (
              <div className="p-3 bg-destructive/10 rounded-md border border-destructive/20">
                <p className="text-sm text-destructive font-medium mb-1">⚠️ Wrong Wallet Connected</p>
                <p className="text-xs text-destructive">
                  This credential is for: <code className="font-mono bg-destructive/20 px-1 rounded">{tx.account}</code>
                </p>
                <p className="text-xs text-destructive mt-2">
                  Your connected wallet: <code className="font-mono bg-destructive/20 px-1 rounded">{address}</code>
                </p>
                <p className="text-xs text-destructive mt-2">
                  Please switch to the correct account in Crossmark, then refresh this page.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Step 2: Review and sign the transaction</p>
                <Button onClick={handleSign} disabled={signing} loading={signing} fullWidth>
                  {signing ? 'Signing...' : 'Sign & Submit Transaction'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Your wallet will prompt you to approve. This creates a trust line on XRPL.
                </p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 rounded-md border border-destructive/20 mb-4">
            <p className="text-sm font-semibold text-destructive mb-2">❌ Error</p>
            <p className="text-sm text-destructive mb-3">{error}</p>
            {(error.includes('not funded') || error.includes('fund')) && (
              <div className="mt-3 pt-3 border-t border-destructive/20">
                <p className="text-xs text-destructive mb-2">To fix this:</p>
                <ol className="text-xs text-destructive space-y-1 list-decimal list-inside mb-3">
                  <li>Copy your address: <code className="bg-destructive/20 px-1 rounded font-mono">{tx?.account}</code></li>
                  <li>Go to <a href="https://xrpl.org/xrp-testnet-faucet.html" target="_blank" rel="noopener noreferrer" className="underline">XRPL Testnet Faucet</a></li>
                  <li>Paste your address and request test XRP</li>
                  <li>Wait 10-30 seconds for funding</li>
                  <li>Come back and try signing again</li>
                </ol>
                <a
                  href="https://xrpl.org/xrp-testnet-faucet.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline text-destructive hover:opacity-80 inline-block"
                >
                  → Open Testnet Faucet
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

