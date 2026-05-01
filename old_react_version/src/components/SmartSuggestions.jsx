import React from 'react';
import { AlertTriangle, Lightbulb, CheckCircle } from 'lucide-react';

export default function SmartSuggestions({ totalSpend, categoryTotals }) {
  const suggestions = [];

  // Generate Rules
  if (totalSpend === 0) {
    suggestions.push({
      type: 'success',
      icon: <CheckCircle size={18} />,
      text: 'Start adding expenses to get smart AI insights.'
    });
    return <div className="suggestions-list">{suggestions.map(renderSuggestion)}</div>;
  }

  if (totalSpend > 50000) {
    suggestions.push({
      type: 'danger',
      icon: <AlertTriangle size={18} />,
      text: `Your total spending (₹${totalSpend}) is quite high! Consider enforcing a strict budget for the rest of the month.`
    });
  } else if (totalSpend > 20000) {
    suggestions.push({
      type: 'warning',
      icon: <AlertTriangle size={18} />,
      text: `Total spending is moderate. Review categories to find savings.`
    });
  } else {
    suggestions.push({
      type: 'success',
      icon: <CheckCircle size={18} />,
      text: `Great job! Your overall spending is well under control.`
    });
  }

  // Category percentage rule over 40%
  for (const [category, amount] of Object.entries(categoryTotals)) {
    const percentage = ((amount / totalSpend) * 100).toFixed(1);
    if (percentage > 40 && totalSpend > 5000) { // Only trigger if meaningful amount
      suggestions.push({
        type: 'warning',
        icon: <Lightbulb size={18} />,
        text: `You've spent ${percentage}% of your budget on ${category}. Try to diversify or cut down.`
      });
    }
  }
  
  if (categoryTotals['Food & Dining'] && (categoryTotals['Food & Dining'] / totalSpend) > 0.3) {
      suggestions.push({
        type: 'warning',
        icon: <Lightbulb size={18} />,
        text: `High spending on dining out. Cooking at home could boost your savings!`
      });
  }

  if (categoryTotals['Entertainment'] && (categoryTotals['Entertainment'] / totalSpend) > 0.2) {
    suggestions.push({
      type: 'warning',
      icon: <Lightbulb size={18} />,
      text: `Entertainment costs are taking up a large chunk. Look for free or cheaper alternatives.`
    });
}

  function renderSuggestion(sug, idx) {
    return (
      <div key={idx} className={`suggestion-item suggestion-${sug.type}`}>
        <div style={{ marginTop: '2px' }}>{sug.icon}</div>
        <div>{sug.text}</div>
      </div>
    );
  }

  return (
    <div className="suggestions-list">
      {suggestions.map(renderSuggestion)}
    </div>
  );
}
