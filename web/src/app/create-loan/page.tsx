'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import AppIcon from '@/components/AppIcon';
import { useNavigation } from '@/context/NavigationContext';
import LoanAmountSection from './components/LoanAmountSection';
import InterestRateSection from './components/InterestRateSection';
import LoanTermSection from './components/LoanTermSection';
import AdvancedOptions from './components/AdvancedOptions';
import ProjectionCalculation from './components/ProjectionCalculation';
import SmartContractPreview from './components/SmartContractPreview';
import AgentVerification from './components/AgentVerification';

export default function CreateLoan() {
  const router = useRouter();
  const { startTransaction, updateTransactionStatus } = useNavigation();

  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [minCreditScore, setMinCreditScore] = useState('');
  const [collateralRequired, setCollateralRequired] = useState(false);
  const [collateralPercentage, setCollateralPercentage] = useState('100');
  const [earlyPaymentAllowed, setEarlyPaymentAllowed] = useState(true);
  const [earlyPaymentPenalty, setEarlyPaymentPenalty] = useState('0');
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDraft, setIsDraft] = useState(false);

  const walletBalance = 50000;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!loanAmount || parseFloat(loanAmount) < 100) {
      newErrors.loanAmount = 'Minimum loan amount is $100 USDC';
    }

    if (parseFloat(loanAmount) > walletBalance) {
      newErrors.loanAmount = 'Amount exceeds available balance';
    }

    if (!interestRate || parseFloat(interestRate) < 0.1 || parseFloat(interestRate) > 50) {
      newErrors.interestRate = 'Interest rate must be between 0.1% and 50%';
    }

    if (!loanTerm) {
      newErrors.loanTerm = 'Please select a loan term';
    }

    if (!minCreditScore || parseInt(minCreditScore) < 300 || parseInt(minCreditScore) > 850) {
      newErrors.minCreditScore = 'Credit score must be between 300 and 850';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = () => {
    setIsDraft(true);
    startTransaction('draft');

    setTimeout(() => {
      updateTransactionStatus('success');
      setTimeout(() => {
        router.push('/agent-dashboard');
      }, 1500);
    }, 2000);
  };

  const handlePublishLoan = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    startTransaction('loan_creation');

    setTimeout(() => {
      updateTransactionStatus('success');
      setTimeout(() => {
        router.push('/agent-dashboard');
      }, 1500);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <main className="pt-4 pb-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 md:mb-8">
            <button
              onClick={() => router.push('/agent-dashboard')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-smooth mb-4"
            >
              <AppIcon name="ArrowLeft" size={18} />
              <span className="text-sm">Back to Dashboard</span>
            </button>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">Create New Loan</h1>
            <p className="text-sm md:text-base text-muted-foreground">Set up a new loan offer for borrowers</p>
          </div>

          <form onSubmit={handlePublishLoan} className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="lg:col-span-2 space-y-6 md:space-y-8">
                <LoanAmountSection value={loanAmount} onChange={setLoanAmount} error={errors.loanAmount} walletBalance={walletBalance} />
                <InterestRateSection value={interestRate} onChange={setInterestRate} error={errors.interestRate} />
                <LoanTermSection value={loanTerm} onChange={setLoanTerm} error={errors.loanTerm} />
                <AdvancedOptions
                  minCreditScore={minCreditScore}
                  onMinCreditScoreChange={setMinCreditScore}
                  collateralRequired={collateralRequired}
                  onCollateralRequiredChange={setCollateralRequired}
                  collateralPercentage={collateralPercentage}
                  onCollateralPercentageChange={setCollateralPercentage}
                  earlyPaymentAllowed={earlyPaymentAllowed}
                  onEarlyPaymentAllowedChange={setEarlyPaymentAllowed}
                  earlyPaymentPenalty={earlyPaymentPenalty}
                  onEarlyPaymentPenaltyChange={setEarlyPaymentPenalty}
                  autoRenewal={autoRenewal}
                  onAutoRenewalChange={setAutoRenewal}
                  error={errors.minCreditScore}
                />
              </div>

              <div className="lg:col-span-1 space-y-6 md:space-y-8">
                <ProjectionCalculation
                  loanAmount={loanAmount}
                  interestRate={interestRate}
                  loanTerm={loanTerm}
                />
                <SmartContractPreview
                  loanAmount={loanAmount}
                  interestRate={interestRate}
                  loanTerm={loanTerm}
                />
                <AgentVerification />
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-border">
              <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={isDraft}>
                Save as Draft
              </Button>
              <Button type="submit" variant="default">
                Publish Loan Offer
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

