import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Bot, Send, User } from 'lucide-react';
import { calculateMetrics } from '../utils/financeEngine';

export default function Assistant() {
  const { data } = useAppContext();
  const metrics = calculateMetrics(data.transactions);
  
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your SmartFi Assistant. You can ask me things like "What is my total spend?" or "How much did I spend on Food?".' }
  ]);
  const [input, setInput] = useState('');

  const processQuery = (query) => {
    const lower = query.toLowerCase();
    
    if (lower.includes('total spend') || lower.includes('total expense')) {
      return `Your total expenses this month are ${data.profile.currency}${metrics.thisMonthExpense.toFixed(2)}.`;
    }
    
    if (lower.includes('income')) {
      return `Your total income recorded is ${data.profile.currency}${metrics.totalIncome.toFixed(2)}.`;
    }
    
    if (lower.includes('savings') || lower.includes('saved')) {
      return `Your current savings balance is ${data.profile.currency}${metrics.savings.toFixed(2)}. This is a ${metrics.ratio.toFixed(1)}% savings ratio.`;
    }
    
    // Category match
    const categories = ['food', 'travel', 'shopping', 'bills', 'entertainment', 'health'];
    for(let cat of categories) {
      if (lower.includes(cat)) {
        // Find exact match in case
        const exactCat = Object.keys(metrics.categoryTotals).find(k => k.toLowerCase() === cat);
        const amount = exactCat ? metrics.categoryTotals[exactCat] : 0;
        return `You have spent ${data.profile.currency}${amount.toFixed(2)} on ${exactCat || cat} exactly.`;
      }
    }
    
    if (lower.includes('budget')) {
      return `You have ${Object.keys(data.budgets).length} active budgets set. Check the Goals & Budgets tab to view thresholds.`;
    }

    return "I'm not sure how to answer that yet. Try asking about your 'total spend', 'savings', or a specific category like 'food'.";
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const newMsgs = [...messages, { sender: 'user', text: input }];
    setMessages(newMsgs);
    setInput('');
    
    // Simulate thinking delay
    setTimeout(() => {
      const response = processQuery(input);
      setMessages([...newMsgs, { sender: 'bot', text: response }]);
    }, 500);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Bot color="var(--primary)" /> AI Assistant
      </h1>
      
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="chat-window">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.sender === 'bot' ? 'chat-bot' : 'chat-user'}`}>
              <div className="chat-bubble-header">
                {msg.sender === 'bot' ? <Bot size={14}/> : <User size={14}/>} 
                {msg.sender === 'bot' ? 'SmartFi AI' : 'You'}
              </div>
              {msg.text}
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <input 
            className="form-input" 
            placeholder="Ask a question..." 
            value={input} 
            onChange={e => setInput(e.target.value)}
          />
          <button type="submit" className="btn" style={{ width: 'auto' }}><Send size={18}/></button>
        </form>
      </div>
    </div>
  );
}
