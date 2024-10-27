from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import sqlite3
import os

app = Flask(__name__)

# Configure CORS properly
CORS(app, 
     resources={r"/*": {  # This applies CORS to all routes
         "origins": ["http://localhost:3000"],  # Your React app's URL
         "methods": ["GET", "POST", "DELETE", "OPTIONS"],  # Allowed methods
         "allow_headers": ["Content-Type", "Authorization"],  # Allowed headers
         "supports_credentials": True  # Required for credentials mode
     }})

def get_db():
    try:
        db_path = os.path.join(os.path.dirname(__file__), 'finance.db')
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn
    except Exception as e:
        print(f"Database connection error: {str(e)}")
        raise

def init_db():
    try:
        db_path = os.path.join(os.path.dirname(__file__), 'finance.db')
        print(f"Initializing database at: {db_path}")
        
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        
        c.execute('''
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                amount REAL NOT NULL,
                description TEXT NOT NULL,
                date TEXT NOT NULL,
                month TEXT NOT NULL
            )
        ''')
        
        conn.commit()
        print("Database initialized successfully")
        conn.close()
    except Exception as e:
        print(f"Database initialization error: {str(e)}")
        raise

@app.route('/transactions/<month>', methods=['GET'])
def get_transactions(month):
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM transactions WHERE month = ?', (month,))
        transactions = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify(transactions)
    except Exception as e:
        print(f"Error in get_transactions: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/transaction', methods=['POST'])
def add_transaction():
    try:
        data = request.json
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO transactions (type, amount, description, date, month)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            data['type'],
            data['amount'],
            data['description'],
            datetime.now().isoformat(),
            data['month']
        ))
        
        transaction_id = cursor.lastrowid
        conn.commit()
        
        cursor.execute('SELECT * FROM transactions WHERE id = ?', (transaction_id,))
        transaction = dict(cursor.fetchone())
        
        conn.close()
        return jsonify(transaction), 201
    except Exception as e:
        print(f"Error in add_transaction: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/transaction/<int:id>', methods=['DELETE'])
def delete_transaction(id):
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM transactions WHERE id = ?', (id,))
        conn.commit()
        conn.close()
        return '', 204
    except Exception as e:
        print(f"Error in delete_transaction: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    init_db()
    app.run(debug=True)