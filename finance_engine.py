from datetime import datetime

def calculate_metrics(transactions):
    current_month = datetime.now().month
    current_year = datetime.now().year

    total_income = 0
    total_expense = 0
    this_month_expense = 0
    category_totals = {}
    expense_dates = set()

    for t in transactions:
        amt = float(t['amount'])
        # Handle 'YYYY-MM-DD'
        d = datetime.strptime(t['date'], '%Y-%m-%d')
        is_this_month = d.month == current_month and d.year == current_year

        if t.get('type') == 'income':
            total_income += amt
        else:
            total_expense += amt
            expense_dates.add(d.strftime('%Y-%m-%d'))
            
            if is_this_month:
                this_month_expense += amt
                cat = t.get('category', 'Other')
                category_totals[cat] = category_totals.get(cat, 0) + amt

    savings = total_income - total_expense
    ratio = (savings / total_income * 100) if total_income > 0 else 0

    return {
        'totalIncome': total_income,
        'totalExpense': total_expense,
        'thisMonthExpense': this_month_expense,
        'savings': savings,
        'ratio': ratio,
        'categoryTotals': category_totals,
        'expenseDates': list(expense_dates)
    }

def calculate_health_score(ratio, budgets, category_totals):
    score = 0
    
    if ratio >= 20:
        score += 50
    elif ratio > 0:
        score += round((ratio / 20) * 50)
        
    if ratio < 0:
        score -= 20
        
    budget_score = 50
    for cat, limit in budgets.items():
        if category_totals.get(cat, 0) > limit:
            budget_score -= 10
            
    score += max(0, budget_score)
    score = max(0, min(100, score))
    
    label = "Balanced"
    if score >= 80:
        label = "Saver"
    elif score < 40:
        label = "Overspender"
        
    return {'score': score, 'label': label}

def generate_smart_alerts(this_month_expense, total_income, category_totals, budgets):
    alerts = []
    
    if total_income > 0 and this_month_expense > total_income * 0.9:
        alerts.append({'type': 'danger', 'msg': "Warning: You have spent over 90% of your total income."})
        
    for cat, limit in budgets.items():
        spend = category_totals.get(cat, 0)
        pct = (spend / limit) * 100 if limit > 0 else 0
        
        if pct >= 100:
            alerts.append({'type': 'danger', 'msg': f"Budget exceeded for {cat}! You spent ₹{spend} against limit ₹{limit}."})
        elif pct >= 80:
            alerts.append({'type': 'warning', 'msg': f"{cat} budget is at {round(pct)}%. Slow down."})
            
    return alerts

import re
import uuid

def auto_categorize(description):
    desc = description.lower()
    rules = {
        'Food': ['zomato', 'swiggy', 'restaurant', 'cafe', 'mcdonalds', 'kfc', 'starbucks', 'grocery', 'supermarket'],
        'Travel': ['uber', 'ola', 'irctc', 'flight', 'petrol', 'metro', 'bus', 'train', 'ticket'],
        'Shopping': ['amazon', 'flipkart', 'myntra', 'zara', 'h&m', 'mall', 'store'],
        'Entertainment': ['netflix', 'spotify', 'prime', 'hotstar', 'movie', 'pvr', 'inox'],
        'Bills': ['electricity', 'water', 'internet', 'wifi', 'jio', 'airtel', 'recharge', 'bill'],
        'Health': ['pharmacy', 'hospital', 'clinic', 'doctor', 'medicine', 'apollo'],
        'Salary': ['salary', 'payroll', 'wages', 'employer', 'neft', 'imps']
    }
    
    for category, keywords in rules.items():
        if any(keyword in desc for keyword in keywords):
            return category
    return 'Other'

def extract_transaction_from_text(line):
    date_match = re.search(r'(\d{2}[/-]\d{2}[/-]\d{4}|\d{4}[/-]\d{2}[/-]\d{2})', line)
    amount_match = re.findall(r'[\d,]+\.\d{2}', line)
    
    if date_match and amount_match:
        amt_str = amount_match[0].replace(',', '')
        try:
            amount = float(amt_str)
        except ValueError:
            return None
            
        raw_date = date_match.group(1)
        try:
            if '-' in raw_date and len(raw_date.split('-')[0]) == 4:
                d = datetime.strptime(raw_date, '%Y-%m-%d')
            elif '-' in raw_date:
                d = datetime.strptime(raw_date, '%d-%m-%Y')
            else:
                d = datetime.strptime(raw_date, '%d/%m/%Y')
        except ValueError:
            d = datetime.now()
            
        desc = line.replace(raw_date, '').replace(amount_match[0], '').strip()
        desc = re.sub(r'\s+', ' ', desc)
        
        t_type = 'income' if 'CR' in line.upper() or 'CREDIT' in line.upper() else 'expense'
        cat = auto_categorize(desc)
        
        return {
            'id': str(uuid.uuid4()),
            'type': t_type,
            'amount': amount,
            'category': cat,
            'description': desc[:50].strip() or "Bank Transaction",
            'date': d.strftime('%Y-%m-%d')
        }
    return None

def parse_bank_statement(file_path, filename):
    extracted = []
    if filename.lower().endswith('.csv'):
        import csv
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            reader = csv.reader(f)
            for row in reader:
                t = extract_transaction_from_text(" ".join(row))
                if t: extracted.append(t)
                
    elif filename.lower().endswith('.pdf'):
        try:
            import pdfplumber
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        for line in text.split('\n'):
                            t = extract_transaction_from_text(line)
                            if t: extracted.append(t)
        except ImportError:
            pass # pdfplumber not installed
            
    return extracted

def calculate_predictions(transactions):
    expenses = [float(t['amount']) for t in transactions if t.get('type') != 'income']
    if not expenses:
        return 0
    months = len(set(t['date'][:7] for t in transactions))
    return sum(expenses) / max(1, months)

def analyze_personality(savings_ratio, category_totals, total_expense):
    if savings_ratio >= 30:
        return {'type': 'Saver', 'description': 'You have excellent control over your finances and prioritize future security.', 'icon': 'ph-shield-check', 'color': 'var(--success)'}
    
    discretionary = category_totals.get('Shopping', 0) + category_totals.get('Entertainment', 0) + category_totals.get('Food', 0)
    if total_expense > 0 and (discretionary / total_expense) > 0.4:
        return {'type': 'Impulse Spender', 'description': 'You enjoy living in the moment! Consider automating your savings to ensure you pay yourself first.', 'icon': 'ph-lightning', 'color': 'var(--warning)'}
        
    return {'type': 'Balanced', 'description': 'You maintain a healthy mix of saving and spending. Keep up the good work!', 'icon': 'ph-scales', 'color': 'var(--accent)'}

def detect_subscriptions(transactions):
    from collections import defaultdict
    expenses = [t for t in transactions if t.get('type') != 'income']
    
    # Group by amount and description similarity
    groups = defaultdict(list)
    for t in expenses:
        # A simple signature: round amount to nearest int and first word of description
        desc_word = t['description'].split(' ')[0].lower()
        amt = round(float(t['amount']))
        sig = f"{amt}_{desc_word}"
        groups[sig].append(t)
        
    subscriptions = []
    total_monthly_cost = 0
    
    for sig, txs in groups.items():
        if len(txs) >= 2: # If we see the same amount & merchant at least twice
            # Check if dates are roughly a month apart (heuristic)
            dates = sorted([datetime.strptime(t['date'], '%Y-%m-%d') for t in txs])
            is_recurring = True
            for i in range(1, len(dates)):
                diff = (dates[i] - dates[i-1]).days
                if diff < 20 or diff > 40: # Not monthly
                    is_recurring = False
                    break
                    
            if is_recurring or len(txs) > 3: # If it happens a lot, assume recurring
                cost = float(txs[0]['amount'])
                subscriptions.append({
                    'name': txs[0]['description'],
                    'amount': cost,
                    'frequency': 'Monthly',
                    'last_paid': txs[0]['date']
                })
                total_monthly_cost += cost
                
    return {'list': subscriptions, 'total_cost': total_monthly_cost}
