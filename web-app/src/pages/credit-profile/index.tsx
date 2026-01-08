import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import TransactionStatusIndicator from '../../components/ui/TransactionStatusIndicator';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import CreditScoreCard from './components/CreditScoreCard';
import ScoreHistoryChart from './components/ScoreHistoryChart';
import PaymentHistorySection from './components/PaymentHistorySection';
import CreditFactorsBreakdown from './components/CreditFactorsBreakdown';
import ImprovementRecommendations from './components/ImprovementRecommendations';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import TrustSignals from './components/TrustSignals';

const CreditProfile = () => {
  const [showAnalytics, setShowAnalytics] = useState(true);

  const creditScore = {
    score: 742,
    rating: 'good',
    change: 28,
    trend: 'up'
  };

  const scoreHistory = [
    { month: 'Aug', score: 680 },
    { month: 'Sep', score: 695 },
    { month: 'Oct', score: 710 },
    { month: 'Nov', score: 725 },
    { month: 'Dec', score: 735 },
    { month: 'Jan', score: 742 }
  ];

  const paymentHistory = [
    {
      id: 1,
      loanId: 'LOAN-2024-001',
      date: '2026-01-05',
      amount: 1250,
      status: 'completed',
      txHash: '0x7a8f9b2c...4e5d6f1a',
      creditImpact: 5
    },
    {
      id: 2,
      loanId: 'LOAN-2023-089',
      date: '2025-12-28',
      amount: 2100,
      status: 'completed',
      txHash: '0x3c4d5e6f...9a8b7c2d',
      creditImpact: 8
    },
    {
      id: 3,
      loanId: 'LOAN-2023-067',
      date: '2025-12-15',
      amount: 1800,
      status: 'completed',
      txHash: '0x9e8f7d6c...5b4a3c2d',
      creditImpact: 6
    },
    {
      id: 4,
      loanId: 'LOAN-2023-045',
      date: '2025-11-30',
      amount: 1500,
      status: 'late',
      txHash: '0x2d3e4f5a...6b7c8d9e',
      creditImpact: -3
    },
    {
      id: 5,
      loanId: 'LOAN-2023-023',
      date: '2025-11-10',
      amount: 2500,
      status: 'completed',
      txHash: '0x8c9d0e1f...2a3b4c5d',
      creditImpact: 10
    }
  ];

  const creditFactors = [
    {
      type: 'payment',
      name: 'Payment History',
      description: 'Your track record of on-time payments',
      impact: 92,
      current: '95% on-time payments'
    },
    {
      type: 'diversity',
      name: 'Loan Diversity',
      description: 'Variety of loan types in your portfolio',
      impact: 78,
      current: '4 different loan types'
    },
    {
      type: 'tenure',
      name: 'Platform Tenure',
      description: 'Length of your credit history on platform',
      impact: 85,
      current: '18 months active'
    },
    {
      type: 'utilization',
      name: 'Credit Utilization',
      description: 'Percentage of available credit used',
      impact: 88,
      current: '32% utilization'
    },
    {
      type: 'inquiries',
      name: 'Recent Inquiries',
      description: 'Number of recent loan applications',
      impact: 70,
      current: '3 inquiries (6 months)'
    }
  ];

  const recommendations = [
    {
      priority: 'high',
      title: 'Reduce Credit Utilization',
      description: 'Your current utilization is at 32%. Reducing it below 30% can significantly boost your score.',
      potentialImpact: 15,
      timeframe: '1-2 months',
      steps: [
        'Pay down existing loan balances by $500',
        'Avoid taking new loans until utilization drops',
        'Consider increasing your credit limit'
      ]
    },
    {
      priority: 'medium',
      title: 'Diversify Loan Portfolio',
      description: 'Adding different types of loans can improve your credit mix and demonstrate financial responsibility.',
      potentialImpact: 10,
      timeframe: '3-6 months',
      steps: [
        'Consider a small business loan if applicable',
        'Explore secured loan options',
        'Maintain good standing on all loan types'
      ]
    },
    {
      priority: 'low',
      title: 'Limit Hard Inquiries',
      description: 'You have 3 inquiries in the last 6 months. Reducing new applications can help your score.',
      potentialImpact: 5,
      timeframe: '6-12 months',
      steps: [
        'Space out loan applications by at least 3 months',
        'Research loan terms before applying',
        'Use pre-qualification tools when available'
      ]
    }
  ];

  const utilizationData = [
    { month: 'Aug', utilization: 45 },
    { month: 'Sep', utilization: 42 },
    { month: 'Oct', utilization: 38 },
    { month: 'Nov', utilization: 35 },
    { month: 'Dec', utilization: 33 },
    { month: 'Jan', utilization: 32 }
  ];

  const verifications = [
    {
      type: 'Credit Score Calculation',
      contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      blockNumber: '18,234,567',
      timestamp: 'Jan 08, 2026 03:30 UTC'
    },
    {
      type: 'Payment History Record',
      contractAddress: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      blockNumber: '18,234,512',
      timestamp: 'Jan 05, 2026 14:22 UTC'
    },
    {
      type: 'Credit Factors Verification',
      contractAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      blockNumber: '18,234,489',
      timestamp: 'Jan 01, 2026 09:15 UTC'
    }
  ];

  const handleDownloadReport = () => {
    console.log('Downloading credit report...');
  };

  const handleViewImprovementPlan = () => {
    console.log('Viewing improvement plan...');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <TransactionStatusIndicator />
      <main className="pt-20 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Credit Profile</h1>
                <p className="text-base md:text-lg text-muted-foreground">
                  Comprehensive blockchain-verified credit analysis
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  iconName="Download"
                  iconPosition="left"
                  onClick={handleDownloadReport}
                  className="w-full sm:w-auto"
                >
                  Download Report
                </Button>
                <Button
                  variant="default"
                  iconName="TrendingUp"
                  iconPosition="left"
                  onClick={handleViewImprovementPlan}
                  className="w-full sm:w-auto"
                >
                  View Improvement Plan
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <CreditScoreCard
                score={creditScore?.score}
                rating={creditScore?.rating}
                change={creditScore?.change}
                trend={creditScore?.trend}
              />
            </div>
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-xl p-6 shadow-glow-md h-full flex flex-col justify-center">
                <div className="text-center mb-4">
                  <Icon name="Award" size={48} className="text-primary mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-foreground mb-1">Credit Achievement</h3>
                  <p className="text-sm text-muted-foreground">Top 15% of borrowers</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Total Loans</span>
                    <span className="text-sm font-bold text-foreground">12</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">On-Time Rate</span>
                    <span className="text-sm font-bold text-success">95%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Platform Tenure</span>
                    <span className="text-sm font-bold text-foreground">18 months</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ScoreHistoryChart data={scoreHistory} />
            <CreditFactorsBreakdown factors={creditFactors} />
          </div>

          <div className="mb-6">
            <PaymentHistorySection
              payments={paymentHistory}
              onTimePercentage={95}
            />
          </div>

          <div className="mb-6">
            <ImprovementRecommendations recommendations={recommendations} />
          </div>

          <div className="mb-6">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-smooth"
            >
              <div className="flex items-center gap-3">
                <Icon name="BarChart3" size={20} className="text-primary" />
                <span className="text-sm font-semibold text-foreground">Advanced Analytics</span>
              </div>
              <Icon
                name={showAnalytics ? 'ChevronUp' : 'ChevronDown'}
                size={20}
                className="text-muted-foreground"
              />
            </button>
            {showAnalytics && (
              <div className="mt-4">
                <AdvancedAnalytics
                  utilizationData={utilizationData}
                  consistencyScore={92}
                  platformBenchmark={85}
                />
              </div>
            )}
          </div>

          <div>
            <TrustSignals verifications={verifications} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreditProfile;