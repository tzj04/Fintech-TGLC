import React from 'react';
import Icon from '../../../components/AppIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdvancedAnalytics = ({ utilizationData, consistencyScore, platformBenchmark }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-glow-lg">
          <p className="text-sm font-medium text-popover-foreground mb-1">{payload?.[0]?.payload?.month}</p>
          <p className="text-sm text-muted-foreground">Utilization: <span className="font-semibold text-primary">{payload?.[0]?.value}%</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-glow-md">
      <div className="mb-6">
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">Advanced Analytics</h3>
        <p className="text-sm text-muted-foreground">Detailed performance metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="p-4 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon name="Activity" size={18} className="text-primary" />
              <span className="text-sm font-semibold text-foreground">Payment Consistency</span>
            </div>
            <span className="text-2xl font-bold text-success">{consistencyScore}%</span>
          </div>
          <div className="relative w-full h-2 bg-muted/50 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-success transition-all duration-500"
              style={{ width: `${consistencyScore}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Based on last 12 months of payment behavior</p>
        </div>

        <div className="p-4 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon name="Users" size={18} className="text-primary" />
              <span className="text-sm font-semibold text-foreground">Platform Benchmark</span>
            </div>
            <span className="text-2xl font-bold text-primary">{platformBenchmark}%</span>
          </div>
          <div className="relative w-full h-2 bg-muted/50 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-primary transition-all duration-500"
              style={{ width: `${platformBenchmark}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">You're performing better than {platformBenchmark}% of borrowers</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-foreground mb-4">Credit Utilization Pattern</h4>
        <div className="w-full h-48 md:h-64" aria-label="Credit Utilization Bar Chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={utilizationData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
              <XAxis 
                dataKey="month" 
                stroke="var(--color-muted-foreground)" 
                style={{ fontSize: '12px' }}
                tick={{ fill: 'var(--color-muted-foreground)' }}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)" 
                style={{ fontSize: '12px' }}
                tick={{ fill: 'var(--color-muted-foreground)' }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="utilization" 
                fill="var(--color-primary)" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground mt-3">Lower utilization rates positively impact your credit score</p>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;