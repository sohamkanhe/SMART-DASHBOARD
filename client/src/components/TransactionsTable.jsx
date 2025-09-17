import React, { useState } from 'react';
import './TransactionsTable.css';
import { FiTrash2, FiEdit, FiSave, FiXCircle } from 'react-icons/fi'; // Import icons

const TransactionsTable = ({ transactions, onDelete, onUpdate }) => {
  const [editRowId, setEditRowId] = useState(null);
  const [editedData, setEditedData] = useState({});

  const handleEditClick = (transaction) => {
    setEditRowId(transaction.id);
    setEditedData(transaction);
  };

  const handleCancelClick = () => {
    setEditRowId(null);
    setEditedData({});
  };

  const handleSaveClick = (id) => {
    onUpdate(id, editedData);
    setEditRowId(null);
  };

  const handleInputChange = (e, field) => {
    setEditedData({ ...editedData, [field]: e.target.value });
  };
  
  return (
    <div className="transactions-table-container">
      <h3>Recent Transactions</h3>
      <table className="transactions-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Amount ($)</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((item) => (
            <tr key={item.id}>
              {editRowId === item.id ? (
                <>
                  <td><input type="date" value={editedData.Date} onChange={(e) => handleInputChange(e, 'Date')} /></td>
                  <td><input type="text" value={editedData.Description} onChange={(e) => handleInputChange(e, 'Description')} /></td>
                  <td><input type="number" value={editedData.Amount} onChange={(e) => handleInputChange(e, 'Amount')} /></td>
                  <td>
                    <select value={editedData.Status} onChange={(e) => handleInputChange(e, 'Status')}>
                        <option value="Completed">Completed</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                    </select>
                  </td>
                  <td className="actions-cell">
                    <button className="action-button save" onClick={() => handleSaveClick(item.id)}><FiSave /></button>
                    <button className="action-button cancel" onClick={handleCancelClick}><FiXCircle /></button>
                  </td>
                </>
              ) : (
                <>
                  <td>{item.Date}</td>
                  <td>{item.Description}</td>
                  <td>{typeof item.Amount === 'number' ? item.Amount.toFixed(2) : item.Amount}</td>
                  <td>
                    <span className={`status-badge status-${item.Status?.toLowerCase()}`}>
                      {item.Status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="action-button edit" onClick={() => handleEditClick(item)}><FiEdit /></button>
                    <button className="action-button delete" onClick={() => onDelete(item.id)}><FiTrash2 /></button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsTable;