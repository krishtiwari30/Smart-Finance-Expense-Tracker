import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('finance_db');
    if (saved) return JSON.parse(saved);
    return {
      transactions: [], // { id, amount, category, description, date, type: 'expense'|'income' }
      budgets: {}, // { "Food": 5000, "Travel": 2000 }
      goals: [], // { id, name, targetAmount, currentAmount, deadline }
      profile: { name: 'User', currency: '₹' }
    };
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('finance_theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('finance_db', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('finance_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Actions
  const addTransaction = (t) => {
    setData(prev => ({
      ...prev,
      transactions: [{ ...t, id: crypto.randomUUID() }, ...prev.transactions]
    }));
  };

  const deleteTransaction = (id) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
  };

  const setBudget = (category, amount) => {
    setData(prev => ({
      ...prev,
      budgets: { ...prev.budgets, [category]: amount }
    }));
  };

  const addGoal = (goal) => {
    setData(prev => ({
      ...prev,
      goals: [{ ...goal, id: crypto.randomUUID() }, ...prev.goals]
    }));
  };
  
  const updateGoal = (id, newAmount) => {
      setData(prev => ({
        ...prev,
        goals: prev.goals.map(g => g.id === id ? { ...g, currentAmount: newAmount } : g)
      }));
  };

  const value = {
    data,
    theme,
    toggleTheme,
    addTransaction,
    deleteTransaction,
    setBudget,
    addGoal,
    updateGoal
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
