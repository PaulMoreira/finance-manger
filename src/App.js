import React, { useState, useEffect, useCallback } from 'react';
import './FinanceManager.css';

const FinanceManager = () => {
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [newAmount, setNewAmount] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [error, setError] = useState(null);

  const updateTotals = useCallback((transactions) => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    setIncome(income);
    setExpense(expense);
    setBalance(income - expense);
  }, []);

  const fetchTransactions = useCallback(() => {
    const storedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    setTransactions(storedTransactions);
    updateTotals(storedTransactions);
  }, [updateTotals]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = (type) => {
    if (newAmount && newDescription) {
      const amount = parseFloat(newAmount);
      const newTransaction = {
        id: Date.now(),
        type,
        amount,
        description: newDescription,
        date: new Date().toISOString()
      };

      const updatedTransactions = [...transactions, newTransaction];
      setTransactions(updatedTransactions);
      localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
      updateTotals(updatedTransactions);

      setNewAmount('');
      setNewDescription('');
      setError(null);
    } else {
      setError('Please enter both amount and description.');
    }
  };

  const deleteTransaction = (id) => {
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    updateTotals(updatedTransactions);
  };

  return (
    <div className="finance-manager">
      <h1>Finance Manager</h1>
      
      <div className="summary">
        <div className="summary-card">
          <h2>Total Income</h2>
          <p>${income.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h2>Total Expense</h2>
          <p>${expense.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h2>Balance</h2>
          <p>${balance.toFixed(2)}</p>
        </div>
      </div>

      <div className="transaction-form">
        <h2>Add Transaction</h2>
        <input
          type="number"
          placeholder="Amount"
          value={newAmount}
          onChange={(e) => setNewAmount(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
        />
        <div className="button-group">
          <button onClick={() => addTransaction('income')} className="btn-income">Add Income</button>
          <button onClick={() => addTransaction('expense')} className="btn-expense">Add Expense</button>
        </div>
      </div>

      <div className="recent-transactions">
        <h2>Recent Transactions</h2>
        {transactions.slice(-5).reverse().map((transaction) => (
          <div key={transaction.id} className={`transaction ${transaction.type}`}>
            <span>{transaction.description}</span>
            <span>${transaction.amount.toFixed(2)}</span>
            <button onClick={() => deleteTransaction(transaction.id)} className="btn-delete">Delete</button>
          </div>
        ))}
      </div>

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default FinanceManager;