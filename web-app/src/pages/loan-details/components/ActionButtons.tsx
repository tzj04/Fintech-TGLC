import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import { useNavigation } from '../../../contexts/NavigationContext';

const ActionButtons = ({ loanStatus, userRole }) => {
  const navigate = useNavigate();
  const { startTransaction } = useNavigation();

  const handleMakePayment = () => {
    startTransaction('payment');
    setTimeout(() => {
      navigate('/payment-processing');
    }, 500);
  };

  const handleProcessPayment = () => {
    startTransaction('payment');
    setTimeout(() => {
      navigate('/payment-processing');
    }, 500);
  };

  const handleViewCredit = () => {
    navigate('/credit-profile');
  };

  if (userRole === 'agent') {
    return (
      <div className="bg-card border border-border rounded-xl p-4 md:p-6 lg:p-8 shadow-glow-md">
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4 md:mb-6">
          Agent Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <Button
            variant="default"
            fullWidth
            iconName="CreditCard"
            iconPosition="left"
            onClick={handleProcessPayment}
            disabled={loanStatus === 'completed'}
          >
            Process Payment
          </Button>
          <Button
            variant="outline"
            fullWidth
            iconName="TrendingUp"
            iconPosition="left"
            onClick={handleViewCredit}
          >
            View Credit Report
          </Button>
          <Button
            variant="outline"
            fullWidth
            iconName="FileText"
            iconPosition="left"
            onClick={() => navigate('/loan-details')}
          >
            View Contract
          </Button>
          <Button
            variant="outline"
            fullWidth
            iconName="BarChart3"
            iconPosition="left"
            onClick={() => navigate('/agent-dashboard')}
          >
            Portfolio Overview
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 lg:p-8 shadow-glow-md">
      <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4 md:mb-6">
        Borrower Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <Button
          variant="default"
          fullWidth
          iconName="DollarSign"
          iconPosition="left"
          onClick={handleMakePayment}
          disabled={loanStatus === 'completed'}
        >
          Make Payment
        </Button>
        <Button
          variant="outline"
          fullWidth
          iconName="TrendingUp"
          iconPosition="left"
          onClick={handleViewCredit}
        >
          View Credit Score
        </Button>
        <Button
          variant="outline"
          fullWidth
          iconName="FileText"
          iconPosition="left"
          onClick={() => navigate('/loan-details')}
        >
          Download Contract
        </Button>
        <Button
          variant="outline"
          fullWidth
          iconName="Calendar"
          iconPosition="left"
          onClick={() => navigate('/borrower-dashboard')}
        >
          Payment Schedule
        </Button>
      </div>
    </div>
  );
};

export default ActionButtons;