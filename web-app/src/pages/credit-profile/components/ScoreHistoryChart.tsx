import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ScoreHistoryChart = ({ data }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-glow-lg">
          <p className="text-sm font-medium text-popover-foreground mb-1">{payload?.[0]?.payload?.month}</p>
          <p className="text-sm text-muted-foreground">Score: <span className="font-semibold text-primary">{payload?.[0]?.value}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-glow-md">
      <div className="mb-6">
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">Score History</h3>
        <p className="text-sm text-muted-foreground">Last 6 months performance</p>
      </div>

      <div className="w-full h-64 md:h-80" aria-label="Credit Score History Line Chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
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
              domain={[300, 850]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="var(--color-primary)" 
              strokeWidth={3}
              dot={{ fill: 'var(--color-primary)', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ScoreHistoryChart;