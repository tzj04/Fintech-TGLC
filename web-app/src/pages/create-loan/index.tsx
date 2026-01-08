import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import TransactionStatusIndicator from '../../components/ui/TransactionStatusIndicator';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { useNavigation } from '../../contexts/NavigationContext';
import LoanAmountSection from './components/LoanAmountSection';
import InterestRateSection from './components/InterestRateSection';
import LoanTermSection from './components/LoanTermSection';
import AdvancedOptionsSection from './components/AdvancedOptionsSection';
import ProjectionCalculator from './components/ProjectionCalculator';
import SmartContractPreview from './components/SmartContractPreview';
import AgentVerificationCard from './components/AgentVerificationCard';

const CreateLoan = () => {
  const navigate = useNavigate();
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
  const [errors, setErrors] = useState({});
  const [isDraft, setIsDraft] = useState(false);

  const walletBalance = 50000;

  const validateForm = () => {
    const newErrors = {};

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
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSaveDraft = () => {
    setIsDraft(true);
    startTransaction('draft');
    
    setTimeout(() => {
      updateTransactionStatus('success');
      setTimeout(() => {
        navigate('/agent-dashboard');
      }, 1500);
    }, 2000);
  };

  const handlePublishLoan = (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    startTransaction('loan_creation');

    setTimeout(() => {
      updateTransactionStatus('success');
      setTimeout(() => {
        navigate('/agent-dashboard');
      }, 1500);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <TransactionStatusIndicator />
      <main className="pt-20 pb-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 md:mb-8">
            <button
              onClick={() => navigate('/agent-dashboard')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-smooth mb-4"
            >
              <Icon name="ArrowLeft" size={20} />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">Create New Loan</h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Define your USDC loan offering with custom terms and requirements
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-success/10 rounded-lg border border-success/20">
                <Icon name="Wallet" size={20} className="text-success" />
                <div>
                  <p className="text-xs text-muted-foreground">Available Balance</p>
                  <p className="text-base font-semibold text-success">
                    ${walletBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handlePublishLoan} className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="lg:col-span-2 space-y-6 md:space-y-8">
                <LoanAmountSection
                  loanAmount={loanAmount}
                  setLoanAmount={setLoanAmount}
                  walletBalance={walletBalance}
                  errors={errors}
                />

                <InterestRateSection
                  interestRate={interestRate}
                  setInterestRate={setInterestRate}
                  errors={errors}
                />

                <LoanTermSection
                  loanTerm={loanTerm}
                  setLoanTerm={setLoanTerm}
                  minCreditScore={minCreditScore}
                  setMinCreditScore={setMinCreditScore}
                  errors={errors}
                />

                <AdvancedOptionsSection
                  collateralRequired={collateralRequired}
                  setCollateralRequired={setCollateralRequired}
                  collateralPercentage={collateralPercentage}
                  setCollateralPercentage={setCollateralPercentage}
                  earlyPaymentAllowed={earlyPaymentAllowed}
                  setEarlyPaymentAllowed={setEarlyPaymentAllowed}
                  earlyPaymentPenalty={earlyPaymentPenalty}
                  setEarlyPaymentPenalty={setEarlyPaymentPenalty}
                  autoRenewal={autoRenewal}
                  setAutoRenewal={setAutoRenewal}
                />
              </div>

              <div className="space-y-6 md:space-y-8">
                <AgentVerificationCard />

                <ProjectionCalculator
                  loanAmount={loanAmount}
                  interestRate={interestRate}
                  loanTerm={loanTerm}
                />
              </div>
            </div>

            <SmartContractPreview
              loanAmount={loanAmount}
              interestRate={interestRate}
              loanTerm={loanTerm}
              minCreditScore={minCreditScore}
              collateralRequired={collateralRequired}
              collateralPercentage={collateralPercentage}
            />

            <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="lg"
                iconName="Save"
                iconPosition="left"
                onClick={handleSaveDraft}
                className="md:flex-1"
              >
                Save as Draft
              </Button>
              <Button
                type="submit"
                variant="default"
                size="lg"
                iconName="Rocket"
                iconPosition="left"
                className="md:flex-1"
              >
                Publish Loan Offer
              </Button>
            </div>

            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-1">Before Publishing</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <Icon name="Check" size={12} className="text-primary" />
                      <span>Review all terms carefully - they cannot be changed after deployment</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="Check" size={12} className="text-primary" />
                      <span>Ensure sufficient USDC balance for the loan amount plus gas fees</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="Check" size={12} className="text-primary" />
                      <span>Smart contract will be deployed to Ethereum mainnet</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="Check" size={12} className="text-primary" />
                      <span>Borrowers matching your criteria will be able to apply immediately</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateLoan;