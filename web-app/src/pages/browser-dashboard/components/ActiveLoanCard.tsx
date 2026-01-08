import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ActiveLoanCard = ({ loan, onMakePayment }) => {
  const calculateProgress = () => {
    return ((loan?.paidAmount / loan?.totalAmount) * 100)?.toFixed(1);
  };

  const getDaysUntilDue = () => {
    const today = new Date();
    const dueDate = new Date(loan.nextPaymentDue);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue();
  const isOverdue = daysUntilDue < 0;
  const isUrgent = daysUntilDue <= 3 && daysUntilDue >= 0;

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-glow-md">
      <div className="flex items-start justify-between mb-4 md:mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base md:text-lg font-semibold text-foreground truncate">{loan?.loanName}</h3>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              loan?.status === 'Active' ? 'bg-success/10 text-success' : 
              loan?.status === 'Pending'? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
            }`}>
              {loan?.status}
            </span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">Loan ID: {loan?.loanId}</p>
        </div>
        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
          <Icon name="DollarSign" size={20} className="text-primary" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="p-3 md:p-4 bg-muted/30 rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Total Amount</div>
          <div className="text-lg md:text-xl lg:text-2xl font-bold text-foreground">${loan?.totalAmount?.toLocaleString()}</div>
        </div>
        <div className="p-3 md:p-4 bg-muted/30 rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Remaining</div>
          <div className="text-lg md:text-xl lg:text-2xl font-bold text-foreground">${loan?.remainingAmount?.toLocaleString()}</div>
        </div>
      </div>
      <div className="mb-4 md:mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs md:text-sm text-muted-foreground">Repayment Progress</span>
          <span className="text-xs md:text-sm font-medium text-foreground">{calculateProgress()}%</span>
        </div>
        <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <Icon name="Percent" size={18} className="text-primary" />
          <div>
            <div className="text-xs text-muted-foreground">Interest Rate</div>
            <div className="text-sm md:text-base font-semibold text-foreground">{loan?.interestRate}% APR</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <Icon name="Calendar" size={18} className="text-primary" />
          <div>
            <div className="text-xs text-muted-foreground">Next Payment</div>
            <div className="text-sm md:text-base font-semibold text-foreground">${loan?.nextPaymentAmount?.toLocaleString()}</div>
          </div>
        </div>
      </div>
      <div className={`flex items-center gap-2 p-3 md:p-4 rounded-lg mb-4 ${
        isOverdue ? 'bg-error/10 border border-error/20' : isUrgent ?'bg-warning/10 border border-warning/20': 'bg-muted/30'
      }`}>
        <Icon 
          name={isOverdue ? 'AlertCircle' : 'Clock'} 
          size={18} 
          className={isOverdue ? 'text-error' : isUrgent ? 'text-warning' : 'text-muted-foreground'} 
        />
        <div className="flex-1">
          <div className="text-xs text-muted-foreground">Payment Due</div>
          <div className={`text-sm md:text-base font-medium ${
            isOverdue ? 'text-error' : isUrgent ? 'text-warning' : 'text-foreground'
          }`}>
            {new Date(loan.nextPaymentDue)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {isOverdue && ' (Overdue)'}
            {isUrgent && !isOverdue && ` (${daysUntilDue} days left)`}
          </div>
        </div>
      </div>
      <Button 
        variant={isOverdue ? "destructive" : "default"}
        fullWidth 
        iconName="CreditCard" 
        iconPosition="left"
        onClick={() => onMakePayment(loan)}
      >
        {isOverdue ? 'Pay Overdue Amount' : 'Make Payment'}
      </Button>
    </div>
  );
};

export default ActiveLoanCard;