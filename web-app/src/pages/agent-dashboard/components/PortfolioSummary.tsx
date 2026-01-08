import React from 'react';
import Icon from '../../../components/AppIcon';

const PortfolioSummaryCard = ({ icon, label, value, subValue, trend, trendDirection, iconBgColor, iconColor }) => {
  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-glow-sm hover:shadow-glow-md transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-xl ${iconBgColor}`}>
          <Icon name={icon} size={24} className={iconColor} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
            trendDirection === 'up' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
          }`}>
            <Icon name={trendDirection === 'up' ? 'TrendingUp' : 'TrendingDown'} size={14} />
            <span className="text-xs font-medium">{trend}</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xs md:text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground">{value}</p>
        {subValue && (
          <p className="text-xs md:text-sm text-muted-foreground">{subValue}</p>
        )}
      </div>
    </div>
  );
};

export default PortfolioSummaryCard;