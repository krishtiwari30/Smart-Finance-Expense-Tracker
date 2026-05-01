import React, { useState } from 'react';
import { LayoutDashboard, Receipt, PieChart, MessageSquare, Target, Moon, Sun } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Assistant from './pages/Assistant';
import Goals from './pages/Goals';
import { useAppContext } from './context/AppContext';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { theme, toggleTheme } = useAppContext();

  const renderTab = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'transactions': return <Transactions />;
      case 'analytics': return <Analytics />;
      case 'goals': return <Goals />;
      case 'assistant': return <Assistant />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-layout" data-theme={theme}>
      <aside className="sidebar">
        <div className="sidebar-title">
          <PieChart color="var(--primary)" /> SmartFi
        </div>
        
        <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <LayoutDashboard size={20} /> Dashboard
        </div>
        <div className={`nav-item ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>
          <Receipt size={20} /> Transactions
        </div>
        <div className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
          <PieChart size={20} /> Analytics
        </div>
        <div className={`nav-item ${activeTab === 'goals' ? 'active' : ''}`} onClick={() => setActiveTab('goals')}>
          <Target size={20} /> Goals & Budgets
        </div>
        <div className={`nav-item ${activeTab === 'assistant' ? 'active' : ''}`} onClick={() => setActiveTab('assistant')}>
          <MessageSquare size={20} /> AI Assistant
        </div>

        <div style={{ marginTop: 'auto', padding: '1rem 1.5rem', borderTop: '1px solid var(--border)' }}>
          <div className="nav-item" onClick={toggleTheme} style={{ padding: '0.5rem 0', border: 'none', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          </div>
        </div>
      </aside>

      <main className="main-content">
        {renderTab()}
      </main>
    </div>
  );
}

export default App;
