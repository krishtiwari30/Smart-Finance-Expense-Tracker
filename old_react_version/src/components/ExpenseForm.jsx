import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';

const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Housing & Utilities',
  'Entertainment',
  'Shopping',
  'Health & Wellness',
  'Education',
  'Miscellaneous'
];

export default function ExpenseForm({ onAdd }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || amount <= 0) return;

    onAdd({
      amount: parseFloat(amount),
      category,
      description: description || category,
      date: new Date().toISOString()
    });

    setAmount('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Amount (₹)</label>
        <input 
          type="number" 
          className="form-input" 
          placeholder="e.g. 500" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Category</label>
        <select 
          className="form-input form-select" 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Description (Optional)</label>
        <input 
          type="text" 
          className="form-input" 
          placeholder="e.g. Lunch at Cafe" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <button type="submit" className="btn">
        <PlusCircle size={18} /> Add Expense
      </button>
    </form>
  );
}
