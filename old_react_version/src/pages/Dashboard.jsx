import React from 'react';
import { useAppContext } from '../context/AppContext';
import { calculateMetrics, calculateHealthScore, generateSmartAlerts } from '../utils/financeEngine';
import { TrendingUp, TrendingDown, Target, Activity, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const { data } = useAppContext();
  const metrics = calculateMetrics(data.transactions);
  const health = calculateHealthScore(metrics.ratio, data.budgets, metrics.categoryTotals);
  const alerts = generateSmartAlerts(metrics.thisMonthExpense, metrics.totalIncome, metrics.categoryTotals, data.budgets);

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Overview Dashboard</h1>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>Welcome back to your financial snapshot.</p>
      
      {alerts.map((a, i) => (
        <div key={i} className="card" style={{ marginBottom: '1rem', borderLeft: `4px solid var(--${a.type})` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} className={`text-${a.type}`} />
            <span>{a.msg}</span>
          </div>
        </div>
      ))}

      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-title text-success"><TrendingUp size={18} /> Total Income</div>
          <h2 style={{ fontSize: '2rem' }}>{data.profile.currency}{metrics.totalIncome.toFixed(2)}</h2>
        </div>
        <div className="card">
          <div className="card-title text-danger"><TrendingDown size={18} /> Total Expenses</div>
          <h2 style={{ fontSize: '2rem' }}>{data.profile.currency}{metrics.totalExpense.toFixed(2)}</h2>
        </div>
        <div className="card">
          <div className="card-title text-primary"><Target size={18} /> Savings Balances</div>
          <h2 style={{ fontSize: '2rem' }}>{data.profile.currency}{(metrics.totalIncome - metrics.totalExpense).toFixed(2)}</h2>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title"><Activity size={18} /> Financial Health Score</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
            <h1 style={{ fontSize: '4rem', margin: 0, lineHeight: 1, color: health.score > 70 ? 'var(--success)' : health.score > 40 ? 'var(--warning)' : 'var(--danger)' }}>
              {health.score}
            </h1>
            <div style={{ paddingBottom: '0.5rem' }}>
              <div style={{ fontWeight: 600, fontSize: '1.2rem' }}>{health.label}</div>
              <div className="text-muted">Based on your savings ratio ({metrics.ratio.toFixed(1)}%) and budget hits.</div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-title">Recent Transactions</div>
          {data.transactions.slice(0, 5).map(t => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{t.description}</div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>{t.category} • {t.date}</div>
              </div>
              <div className={t.type === 'income' ? 'text-success' : ''} style={{ fontWeight: 600 }}>
                {t.type === 'income' ? '+' : '-'}{data.profile.currency}{t.amount}
              </div>
            </div>
          ))}
          {data.transactions.length === 0 && <div className="text-muted">No transactions yet.</div>}
        </div>
      </div>
    </div>
  );
}
