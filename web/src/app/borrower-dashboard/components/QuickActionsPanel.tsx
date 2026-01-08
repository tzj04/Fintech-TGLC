'use client';

import AppIcon from '@/components/AppIcon';

interface QuickActionsPanelProps {
  onBrowseLoans: () => void;
  onMakePayment: () => void;
  onViewCredit: () => void;
}

export default function QuickActionsPanel({ onBrowseLoans, onMakePayment, onViewCredit }: QuickActionsPanelProps) {
  const actions = [
    {
      id: 'browse',
      title: 'Browse Loans',
      description: 'Explore available loan offers',
      icon: 'Search',
      color: 'text-primary',
      bg: 'bg-primary/10',
      onClick: onBrowseLoans,
    },
    {
      id: 'payment',
      title: 'Make Payment',
      description: 'Pay your loan installment',
      icon: 'CreditCard',
      color: 'text-success',
      bg: 'bg-success/10',
      onClick: onMakePayment,
    },
    {
      id: 'credit',
      title: 'Credit Report',
      description: 'View detailed credit analysis',
      icon: 'TrendingUp',
      color: 'text-accent',
      bg: 'bg-accent/10',
      onClick: onViewCredit,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={action.onClick}
          className="flex items-start gap-3 md:gap-4 p-4 md:p-6 bg-card border border-border rounded-xl hover:shadow-glow-md transition-smooth group text-left"
        >
          <div
            className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-lg ${action.bg} group-hover:scale-110 transition-smooth flex-shrink-0`}
          >
            <AppIcon name={action.icon} size={24} className={action.color} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm md:text-base font-semibold text-foreground mb-1 group-hover:text-primary transition-smooth">
              {action.title}
            </h4>
            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{action.description}</p>
          </div>
          <AppIcon
            name="ArrowRight"
            size={18}
            className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-smooth flex-shrink-0 mt-1"
          />
        </button>
      ))}
    </div>
  );
}

