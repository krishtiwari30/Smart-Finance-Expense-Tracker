import React from 'react';
import { Trash2, Box } from 'lucide-react';

export default function ExpenseList({ expenses, onDelete }) {
  if (expenses.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
        <Box size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
        <p>No transactions yet. Add your first expense above!</p>
      </div>
    );
  }

  return (
    <ul className="expense-list">
      {expenses.map((expense) => (
        <li key={expense.id} className="expense-item">
          <div className="expense-info">
            <div className="expense-icon">
              {expense.category.charAt(0)}
            </div>
            <div className="expense-details">
              <h4>{expense.description}</h4>
              <p>{expense.category} • {new Date(expense.date).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="expense-amount">
            ₹{expense.amount.toFixed(2)}
            <button 
              onClick={() => onDelete(expense.id)} 
              className="delete-btn"
              title="Delete Expense"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
