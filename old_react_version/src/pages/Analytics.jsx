import React from 'react';
import { useAppContext } from '../context/AppContext';
import { calculateMetrics, estimateFutureExpense } from '../utils/financeEngine';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

export default function Analytics() {
  const { data } = useAppContext();
  const metrics = calculateMetrics(data.transactions);
  const estimation = estimateFutureExpense(data.transactions);

  const pieData = Object.keys(metrics.categoryTotals).map(cat => ({
    name: cat,
    value: metrics.categoryTotals[cat]
  })).sort((a,b) => b.value - a.value);

  // Simple monthly breakdown for BarChart
  const monthlyDataMap = {};
  data.transactions.filter(t => t.type === 'expense').forEach(t => {
    const month = t.date.substring(0, 7); // YYYY-MM
    monthlyDataMap[month] = (monthlyDataMap[month] || 0) + parseFloat(t.amount);
  });
  
  const barData = Object.keys(monthlyDataMap).sort().map(m => ({
    month: m,
    expense: monthlyDataMap[m]
  }));

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Financial Analytics</h1>

      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-title">This Month's Category Split</div>
          <div style={{ height: '300px' }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `${data.profile.currency}${value.toFixed(2)}`} contentStyle={{ backgroundColor: 'var(--bg-panel)', border: 'none', color: '#fff' }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-muted" style={{ textAlign: 'center', marginTop: '100px' }}>No expenses this month</p>}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Monthly Trend Analysis</div>
          <div style={{ height: '300px' }}>
            {barData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={barData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                   <XAxis dataKey="month" stroke="var(--text-muted)" />
                   <YAxis stroke="var(--text-muted)" />
                   <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'var(--bg-panel)', border: 'none', color: '#fff' }}/>
                   <Bar dataKey="expense" fill="var(--primary)" background={{ fill: 'rgba(255,255,255,0.05)' }} />
                 </BarChart>
               </ResponsiveContainer>
            ) : <p className="text-muted" style={{ textAlign: 'center', marginTop: '100px' }}>No historical data</p>}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Predictive Estimations</div>
        <p>Based on your historical averages across {Object.keys(monthlyDataMap).length} months, your estimated standard spending velocity is:</p>
        <h2 style={{ fontSize: '2rem', marginTop: '1rem', color: 'var(--warning)' }}>{data.profile.currency}{estimation.toFixed(2)} / month</h2>
      </div>
    </div>
  );
}
