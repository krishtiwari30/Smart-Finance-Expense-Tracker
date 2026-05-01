import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { calculateMetrics } from '../utils/financeEngine';
import { Target, ShieldAlert, Plus } from 'lucide-react';

export default function Goals() {
  const { data, setBudget, addGoal, updateGoal } = useAppContext();
  const metrics = calculateMetrics(data.transactions);
  
  const [bCategory, setBCategory] = useState('Food');
  const [bLimit, setBLimit] = useState('');
  
  const [gName, setGName] = useState('');
  const [gTarget, setGTarget] = useState('');

  const handleBudget = (e) => {
    e.preventDefault();
    if(bLimit) { setBudget(bCategory, parseFloat(bLimit)); setBLimit(''); }
  };
  
  const handleGoal = (e) => {
    e.preventDefault();
    if(gName && gTarget) { 
      addGoal({ name: gName, targetAmount: parseFloat(gTarget), currentAmount: 0 }); 
      setGName(''); setGTarget('');
    }
  };

  return (
    <div className="grid-2">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="card">
          <div className="card-title"><ShieldAlert size={18}/> Set Budgets (Alert Limits)</div>
          <form onSubmit={handleBudget} style={{ display: 'flex', gap: '0.5rem' }}>
            <select className="form-input" value={bCategory} onChange={e => setBCategory(e.target.value)} style={{ flex: 1 }}>
              {['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input className="form-input" type="number" placeholder="Limit" value={bLimit} onChange={e => setBLimit(e.target.value)} style={{ flex: 1 }} />
            <button className="btn" type="submit" style={{ width: 'auto' }}>Set</button>
          </form>
          
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Active Budgets</h4>
            {Object.keys(data.budgets).map(cat => {
              const limit = data.budgets[cat];
              const spent = metrics.categoryTotals[cat] || 0;
              const pct = Math.min(100, (spent/limit)*100);
              return (
                <div key={cat} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    <span>{cat}</span>
                    <span>{spent} / {limit} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--bg-dark)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, backgroundColor: pct >= 100 ? 'var(--danger)' : pct >= 80 ? 'var(--warning)' : 'var(--success)' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="card">
          <div className="card-title"><Target size={18}/> Savings Goals</div>
          <form onSubmit={handleGoal} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input className="form-input" type="text" placeholder="Goal (e.g. Car)" value={gName} onChange={e => setGName(e.target.value)} style={{ flex: 2 }} />
            <input className="form-input" type="number" placeholder="Amount" value={gTarget} onChange={e => setGTarget(e.target.value)} style={{ flex: 1 }} />
            <button className="btn" type="submit" style={{ width: 'auto' }}><Plus size={18}/></button>
          </form>

          <div>
            {data.goals.map(g => {
              const pct = Math.min(100, (g.currentAmount/g.targetAmount)*100);
              return (
                <div key={g.id} style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-dark)', borderRadius: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600 }}>{g.name}</span>
                    <span className="text-primary">{g.currentAmount} / {g.targetAmount}</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                    <div style={{ height: '100%', width: `${pct}%`, backgroundColor: 'var(--primary)' }}></div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                     <input className="form-input" type="number" placeholder="Add funds" style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                            onKeyDown={e => { if(e.key==='Enter') { updateGoal(g.id, g.currentAmount + parseFloat(e.target.value)); e.target.value=''; } }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
