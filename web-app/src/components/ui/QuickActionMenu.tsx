import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

import { useNavigation } from '../../contexts/NavigationContext';

const QuickActionMenu = ({ isOpen, onClose, triggerRef }) => {
  const navigate = useNavigate();
  const { userRole } = useNavigation();

  const agentActions = [
    { label: 'Create New Loan', path: '/create-loan', icon: 'Plus', description: 'Set up a new loan offer' },
    { label: 'View Portfolio', path: '/agent-dashboard', icon: 'Briefcase', description: 'Check your lending portfolio' },
    { label: 'Review Applications', path: '/loan-details', icon: 'FileText', description: 'Process pending requests' },
  ];

  const borrowerActions = [
    { label: 'Make Payment', path: '/payment-processing', icon: 'CreditCard', description: 'Pay your loan installment' },
    { label: 'View Credit Score', path: '/credit-profile', icon: 'TrendingUp', description: 'Check your credit status' },
    { label: 'Browse Loans', path: '/loan-details', icon: 'Search', description: 'Find available loan offers' },
  ];

  const actions = userRole === 'agent' ? agentActions : borrowerActions;

  const handleActionClick = (path) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-lg shadow-glow-xl animate-slide-down overflow-hidden z-[1100]">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-popover-foreground">Quick Actions</h3>
        <p className="text-xs text-muted-foreground mt-1">Common tasks for {userRole}s</p>
      </div>
      <div className="p-2">
        {actions?.map((action) => (
          <button
            key={action?.path}
            onClick={() => handleActionClick(action?.path)}
            className="w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left hover:bg-muted/50 transition-smooth group"
          >
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-smooth">
              <Icon name={action?.icon} size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-popover-foreground">{action?.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{action?.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionMenu;