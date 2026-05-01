import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Trash2, PlusCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Salary', 'Investment', 'Other'];

export default function Transactions() {
  const { data, addTransaction, deleteTransaction } = useAppContext();
  
  const [formData, setFormData] = useState({
    amount: '',
    category: CATEGORIES[0],
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || isNaN(formData.amount)) return;
    addTransaction({ ...formData, amount: parseFloat(formData.amount) });
    setFormData({ ...formData, amount: '', description: '' });
  };

  return (
    <div className="grid-2">
      <div className="card" style={{ alignSelf: 'start' }}>
        <div className="card-title"><PlusCircle size={18} /> Record New Entry</div>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="radio" checked={formData.type === 'expense'} onChange={() => setFormData({...formData, type: 'expense'})} /> 
              <span>Expense</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="radio" checked={formData.type === 'income'} onChange={() => setFormData({...formData, type: 'income'})} /> 
              <span>Income</span>
            </label>
          </div>

          <div className="form-group">
            <label>Amount ({data.profile.currency})</label>
            <input className="form-input" type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
          </div>
          
          <div className="form-group">
            <label>Category</label>
            <select className="form-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          
          <div className="form-group">
            <label>Description (Optional)</label>
            <input className="form-input" type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          
          <div className="form-group">
            <label>Date</label>
            <input className="form-input" type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          
          <button className="btn" type="submit">Submit Entry</button>
        </form>
      </div>
      
      <div className="card">
        <div className="card-title">Transaction History</div>
        <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {data.transactions.map(t => (
             <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.2)', marginBottom: '0.5rem', borderRadius: '0.5rem' }}>
               <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                 {t.type === 'expense' ? <ArrowDownCircle className="text-danger" /> : <ArrowUpCircle className="text-success" />}
                 <div>
                   <div style={{ fontWeight: 600 }}>{t.description || t.category}</div>
                   <div className="text-muted" style={{ fontSize: '0.85rem' }}>{t.category} • {t.date}</div>
                 </div>
               </div>
               <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                 <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                    {t.type === 'income' ? '+' : '-'}{data.profile.currency}{t.amount}
                 </div>
                 <Trash2 size={18} className="text-muted" style={{ cursor: 'pointer' }} onClick={() => deleteTransaction(t.id)} />
               </div>
             </div>
          ))}
          {data.transactions.length === 0 && <p className="text-muted text-center pt-4">No data.</p>}
        </div>
      </div>
    </div>
  );
}
