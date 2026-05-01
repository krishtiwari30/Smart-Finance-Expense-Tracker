from flask import Flask, render_template, request, jsonify, redirect, url_for
import json
import os
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename
from finance_engine import calculate_metrics, calculate_health_score, generate_smart_alerts, parse_bank_statement, calculate_predictions, analyze_personality, auto_categorize, detect_subscriptions

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
DATA_FILE = 'data.json'

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.template_filter('inr_format')
def inr_format(value):
    try:
        value = float(value)
    except (ValueError, TypeError):
        return value
    
    is_negative = value < 0
    value = abs(value)
    
    val_str = f"{value:.2f}"
    parts = val_str.split('.')
    int_part = parts[0]
    dec_part = parts[1]
    
    if len(int_part) > 3:
        last_three = int_part[-3:]
        other_nums = int_part[:-3]
        if other_nums:
            other_nums = ','.join([other_nums[max(0, i-2):i] for i in range(len(other_nums), 0, -2)][::-1])
            int_part = other_nums + ',' + last_three
            
    formatted = f"{int_part}.{dec_part}"
    return f"-{formatted}" if is_negative else formatted

def load_data():
    if not os.path.exists(DATA_FILE):
        return {
            'transactions': [],
            'budgets': {},
            'goals': [],
            'assets': {'stocks': [], 'crypto': []},
            'profile': {'name': 'User', 'currency': '₹'}
        }
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
        if 'assets' not in data:
            data['assets'] = {'stocks': [], 'crypto': []}
        return data

def save_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

@app.route('/')
def dashboard():
    data = load_data()
    metrics = calculate_metrics(data['transactions'])
    health = calculate_health_score(metrics['ratio'], data['budgets'], metrics['categoryTotals'])
    alerts = generate_smart_alerts(metrics['thisMonthExpense'], metrics['totalIncome'], metrics['categoryTotals'], data['budgets'])
    return render_template('dashboard.html', active_tab='dashboard', metrics=metrics, health=health, alerts=alerts, data=data)

@app.route('/upload_statement', methods=['POST'])
def upload_statement():
    if 'file' not in request.files:
        return redirect(url_for('transactions'))
    file = request.files['file']
    if file.filename == '':
        return redirect(url_for('transactions'))
        
    if file and (file.filename.endswith('.pdf') or file.filename.endswith('.csv')):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        extracted = parse_bank_statement(filepath, filename)
        
        if extracted:
            data = load_data()
            data['transactions'] = extracted + data['transactions']
            save_data(data)
            
        try:
            os.remove(filepath)
        except:
            pass
            
    return redirect(url_for('transactions'))

@app.route('/transactions', methods=['GET', 'POST'])
def transactions():
    data = load_data()
    if request.method == 'POST':
        t_type = request.form.get('type')
        amount = request.form.get('amount')
        category = request.form.get('category')
        description = request.form.get('description')
        date = request.form.get('date')
        
        if not category:
            category = auto_categorize(description)
            
        new_t = {
            'id': str(uuid.uuid4()),
            'type': t_type,
            'amount': amount,
            'category': category,
            'description': description,
            'date': date
        }
        data['transactions'].insert(0, new_t)
        save_data(data)
        return redirect(url_for('transactions'))
        
    return render_template('transactions.html', active_tab='transactions', data=data)

@app.route('/analytics')
def analytics():
    data = load_data()
    metrics = calculate_metrics(data['transactions'])
    prediction = calculate_predictions(data['transactions'])
    personality = analyze_personality(metrics['ratio'], metrics['categoryTotals'], metrics['totalExpense'])
    subs = detect_subscriptions(data['transactions'])
    return render_template('analytics.html', active_tab='analytics', data=data, metrics=metrics, prediction=prediction, personality=personality, subs=subs)

@app.route('/goals', methods=['GET', 'POST'])
def goals():
    data = load_data()
    if request.method == 'POST':
        action = request.form.get('action')
        if action == 'add_goal':
            new_goal = {
                'id': str(uuid.uuid4()),
                'name': request.form.get('name'),
                'targetAmount': float(request.form.get('targetAmount')),
                'currentAmount': float(request.form.get('currentAmount', 0)),
                'deadline': request.form.get('deadline')
            }
            data['goals'].insert(0, new_goal)
            save_data(data)
        elif action == 'set_budget':
            category = request.form.get('category')
            amount = float(request.form.get('amount'))
            data['budgets'][category] = amount
            save_data(data)
        elif action == 'update_goal':
            goal_id = request.form.get('goal_id')
            new_amount = float(request.form.get('amount'))
            for g in data['goals']:
                if g['id'] == goal_id:
                    g['currentAmount'] = new_amount
                    break
            save_data(data)
        return redirect(url_for('goals'))
        
    return render_template('goals.html', active_tab='goals', data=data)

@app.route('/wealth', methods=['GET', 'POST'])
def wealth():
    data = load_data()
    metrics = calculate_metrics(data['transactions'])
    
    if request.method == 'POST':
        a_type = request.form.get('type')
        name = request.form.get('name')
        value = float(request.form.get('value', 0))
        
        if a_type in ['stocks', 'crypto']:
            new_asset = {
                'id': str(uuid.uuid4()),
                'name': name,
                'value': value
            }
            data['assets'][a_type].append(new_asset)
            save_data(data)
        return redirect(url_for('wealth'))
        
    return render_template('wealth.html', active_tab='wealth', data=data, metrics=metrics)

@app.route('/assistant')
def assistant():
    data = load_data()
    return render_template('assistant.html', active_tab='assistant', data=data)

@app.route('/api/chat', methods=['POST'])
def api_chat():
    data = load_data()
    metrics = calculate_metrics(data['transactions'])
    query = request.json.get('query', '').lower()
    
    if 'total spend' in query or 'total expense' in query:
        response = f"Your total expenses this month are {data['profile']['currency']}{inr_format(metrics['thisMonthExpense'])}."
    elif 'income' in query:
        response = f"Your total income recorded is {data['profile']['currency']}{inr_format(metrics['totalIncome'])}."
    elif 'savings' in query or 'saved' in query:
        response = f"Your current savings balance is {data['profile']['currency']}{inr_format(metrics['savings'])}. This is a {metrics['ratio']:.1f}% savings ratio."
    elif 'budget' in query:
        response = f"You have {len(data['budgets'])} active budgets set. Check the Goals & Budgets tab to view thresholds."
    else:
        categories = ['food', 'travel', 'shopping', 'bills', 'entertainment', 'health']
        found = False
        for cat in categories:
            if cat in query:
                amount = metrics['categoryTotals'].get(cat.capitalize(), 0)
                if amount == 0:
                     amount = metrics['categoryTotals'].get(cat, 0)
                response = f"You have spent {data['profile']['currency']}{inr_format(amount)} on {cat.capitalize()}."
                found = True
                break
        if not found:
            response = "I'm not sure how to answer that yet. Try asking about your 'total spend', 'savings', or a specific category like 'food'."
            
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
