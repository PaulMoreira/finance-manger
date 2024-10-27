import React, { useState, useEffect, useCallback } from 'react';

// Update the API_URL constant at the top of the file
const API_URL = 'http://127.0.0.1:5000';

const FinanceManager = () => {
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [newAmount, setNewAmount] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const transactionsPerPage = 10;

  // Generate list of months for the selector (current year and previous year)
  const getAvailableMonths = () => {
    const months = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Add months for current year up to current month
    for (let month = 0; month < today.getMonth() + 1; month++) {
      months.push(`${currentYear}-${String(month + 1).padStart(2, '0')}`);
    }
    
    // Add months for previous year
    for (let month = 0; month < 12; month++) {
      months.push(`${currentYear - 1}-${String(month + 1).padStart(2, '0')}`);
    }
    
    return months.sort((a, b) => b.localeCompare(a)); // Sort in descending order
  };

  const formatMonthDisplay = (monthStr) => {
    const [year, month] = monthStr.split('-');
    return new Date(year, month - 1).toLocaleString('default', { 
      month: 'long',
      year: 'numeric'
    });
  };

  const updateTotals = useCallback((transactions) => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    setIncome(income);
    setExpense(expense);
    setBalance(income - expense);
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/transactions/${selectedMonth}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      setTransactions(data);
      updateTotals(data);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to fetch transactions. Please try again.');
    }
  }, [selectedMonth, updateTotals]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (type) => {
    if (newAmount && newDescription) {
      try {
        const amount = parseFloat(newAmount);
        const newTransaction = {
          type,
          amount,
          description: newDescription,
          month: selectedMonth
        };

        const response = await fetch(`${API_URL}/transaction`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(newTransaction),
        });

        if (!response.ok) {
          throw new Error('Failed to add transaction');
        }

        const savedTransaction = await response.json();
        const updatedTransactions = [...transactions, savedTransaction];
        setTransactions(updatedTransactions);
        updateTotals(updatedTransactions);

        setNewAmount('');
        setNewDescription('');
        setError(null);
      } catch (error) {
        console.error('Error adding transaction:', error);
        setError('Failed to add transaction. Please try again.');
      }
    } else {
      setError('Please enter both amount and description.');
    }
  };

  const deleteTransaction = async (id) => {
    try {
      const response = await fetch(`${API_URL}/transaction/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }

      const updatedTransactions = transactions.filter(t => t.id !== id);
      setTransactions(updatedTransactions);
      updateTotals(updatedTransactions);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setError('Failed to delete transaction. Please try again.');
    }
  };

  // Calculate pagination
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice().reverse().slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8 text-indigo-900">Finance Manager</h1>
      
      {/* Month Selector */}
      <div className="mb-8 flex justify-center">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 border rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
        >
          {getAvailableMonths().map((month) => (
            <option key={month} value={month}>
              {formatMonthDisplay(month)}
            </option>
          ))}
        </select>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 transition-transform hover:scale-105">
          <h2 className="text-lg font-semibold text-gray-700">Total Income</h2>
          <p className="text-2xl font-bold text-emerald-600">${income.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 transition-transform hover:scale-105">
          <h2 className="text-lg font-semibold text-gray-700">Total Expense</h2>
          <p className="text-2xl font-bold text-rose-600">${expense.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 transition-transform hover:scale-105">
          <h2 className="text-lg font-semibold text-gray-700">Balance</h2>
          <p className="text-2xl font-bold text-indigo-600">${balance.toFixed(2)}</p>
        </div>
      </div>

      {/* Transaction Form */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Add Transaction</h2>
        <div className="space-y-4">
          <input
            type="number"
            placeholder="Amount"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <input
            type="text"
            placeholder="Description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="flex gap-4">
            <button
              onClick={() => addTransaction('income')}
              className="flex-1 bg-emerald-500 text-white py-3 px-4 rounded-xl hover:bg-emerald-600 transition-colors shadow-sm"
            >
              Add Income
            </button>
            <button
              onClick={() => addTransaction('expense')}
              className="flex-1 bg-rose-500 text-white py-3 px-4 rounded-xl hover:bg-rose-600 transition-colors shadow-sm"
            >
              Add Expense
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
            {error}
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No transactions for {formatMonthDisplay(selectedMonth)}</p>
        ) : (
          <div className="space-y-3">
            {currentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100"
              >
                <div>
                  <p className="font-medium text-gray-800">{transaction.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span 
                    className={
                      transaction.type === 'income' 
                        ? 'text-emerald-600 font-medium' 
                        : 'text-rose-600 font-medium'
                    }
                  >
                    ${transaction.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => deleteTransaction(transaction.id)}
                    className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl hover:bg-rose-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {transactions.length > transactionsPerPage && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl disabled:opacity-50 hover:bg-indigo-100 transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl disabled:opacity-50 hover:bg-indigo-100 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceManager;
