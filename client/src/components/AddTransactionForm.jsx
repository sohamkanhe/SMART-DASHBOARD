import React, { useState } from 'react';
import './AddTransactionForm.css';

const AddTransactionForm = ({ onAdd }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('Completed'); // Default status

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount) {
      alert('Please fill in both description and amount.');
      return;
    }
    onAdd({ Description: description, Amount: parseFloat(amount), Status: status });
    // Reset form
    setDescription('');
    setAmount('');
    setStatus('Completed');
  };

  return (
    <form className="add-transaction-form" onSubmit={handleSubmit}>
      <h3>Add New Transaction</h3>
      <div className="form-inputs">
        <input
          type="text"
          placeholder="Product or Service Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>
        <button type="submit">Add Transaction</button>
      </div>
    </form>
  );
};

export default AddTransactionForm;