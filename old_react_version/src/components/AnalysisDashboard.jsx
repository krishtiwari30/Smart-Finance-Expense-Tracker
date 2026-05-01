import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#64748b'];

export default function AnalysisDashboard({ totalSpend, categoryTotals }) {
  const chartData = Object.keys(categoryTotals).map((key, index) => ({
    name: key,
    value: categoryTotals[key]
  })).sort((a, b) => b.value - a.value);

  // Calculate highest spend category
  const highestCategory = chartData.length > 0 ? chartData[0].name : 'N/A';

  return (
    <div>
      <div className="summary-cards">
        <div className="summary-card">
          <p>Total Expenses</p>
          <h3>₹{totalSpend.toFixed(0)}</h3>
        </div>
        <div className="summary-card">
          <p>Highest Spend</p>
          <h3 style={{ fontSize: '1.2rem', marginTop: '0.25rem' }}>{highestCategory}</h3>
        </div>
      </div>

      <div className="chart-container">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value) => `₹${value.toFixed(2)}`}
                contentStyle={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: '0.5rem', color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
            <p>Not enough data for chart</p>
          </div>
        )}
      </div>
      
      {chartData.length > 0 && (
        <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
          {chartData.map((entry, index) => (
            <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[index % COLORS.length] }}></div>
              {entry.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
