'use client';

import AppIcon from '@/components/AppIcon';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: string;
  potentialIncrease: number;
  icon: string;
  priority?: 'high' | 'medium' | 'low';
  timeframe?: string;
  steps?: string[];
}

interface ImprovementRecommendationsProps {
  recommendations: Recommendation[];
}

export default function ImprovementRecommendations({ recommendations }: ImprovementRecommendationsProps) {
  const getPriorityConfig = (priority: string = 'medium') => {
    const configs: Record<string, { icon: string; color: string; bg: string; border: string; label: string }> = {
      high: {
        icon: 'AlertCircle',
        color: 'text-error',
        bg: 'bg-error/10',
        border: 'border-error/20',
        label: 'High Priority',
      },
      medium: {
        icon: 'Info',
        color: 'text-warning',
        bg: 'bg-warning/10',
        border: 'border-warning/20',
        label: 'Medium Priority',
      },
      low: {
        icon: 'CheckCircle2',
        color: 'text-success',
        bg: 'bg-success/10',
        border: 'border-success/20',
        label: 'Low Priority',
      },
    };
    return configs[priority] || configs.medium;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-glow-md">
      <div className="mb-6">
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">Improvement Recommendations</h3>
        <p className="text-sm text-muted-foreground">Actionable steps to boost your score</p>
      </div>
      <div className="space-y-4">
        {recommendations.map((rec, index) => {
          const config = getPriorityConfig(rec.priority || rec.impact?.toLowerCase());
          return (
            <div
              key={rec.id || index}
              className={`p-4 rounded-lg border ${config.border} ${config.bg} hover:shadow-glow-md transition-smooth`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${config.bg} flex-shrink-0`}>
                  <AppIcon name={rec.icon || config.icon} size={18} className={config.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                    <h4 className="text-sm font-semibold text-foreground">{rec.title}</h4>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${config.bg} ${config.color} w-fit`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>

                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                    <div className="flex items-center gap-2">
                      <AppIcon name="TrendingUp" size={14} className="text-success" />
                      <span className="text-xs text-muted-foreground">
                        Potential Impact: <span className="font-semibold text-success">+{rec.potentialIncrease} pts</span>
                      </span>
                    </div>
                    {rec.timeframe && (
                      <div className="flex items-center gap-2">
                        <AppIcon name="Clock" size={14} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Timeframe: <span className="font-medium text-foreground">{rec.timeframe}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {rec.steps && rec.steps.length > 0 && (
                <div className="ml-11 space-y-2">
                  {rec.steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">{step}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

