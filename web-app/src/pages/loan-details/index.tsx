import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import TransactionStatusIndicator from '../../components/ui/TransactionStatusIndicator';
import LoanOverviewCard from './components/LoanOverviewCard';
import ContractTermsSection from './components/ContractTermsSection';
import PaymentHistoryTable from './components/PaymentHistoryTable';
import CreditImpactSection from './components/CreditImpactSection';
import MessagingSection from './components/MessagingSection';
import ActionButtons from './components/ActionButtons';
import { useNavigation } from '../../contexts/NavigationContext';

const LoanDetails = () => {
  const { userRole } = useNavigation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const loanData = {
    id: "LN-2026-0042",
    amount: 50000,
    interestRate: 8.5,
    termLength: "12 months",
    status: "active",
    amountPaid: 18750,
    nextPaymentDate: "Feb 15, 2026",
    createdDate: "Jan 08, 2026",
    borrowerName: "Sarah Mitchell",
    borrowerWallet: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4",
    agentName: "Michael Chen",
    agentWallet: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
    creditScore: 720
  };

  const contractTerms = {
    smartContractAddress: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
    paymentSchedule: [
      { number: 1, dueDate: "Feb 08, 2026", amount: 4375, paid: false },
      { number: 2, dueDate: "Mar 08, 2026", amount: 4375, paid: false },
      { number: 3, dueDate: "Apr 08, 2026", amount: 4375, paid: false },
      { number: 4, dueDate: "May 08, 2026", amount: 4375, paid: false },
      { number: 5, dueDate: "Jun 08, 2026", amount: 4375, paid: false },
      { number: 6, dueDate: "Jul 08, 2026", amount: 4375, paid: false },
      { number: 7, dueDate: "Aug 08, 2026", amount: 4375, paid: false },
      { number: 8, dueDate: "Sep 08, 2026", amount: 4375, paid: false },
      { number: 9, dueDate: "Oct 08, 2026", amount: 4375, paid: false },
      { number: 10, dueDate: "Nov 08, 2026", amount: 4375, paid: false },
      { number: 11, dueDate: "Dec 08, 2026", amount: 4375, paid: false },
      { number: 12, dueDate: "Jan 08, 2027", amount: 4375, paid: false }
    ],
    lateFees: {
      percentage: 2.5,
      description: "Late payment fee applies after 5 days grace period"
    },
    earlyPayment: {
      discount: 1.5,
      description: "Interest discount for payments made 30+ days early"
    }
  };

  const paymentHistory = [
    {
      id: 1,
      date: "Jan 08, 2026",
      amount: 4375,
      type: "principal + interest",
      transactionHash: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z",
      status: "verified"
    },
    {
      id: 2,
      date: "Dec 08, 2025",
      amount: 4375,
      type: "principal + interest",
      transactionHash: "0x9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j2i1h0g9f8e7d6c5b4a",
      status: "verified"
    },
    {
      id: 3,
      date: "Nov 08, 2025",
      amount: 4375,
      type: "principal + interest",
      transactionHash: "0xa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
      status: "verified"
    },
    {
      id: 4,
      date: "Oct 08, 2025",
      amount: 5625,
      type: "principal + interest + late fee",
      transactionHash: "0x6z5y4x3w2v1u0t9s8r7q6p5o4n3m2l1k0j9i8h7g6f5e4d3c2b1a",
      status: "verified"
    }
  ];

  const creditData = {
    currentScore: 720,
    scoreChange: 15,
    factors: [
      {
        name: "Payment History",
        description: "On-time payments improve your score",
        impact: 12,
        percentage: 85
      },
      {
        name: "Credit Utilization",
        description: "Using 30% of available credit",
        impact: 5,
        percentage: 70
      },
      {
        name: "Length of Credit History",
        description: "6 months of active credit",
        impact: -2,
        percentage: 45
      },
      {
        name: "Recent Inquiries",
        description: "2 hard inquiries in last 6 months",
        impact: 0,
        percentage: 60
      }
    ],
    improvementTips: [
      "Continue making on-time payments to maintain positive history",
      "Consider early payment to reduce interest and improve score faster",
      "Avoid taking additional loans until current utilization decreases",
      "Monitor your credit report monthly for accuracy"
    ]
  };

  const messages = [
    {
      id: 1,
      sender: userRole === 'agent' ? 'Borrower' : 'Agent',
      content: "Hello! I wanted to discuss the upcoming payment schedule. Is there any flexibility for early payment?",
      timestamp: "Jan 07, 2026, 10:30 AM",
      isCurrentUser: false
    },
    {
      id: 2,
      sender: userRole === 'agent' ? 'Agent' : 'Borrower',
      content: "Yes, absolutely! Early payments are encouraged and you'll receive a 1.5% interest discount for payments made 30+ days early. Would you like to proceed with an early payment?",
      timestamp: "Jan 07, 2026, 11:15 AM",
      isCurrentUser: true
    },
    {
      id: 3,
      sender: userRole === 'agent' ? 'Borrower' : 'Agent',
      content: "That sounds great! I\'m planning to make a payment next week. Will this also help improve my credit score?",
      timestamp: "Jan 07, 2026, 02:45 PM",
      isCurrentUser: false
    },
    {
      id: 4,
      sender: userRole === 'agent' ? 'Agent' : 'Borrower',
      content: "Yes, early payments positively impact your credit score by demonstrating financial responsibility. Your payment history accounts for 35% of your credit score calculation.",
      timestamp: "Jan 07, 2026, 03:20 PM",
      isCurrentUser: true
    }
  ];

  return (
    <>
      <Helmet>
        <title>Loan Details - DeFiLoan</title>
        <meta name="description" content="View comprehensive loan details including payment history, contract terms, and credit impact on DeFiLoan platform" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        <TransactionStatusIndicator />

        <main className="pt-20 pb-12 px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
            <LoanOverviewCard loan={loanData} userRole={userRole} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="lg:col-span-2 space-y-6 md:space-y-8">
                <ContractTermsSection contractTerms={contractTerms} />
                <PaymentHistoryTable payments={paymentHistory} />
              </div>

              <div className="space-y-6 md:space-y-8">
                <CreditImpactSection creditData={creditData} userRole={userRole} />
                <ActionButtons loanStatus={loanData?.status} userRole={userRole} />
              </div>
            </div>

            <MessagingSection 
              messages={messages} 
              userRole={userRole}
              onSendMessage={(message) => console.log('New message:', message)}
            />
          </div>
        </main>
      </div>
    </>
  );
};

export default LoanDetails;