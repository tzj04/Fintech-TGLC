import React from 'react';
import Icon from '../../../components/AppIcon';

const CreditImpactSection = ({ creditData, userRole }) => {
  const getImpactColor = (impact) => {
    if (impact > 0) return 'text-success';
    if (impact < 0) return 'text-error';
    return 'text-muted-foreground';
  };

  const getImpactIcon = (impact) => {
    if (impact > 0) return 'TrendingUp';
    if (impact < 0) return 'TrendingDown';
    return 'Minus';
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 lg:p-8 shadow-glow-md">
      <div className="flex items-center gap-3 mb-6 lg:mb-8">
        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg bg-accent/10">
          <Icon name="TrendingUp" size={24} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground">
            {userRole === 'agent' ? 'Borrower Credit Information' : 'Credit Impact'}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            {userRole === 'agent' ? 'Credit history and risk assessment' : 'How this loan affects your credit'}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 lg:mb-8">
        <div className="p-4 md:p-6 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg border border-accent/20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Current Score</span>
            <Icon name="Award" size={20} className="text-accent" />
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl md:text-4xl font-bold text-foreground">
              {creditData?.currentScore}
            </span>
            <span className="text-lg text-muted-foreground">/ 850</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${(creditData?.currentScore / 850) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-4 md:p-6 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Score Change</span>
            <Icon 
              name={getImpactIcon(creditData?.scoreChange)} 
              size={20} 
              className={getImpactColor(creditData?.scoreChange)} 
            />
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className={`text-3xl md:text-4xl font-bold ${getImpactColor(creditData?.scoreChange)}`}>
              {creditData?.scoreChange > 0 ? '+' : ''}{creditData?.scoreChange}
            </span>
            <span className="text-lg text-muted-foreground">points</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {creditData?.scoreChange > 0 ? 'Improved' : creditData?.scoreChange < 0 ? 'Decreased' : 'No change'} since last month
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-base md:text-lg font-semibold text-foreground">
          Credit Factors
        </h3>
        
        {creditData?.factors?.map((factor, index) => (
          <div key={index} className="p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm md:text-base font-medium text-foreground mb-1">
                  {factor?.name}
                </h4>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {factor?.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Icon 
                  name={getImpactIcon(factor?.impact)} 
                  size={18} 
                  className={getImpactColor(factor?.impact)} 
                />
                <span className={`text-sm font-semibold ${getImpactColor(factor?.impact)}`}>
                  {factor?.impact > 0 ? '+' : ''}{factor?.impact}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    factor?.impact > 0 ? 'bg-success' : factor?.impact < 0 ? 'bg-error' : 'bg-muted-foreground'
                  }`}
                  style={{ width: `${factor?.percentage}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {factor?.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
      {userRole === 'borrower' && (
        <div className="mt-6 lg:mt-8 p-4 md:p-6 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-start gap-3">
            <Icon name="Lightbulb" size={20} className="text-primary mt-1" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm md:text-base font-semibold text-foreground mb-2">
                Credit Improvement Tips
              </h4>
              <ul className="space-y-2">
                {creditData?.improvementTips?.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs md:text-sm text-muted-foreground">
                    <Icon name="Check" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditImpactSection;