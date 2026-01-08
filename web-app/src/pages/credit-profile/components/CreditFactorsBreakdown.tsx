import React from 'react';
import Icon from '../../../components/AppIcon';

const CreditFactorsBreakdown = ({ factors }) => {
  const getFactorIcon = (type) => {
    const icons = {
      payment: 'CreditCard',
      diversity: 'BarChart3',
      tenure: 'Calendar',
      utilization: 'PieChart',
      inquiries: 'Search'
    };
    return icons?.[type] || 'Info';
  };

  const getImpactColor = (impact) => {
    if (impact >= 80) return 'text-success';
    if (impact >= 60) return 'text-warning';
    return 'text-error';
  };

  const getImpactBg = (impact) => {
    if (impact >= 80) return 'bg-success';
    if (impact >= 60) return 'bg-warning';
    return 'bg-error';
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-glow-md">
      <div className="mb-6">
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">Credit Factors</h3>
        <p className="text-sm text-muted-foreground">What impacts your score</p>
      </div>
      <div className="space-y-4">
        {factors?.map((factor, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                  <Icon name={getFactorIcon(factor?.type)} size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground mb-1">{factor?.name}</h4>
                  <p className="text-xs text-muted-foreground">{factor?.description}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-lg font-bold ${getImpactColor(factor?.impact)}`}>
                  {factor?.impact}%
                </div>
                <div className="text-xs text-muted-foreground">Weight</div>
              </div>
            </div>

            <div className="relative w-full h-2 bg-muted/30 rounded-full overflow-hidden">
              <div 
                className={`absolute left-0 top-0 h-full ${getImpactBg(factor?.impact)} transition-all duration-500`}
                style={{ width: `${factor?.impact}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Current: {factor?.current}</span>
              <span className={getImpactColor(factor?.impact)}>
                {factor?.impact >= 80 ? 'Excellent' : factor?.impact >= 60 ? 'Good' : 'Needs Improvement'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreditFactorsBreakdown;