import React from 'react';
import Icon from '../../../components/AppIcon';

const RecentActivityCard = ({ activity }) => {
  const getActivityConfig = (type) => {
    const configs = {
      payment: { icon: 'CreditCard', color: 'text-success', bgColor: 'bg-success/10' },
      credit_change: { icon: 'TrendingUp', color: 'text-primary', bgColor: 'bg-primary/10' },
      deadline: { icon: 'Clock', color: 'text-warning', bgColor: 'bg-warning/10' },
      default: { icon: 'AlertCircle', color: 'text-error', bgColor: 'bg-error/10' }
    };
    return configs?.[type] || configs?.payment;
  };

  const config = getActivityConfig(activity?.type);

  return (
    <div className="flex items-start gap-3 p-3 md:p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-smooth">
      <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg ${config?.bgColor}`}>
        <Icon name={config?.icon} size={18} className={config?.color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-medium text-foreground">{activity?.title}</p>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{activity?.time}</span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{activity?.description}</p>
        {activity?.verified && (
          <div className="flex items-center gap-1.5 mt-2">
            <Icon name="Shield" size={12} className="text-primary" />
            <span className="text-xs text-primary">Blockchain Verified</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivityCard;