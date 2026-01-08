import React from 'react';
import Icon from '../../../components/AppIcon';

const CreditImpactCard = ({ currentScore, projectedScore, scoreChange, impactFactors }) => {
  const isPositive = scoreChange > 0;

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 lg:p-8 shadow-glow-md">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg bg-accent/10">
          <Icon name="TrendingUp" size={20} className="text-accent md:w-6 md:h-6" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground">Credit Score Impact</h2>
          <p className="text-xs md:text-sm text-muted-foreground">Payment Effect Analysis</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Activity" size={16} className="text-muted-foreground" />
            <span className="text-xs md:text-sm text-muted-foreground">Current Score</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-foreground">{currentScore}</p>
        </div>

        <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Target" size={16} className="text-accent" />
            <span className="text-xs md:text-sm text-accent">Projected Score</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl md:text-3xl font-bold text-accent">{projectedScore}</p>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${isPositive ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
              <Icon name={isPositive ? 'ArrowUp' : 'ArrowDown'} size={14} />
              <span className="text-xs font-semibold">{Math.abs(scoreChange)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-sm md:text-base font-semibold text-foreground mb-3">Impact Factors</h3>
        {impactFactors?.map((factor, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
            <div className={`w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 ${
              factor?.impact === 'positive' ? 'bg-success/10 text-success' : 
              factor?.impact === 'negative'? 'bg-error/10 text-error' : 'bg-muted text-muted-foreground'
            }`}>
              <Icon name={factor?.icon} size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm md:text-base font-medium text-foreground">{factor?.label}</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">{factor?.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 p-4 bg-primary/10 rounded-lg border border-primary/20 mt-6">
        <Icon name="Sparkles" size={20} className="text-primary flex-shrink-0" />
        <p className="text-xs md:text-sm text-primary">On-time payments improve your credit score and unlock better loan terms</p>
      </div>
    </div>
  );
};

export default CreditImpactCard;