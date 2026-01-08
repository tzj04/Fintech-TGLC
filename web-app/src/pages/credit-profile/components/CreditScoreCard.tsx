import React from 'react';
import Icon from '../../../components/AppIcon';

const CreditScoreCard = ({ score, rating, change, trend }) => {
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

  const getRatingLabel = (rating) => {
    const labels = {
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor'
    };
    return labels?.[rating] || 'Unknown';
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-glow-md">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-foreground mb-1">Credit Score</h2>
          <p className="text-sm text-muted-foreground">Blockchain-verified rating</p>
        </div>
        <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg ${getScoreBgColor(score)}`}>
          <Icon name="TrendingUp" size={20} className={getScoreColor(score)} />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <div className={`text-5xl md:text-6xl font-bold ${getScoreColor(score)} mb-2`}>
            {score}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${getScoreBgColor(score)} ${getScoreColor(score)}`}>
              {getRatingLabel(rating)}
            </span>
            <div className="flex items-center gap-1">
              <Icon 
                name={trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingDown' : 'Minus'} 
                size={16} 
                className={trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-muted-foreground'} 
              />
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-muted-foreground'}`}>
                {change > 0 ? '+' : ''}{change} pts
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 md:gap-6">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Poor</div>
            <div className="text-sm font-medium text-error">300-579</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Fair</div>
            <div className="text-sm font-medium text-warning">580-669</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Good</div>
            <div className="text-sm font-medium text-success">670-850</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditScoreCard;