"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient, type CreditScore, type LiquidityRequest } from "@/lib/api";
import { useWallet } from "@/lib/use-wallet";
import { Button, Input } from "./ui";

const NETWORK_EXPLORER_URLS = {
  mainnet: "https://xrpl.org/transactions/",
  testnet: "https://testnet.xrpl.org/transactions/",
  devnet: "https://testnet.xrpl.org/transactions/",
} as const;

export function LiquidityForm() {
  const { isConnected, address: walletAddress } = useWallet();
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [creditScore, setCreditScore] = useState<CreditScore | null>(null);
  const [creditLoading, setCreditLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [transactionUrl, setTransactionUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const network = (process.env.NEXT_PUBLIC_XRPL_NETWORK_NAME ||
    "testnet") as keyof typeof NETWORK_EXPLORER_URLS;
  const explorerUrl =
    NETWORK_EXPLORER_URLS[network] || NETWORK_EXPLORER_URLS.testnet;

  const fetchCreditScore = useCallback(async (addr: string) => {
    if (!addr) {
      setCreditScore(null);
      return;
    }
    setCreditLoading(true);
    try {
      const credit = await apiClient.getCreditScore(addr);
      setCreditScore(credit);
    } catch (err) {
      console.error("Failed to fetch credit score:", err);
      setCreditScore(null);
    } finally {
      setCreditLoading(false);
    }
  }, []);

  useEffect(() => {
    if (walletAddress) {
      setAddress(walletAddress);
      fetchCreditScore(walletAddress);
    } else {
      setAddress("");
      setCreditScore(null);
    }
  }, [walletAddress, fetchCreditScore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setTxHash(null);
    setTransactionUrl(null);
    setError(null);

    try {
      if (!address || !amount) {
        setError("Please fill in all required fields");
        return;
      }

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        setError("Please enter a valid amount");
        return;
      }

      const requestData: LiquidityRequest = {
        principal_address: address,
        amount_xrp: amountNum,
      };

      const response = await apiClient.requestLiquidity(requestData);

      if (response.status === "approved") {
        setResult(
          response.message ||
          `Approved! Escrow created: ${response.amount_xrp} XRP`
        );
        if (response.transaction_url || response.explorer_url) {
          setTransactionUrl(response.transaction_url ?? response.explorer_url ?? null);
        }
        if (response.tx_hash) {
          setTxHash(response.tx_hash ?? null);
        }
        if (response.credit) {
          setCreditScore(response.credit);
        }
      } else if (response.status === "matched") {
        setResult(
          `${
            response.message ||
            "Matched with bank. Transaction prepared for signing."
          }`
        );
        if (response.credit) {
          setCreditScore(response.credit);
        }
      } else {
        setResult(
          `Status: ${response.status}${
            response.reason ? ` - ${response.reason}` : ""
          }`
        );
        if (response.credit) {
          setCreditScore(response.credit);
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to request liquidity";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 750) return "text-success";
    if (score >= 650) return "text-primary";
    if (score >= 500) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-lg font-semibold mb-4 text-foreground">
        Request Liquidity
      </h2>

      {creditScore && (
        <div className="mb-4 p-4 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Credit Score</span>
            <span
              className={`text-lg font-bold ${getScoreColor(
                creditScore.score
              )}`}
            >
              {creditScore.score}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Rating: {creditScore.rating}
            </span>
            <span className="text-muted-foreground">
              Max Eligible: {creditScore.max_eligible.toLocaleString()} XRP
            </span>
          </div>
        </div>
      )}

      {creditLoading && (
        <div className="mb-4 text-sm text-muted-foreground">
          Loading credit score...
        </div>
      )}

      {!isConnected && (
        <div className="mb-4 p-3 bg-warning/10 rounded-md border border-warning/20 text-sm text-warning">
          Connect your wallet to auto-fill address and view credit score
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Principal Address"
          value={address}
          onChange={(e) => {
            const newAddress = e.target.value;
            setAddress(newAddress);
            if (newAddress && newAddress !== walletAddress) {
              fetchCreditScore(newAddress);
            }
          }}
          placeholder="rXXX..."
          required
          className="font-mono"
          disabled={!!walletAddress}
          description={
            walletAddress
              ? "Connected wallet address"
              : "Enter your XRPL address"
          }
        />
        <Input
          label="Amount (XRP)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={
            creditScore
              ? `Max: ${creditScore.max_eligible.toLocaleString()}`
              : "1000"
          }
          required
          step="0.01"
          max={creditScore?.max_eligible}
          description={`Maximum eligible: ${
            creditScore?.max_eligible.toLocaleString() || "N/A"
          } XRP`}
        />
        <Button
          type="submit"
          disabled={loading || !amount || !creditScore}
          loading={loading}
          fullWidth
        >
          {loading ? "Processing..." : "Request Liquidity"}
        </Button>
        {result && (
          <div
            className={`text-sm p-3 rounded-md border ${
              result.includes("Approved")
                ? "text-success bg-success/10 border-success/20"
                : "text-muted-foreground bg-muted/30 border-border"
            }`}
          >
            {result}
            {transactionUrl && (
              <div className="mt-2">
                <a
                  href={transactionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:opacity-80 break-all text-primary"
                >
                  View Transaction Receipt →
                </a>
              </div>
            )}
            {txHash && !transactionUrl && (
              <div className="mt-2">
                <a
                  href={`${explorerUrl}${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:opacity-80 break-all text-primary"
                >
                  View Transaction: {txHash.slice(0, 16)}...
                </a>
              </div>
            )}
          </div>
        )}
        {error && (
          <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-md border border-destructive/20">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
