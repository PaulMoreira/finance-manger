import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000'; // Make sure this matches your backend server URL

const addTransaction = async (transaction) => {
  try {
    const response = await fetch(`${API_URL}/transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding transaction:', error.message);
    throw error;
  }
};

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_URL}/transactions`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to fetch transactions. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const newTransaction = {
      amount: parseFloat(amount),
      description: description,
    };

    try {
      const addedTransaction = await addTransaction(newTransaction);
      setTransactions(prevTransactions => [...prevTransactions, addedTransaction]);
      setAmount('');
      setDescription('');
    } catch (error) {
      setError('Failed to add transaction. Please try again.');
    }
  };

  return (
    <div>
      <h1>My Finance App</h1>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          required
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          required
        />
        <button type="submit">Add Transaction</button>
      </form>
      <ul>
        {transactions.map((transaction, index) => (
          <li key={index}>
            {transaction.description}: ${transaction.amount}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;