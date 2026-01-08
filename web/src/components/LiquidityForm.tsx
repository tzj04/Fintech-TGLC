"use client";

import { useState, useEffect, useCallback } from "react";
import {
  apiClient,
  type CreditScore,
  type LiquidityRequest,
  type LiquidityRequestResponse,
} from "@/lib/api";
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
  const [txUrl, setTxUrl] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [autoSigned, setAutoSigned] = useState(false);
  const [bankDecision, setBankDecision] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const network = (process.env.NEXT_PUBLIC_XRPL_NETWORK_NAME ||
    "testnet") as keyof typeof NETWORK_EXPLORER_URLS;

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
    setTxUrl(null);
    setTxHash(null);
    setAutoSigned(false);
    setBankDecision(null);
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

      const response: LiquidityRequestResponse =
        await apiClient.requestLiquidity(requestData);

      console.log("Liquidity response:", response);

      if (response.status === "approved") {
        setResult(`✅ Approved! Escrow created: ${response.amount_xrp} XRP`);

        // Set transaction data if available
        if (response.tx_hash) {
          setTxHash(response.tx_hash);
          console.log("Transaction hash:", response.tx_hash);
        }

        if (response.tx_url) {
          setTxUrl(response.tx_url);
          console.log("Transaction URL:", response.tx_url);
        }

        if (response.auto_signed !== undefined) {
          setAutoSigned(response.auto_signed);
        }

        if (response.bank_decision) {
          setBankDecision(response.bank_decision);
        }

        if (response.credit) {
          setCreditScore(response.credit);
        }
      } else if (response.status === "rejected") {
        setResult(
          `❌ Rejected: ${
            response.reason || response.message || "Request was rejected"
          }`
        );
        setBankDecision("rejected");
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
            className={`text-sm p-4 rounded-md border space-y-3 ${
              result.includes("✅")
                ? "text-success bg-success/10 border-success/20"
                : result.includes("❌")
                ? "text-destructive bg-destructive/10 border-destructive/20"
                : "text-muted-foreground bg-muted/30 border-border"
            }`}
          >
            <div>{result}</div>
            {autoSigned && (
              <div className="text-xs text-muted-foreground bg-white/5 p-2 rounded">
                🤖 Auto-signed by BankAgent
              </div>
            )}
            {txHash && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  Transaction Hash:
                </div>
                <div className="break-all text-primary font-mono text-xs bg-black/20 p-2 rounded overflow-x-auto">
                  {txHash}
                </div>
                {txUrl ? (
                  <a
                    href={txUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1 inline-block"
                  >
                    View on XRPL Explorer ↗
                  </a>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    Copy hash above to view on{" "}
                    <a
                      href={`https://testnet.xrpl.org/transactions/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      XRPL Explorer
                    </a>
                  </div>
                )}
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
