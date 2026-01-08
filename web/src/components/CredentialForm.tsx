'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { useWallet } from '@/lib/use-wallet';

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
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
      <h2 className="text-lg font-semibold mb-4 text-black dark:text-zinc-50">Issue Credential</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
            Principal Address
          </label>
          {isConnected && connectedAddress ? (
            <div className="w-full px-3 py-2 border border-green-300 dark:border-green-700 rounded bg-green-50 dark:bg-green-900/20 text-black dark:text-zinc-50 text-sm font-mono flex items-center justify-between">
              <span>{connectedAddress}</span>
              <span className="text-xs text-green-600 dark:text-green-400">✓ Connected</span>
            </div>
          ) : (
            <>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="rXXX..."
                required={!isConnected}
                pattern="^r[1-9A-HJ-NP-Za-km-z]{25,34}$"
                title="Must be a valid XRPL address starting with 'r'"
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 text-sm font-mono"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Enter address or connect wallet above
              </p>
            </>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
            Trust Limit
          </label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            pattern="^\d+(\.\d+)?$"
            title="Must be a positive number"
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 text-sm"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Maximum amount of currency the principal can hold
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
            Currency Code
          </label>
          <input
            type="text"
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            pattern="^[A-Z0-9]{3,40}$"
            title="3-40 uppercase alphanumeric characters"
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 text-sm font-mono"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Currency identifier (e.g., CORRIDOR_ELIGIBLE)
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-black dark:bg-zinc-50 text-white dark:text-black rounded font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Preparing Transaction...' : 'Prepare Credential'}
        </button>

        {/* Error Display */}
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
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

        {/* Success Display */}
        {txDetails && (
          <div className="text-sm text-green-600 dark:text-green-400 p-4 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-base mb-1">✓ Transaction Prepared</p>
                <p className="text-xs text-green-700 dark:text-green-300">{txDetails.message}</p>
              </div>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 rounded text-xs font-medium">
                {txDetails.status}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-2 border-t border-green-200 dark:border-green-800">
                <span className="text-green-700 dark:text-green-300 font-medium">Issuer:</span>
                <div className="flex items-center gap-2">
                  <code className="text-green-900 dark:text-green-100 font-mono bg-green-100 dark:bg-green-800 px-2 py-1 rounded">
                    {txDetails.issuer.slice(0, 8)}...{txDetails.issuer.slice(-6)}
                  </code>
                  <button
                    onClick={() => copyToClipboard(txDetails.issuer)}
                    className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-t border-green-200 dark:border-green-800">
                <span className="text-green-700 dark:text-green-300 font-medium">Principal:</span>
                <code className="text-green-900 dark:text-green-100 font-mono bg-green-100 dark:bg-green-800 px-2 py-1 rounded">
                  {txDetails.transaction.account?.slice(0, 8)}...{txDetails.transaction.account?.slice(-6)}
                </code>
              </div>

              <div className="flex justify-between items-center py-2 border-t border-green-200 dark:border-green-800">
                <span className="text-green-700 dark:text-green-300 font-medium">Currency:</span>
                <code className="text-green-900 dark:text-green-100 font-mono bg-green-100 dark:bg-green-800 px-2 py-1 rounded">
                  {formatCurrency(txDetails.transaction.limit_amount?.currency || currency)}
                </code>
              </div>

              <div className="flex justify-between items-center py-2 border-t border-green-200 dark:border-green-800">
                <span className="text-green-700 dark:text-green-300 font-medium">Trust Limit:</span>
                <code className="text-green-900 dark:text-green-100 font-mono bg-green-100 dark:bg-green-800 px-2 py-1 rounded">
                  {txDetails.transaction.limit_amount?.value || amount}
                </code>
              </div>

              <div className="flex justify-between items-center py-2 border-t border-green-200 dark:border-green-800">
                <span className="text-green-700 dark:text-green-300 font-medium">Fee:</span>
                <code className="text-green-900 dark:text-green-100 font-mono bg-green-100 dark:bg-green-800 px-2 py-1 rounded">
                  {txDetails.transaction.fee} drops
                </code>
              </div>
            </div>

            {txDetails.txHash ? (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                <p className="text-xs text-green-800 dark:text-green-200 font-medium mb-2">
                  ✓ Transaction Submitted
                </p>
                <a
                  href={`https://testnet.xrpl.org/transactions/${txDetails.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline text-green-800 dark:text-green-200 hover:opacity-80 break-all"
                >
                  View on XRPL Explorer: {txDetails.txHash.slice(0, 16)}...
                </a>
              </div>
            ) : isConnected && connectedAddress === txDetails.transaction.account ? (
              <div className="mt-4 space-y-2">
                <button
                  onClick={handleSignAndSubmit}
                  disabled={submitting}
                  className="w-full px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded font-medium hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Sign & Submit with Crossmark'}
                </button>
                <a
                  href={`https://testnet.xrpl.org/accounts/${txDetails.transaction.account}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline text-green-600 dark:text-green-400 hover:opacity-80 block text-center"
                >
                  View account on XRPL Explorer →
                </a>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                  ⚠️ Next Steps:
                </p>
                <ol className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1 list-decimal list-inside">
                  <li>Connect wallet matching this address</li>
                  <li>Sign and submit transaction</li>
                  <li>Verify on XRPL explorer</li>
                </ol>
                <a
                  href={`https://testnet.xrpl.org/accounts/${txDetails.transaction.account}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline mt-2 inline-block text-yellow-800 dark:text-yellow-200 hover:opacity-80"
                >
                  View account on XRPL Explorer →
                </a>
              </div>
            )}

            <button
              onClick={() => copyToClipboard(JSON.stringify(txDetails.transaction, null, 2))}
              className="mt-3 w-full px-3 py-2 bg-green-600 dark:bg-green-700 text-white rounded text-xs font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
            >
              📋 Copy Transaction JSON
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

