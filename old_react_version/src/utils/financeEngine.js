// Engine for 18-Point Analytics

export const calculateMetrics = (transactions) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  let totalIncome = 0;
  let totalExpense = 0;
  let thisMonthExpense = 0;
  let categoryTotals = {};
  
  // Array of dates with activity for streak analysis
  const expenseDates = new Set();
  
  transactions.forEach(t => {
    const amt = parseFloat(t.amount);
    const d = new Date(t.date);
    const isThisMonth = d.getMonth() === currentMonth && d.getFullYear() === currentYear;

    if (t.type === 'income') {
      totalIncome += amt;
    } else {
      totalExpense += amt;
      expenseDates.add(d.toISOString().split('T')[0]);
      
      if (isThisMonth) {
        thisMonthExpense += amt;
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amt;
      }
    }
  });

  const savings = totalIncome - totalExpense;
  const ratio = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
  
  return {
    totalIncome,
    totalExpense,
    thisMonthExpense,
    savings,
    ratio, // percentage
    categoryTotals,
    expenseDates: Array.from(expenseDates)
  };
};

export const calculateHealthScore = (ratio, budgets, categoryTotals) => {
  // Score out of 100
  // Base 50 points based on savings ratio (ideal > 20%)
  let score = 0;
  
  if (ratio >= 20) score += 50;
  else if (ratio > 0) score += Math.round((ratio / 20) * 50);
  
  if (ratio < 0) score -= 20; // severe penalty for debt
  
  // Adjust remaining 50 points via budget adherence
  let budgetScore = 50;
  for (const cat in budgets) {
    if (categoryTotals[cat] && categoryTotals[cat] > budgets[cat]) {
      budgetScore -= 10; // penalty for each breached budget
    }
  }
  
  score += Math.max(0, budgetScore);
  
  let label = "Balanced";
  if (score >= 80) label = "Saver";
  else if (score < 40) label = "Overspender";
  
  return { score: Math.max(0, Math.min(100, score)), label };
};

export const estimateFutureExpense = (transactions) => {
  // Average monthly spend extrapolated
  let months = new Set();
  let totalExpense = 0;
  
  transactions.filter(t => t.type === 'expense').forEach(t => {
    totalExpense += parseFloat(t.amount);
    const d = new Date(t.date);
    months.add(`${d.getFullYear()}-${d.getMonth()}`);
  });

  if (months.size === 0) return 0;
  return totalExpense / months.size;
};

export const calculateNoSpendStreak = (expenseDates) => {
  // Very simplistic: dates are YYYY-MM-DD
  const sorted = [...expenseDates].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  
  if (sorted.length === 0) return 1; // If no expenses yet, start at 1
  if (sorted[0] !== today) return 1; // Actually we'd need to compare diff in days.

  return "N/A"; // Simplified for now
};

export const generateSmartAlerts = (thisMonthExpense, totalIncome, categoryTotals, budgets) => {
  const alerts = [];
  
  if (totalIncome > 0 && thisMonthExpense > totalIncome * 0.9) {
    alerts.push({ type: 'danger', msg: "Warning: You have spent over 90% of your total income." });
  }

  for (const cat in budgets) {
    const spend = categoryTotals[cat] || 0;
    const limit = budgets[cat];
    const pct = (spend / limit) * 100;
    
    if (pct >= 100) {
      alerts.push({ type: 'danger', msg: `Budget exceeded for ${cat}! You spent ₹${spend} against limit ₹${limit}.` });
    } else if (pct >= 80) {
      alerts.push({ type: 'warning', msg: `${cat} budget is at ${pct.toFixed(0)}%. Slow down.` });
    }
  }

  return alerts;
};
