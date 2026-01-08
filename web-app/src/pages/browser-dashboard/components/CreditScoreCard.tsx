import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CreditScoreCard = ({ creditScore, rating, trend, onViewReport }) => {
  const getScoreColor = (score) => {
    if (score >= 750) return 'text-success';
    if (score >= 650) return 'text-warning';
    return 'text-error';
  };

  const getScoreBgColor = (score) => {
    if (score >= 750) return 'bg-success/10';
    if (score >= 650) return 'bg-warning/10';
    return 'bg-error/10';
  };

  const getRatingIcon = (rating) => {
    const icons = {
      'Excellent': 'TrendingUp',
      'Good': 'ThumbsUp',
      'Fair': 'Minus',
      'Poor': 'TrendingDown'
    };
    return icons?.[rating] || 'Minus';
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-glow-md">
      <div className="flex items-start justify-between mb-4 md:mb-6">
        <div>
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-1">Credit Score</h3>
          <p className="text-xs md:text-sm text-muted-foreground">Blockchain-verified rating</p>
        </div>
        <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg ${getScoreBgColor(creditScore)}`}>
          <Icon name="Award" size={20} className={getScoreColor(creditScore)} />
        </div>
      </div>

      <div className="flex items-end gap-3 md:gap-4 mb-4 md:mb-6">
        <div className={`text-4xl md:text-5xl lg:text-6xl font-bold ${getScoreColor(creditScore)}`}>
          {creditScore}
        </div>
        <div className="flex items-center gap-1.5 mb-2">
          <Icon 
            name={trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingDown' : 'Minus'} 
            size={16} 
            className={trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-muted-foreground'} 
          />
          <span className="text-xs md:text-sm text-muted-foreground">vs last month</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 md:mb-6 p-3 md:p-4 bg-muted/30 rounded-lg">
        <Icon name={getRatingIcon(rating)} size={18} className={getScoreColor(creditScore)} />
        <div className="flex-1">
          <div className="text-sm md:text-base font-medium text-foreground">{rating}</div>
          <div className="text-xs text-muted-foreground">Credit Rating</div>
        </div>
      </div>

      <Button 
        variant="outline" 
        fullWidth 
        iconName="FileText" 
        iconPosition="left"
        onClick={onViewReport}
      >
        View Full Report
      </Button>
    </div>
  );
};

export default CreditScoreCard;