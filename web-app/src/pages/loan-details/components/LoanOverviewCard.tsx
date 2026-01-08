import React from 'react';
import Icon from '../../../components/AppIcon';

const LoanOverviewCard = ({ loan, userRole }) => {
  const getStatusConfig = (status) => {
    const configs = {
      active: {
        icon: 'CheckCircle2',
        color: 'text-success',
        bgColor: 'bg-success/10',
        label: 'Active'
      },
      pending: {
        icon: 'Clock',
        color: 'text-warning',
        bgColor: 'bg-warning/10',
        label: 'Pending'
      },
      completed: {
        icon: 'CheckCircle',
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        label: 'Completed'
      },
      defaulted: {
        icon: 'XCircle',
        color: 'text-error',
        bgColor: 'bg-error/10',
        label: 'Defaulted'
      }
    };
    return configs?.[status] || configs?.active;
  };

  const statusConfig = getStatusConfig(loan?.status);

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 lg:p-8 shadow-glow-md">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground">
              Loan #{loan?.id}
            </h1>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusConfig?.bgColor}`}>
              <Icon name={statusConfig?.icon} size={16} className={statusConfig?.color} />
              <span className={`text-sm font-medium ${statusConfig?.color}`}>
                {statusConfig?.label}
              </span>
            </div>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            Created on {loan?.createdDate}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
            <Icon name="Wallet" size={20} className="text-primary" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Loan Amount</span>
              <span className="text-lg md:text-xl font-semibold text-primary">
                ${loan?.amount?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-accent/10">
            <Icon name="Percent" size={20} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">Interest Rate</p>
            <p className="text-lg md:text-xl font-semibold text-foreground">{loan?.interestRate}%</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10">
            <Icon name="Calendar" size={20} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">Term Length</p>
            <p className="text-lg md:text-xl font-semibold text-foreground">{loan?.termLength}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-success/10">
            <Icon name="DollarSign" size={20} className="text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">Amount Paid</p>
            <p className="text-lg md:text-xl font-semibold text-foreground">
              ${loan?.amountPaid?.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-warning/10">
            <Icon name="Clock" size={20} className="text-warning" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">Next Payment</p>
            <p className="text-lg md:text-xl font-semibold text-foreground">{loan?.nextPaymentDate}</p>
          </div>
        </div>
      </div>
      <div className="mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name={userRole === 'agent' ? 'User' : 'Briefcase'} size={24} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">
                {userRole === 'agent' ? 'Borrower' : 'Agent'}
              </p>
              <p className="text-sm md:text-base font-medium text-foreground truncate">
                {userRole === 'agent' ? loan?.borrowerName : loan?.agentName}
              </p>
              <p className="text-xs text-muted-foreground font-mono truncate">
                {userRole === 'agent' ? loan?.borrowerWallet : loan?.agentWallet}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Icon name="TrendingUp" size={24} className="text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Credit Score</p>
              <p className="text-sm md:text-base font-medium text-foreground">
                {loan?.creditScore} / 850
              </p>
              <div className="w-full h-2 bg-muted rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-accent rounded-full transition-all duration-500"
                  style={{ width: `${(loan?.creditScore / 850) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanOverviewCard;