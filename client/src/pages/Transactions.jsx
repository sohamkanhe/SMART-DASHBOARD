import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import TransactionsTable from '../components/TransactionsTable';
import AddTransactionForm from '../components/AddTransactionForm';
import './Transactions.css';

// The correct, unified API URL
const API_URL = 'http://127.0.0.1:5000/api/transactions';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await axios.get(API_URL);
      // The backend now provides the 'id' directly
      setTransactions(response.data);
    } catch (err) {
      setError('Failed to fetch transactions. Is the backend server running?');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleAddTransaction = async (transactionData) => {
    try {
      await axios.post(API_URL, transactionData);
      fetchTransactions(); // Refresh
    } catch (err) {
      setError('Failed to add transaction.');
      console.error(err);
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchTransactions(); // Refresh
    } catch (err) {
      setError('Failed to delete transaction.');
      console.error(err);
    }
  };
  
  const handleUpdateTransaction = async (id, updatedData) => {
    try {
        await axios.put(`${API_URL}/${id}`, updatedData);
        fetchTransactions(); // Refresh
    } catch (err) {
        setError('Failed to update transaction.');
        console.error(err);
    }
  };

  return (
    <div className="transactions-page-container">
      <h2>Manage Transactions</h2>
      {error && <p className="error-message">{error}</p>}
      <AddTransactionForm onAdd={handleAddTransaction} />
      <TransactionsTable 
        transactions={transactions} 
        onDelete={handleDeleteTransaction}
        onUpdate={handleUpdateTransaction}
      />
    </div>
  );
};

export default Transactions;