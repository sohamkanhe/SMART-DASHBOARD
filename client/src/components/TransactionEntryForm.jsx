import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TransactionEntryForm.css';

const TransactionEntryForm = ({ onTransactionAdded }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [productName, setProductName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [unitPrice, setUnitPrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  useEffect(() => {
    // Fetch all products when the component loads
    const fetchProducts = async () => {
      const response = await axios.get('http://localhost:5000/api/products');
      setAllProducts(response.data);
    };
    fetchProducts();
  }, []);

  const handleProductNameChange = (e) => {
    const value = e.target.value;
    setProductName(value);
    if (value.length > 0) {
      const filteredSuggestions = allProducts.filter(p =>
        p.ProductName.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (product) => {
    setProductName(product.ProductName);
    setUnitPrice(product.UnitPrice);
    setSelectedProduct(product);
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      alert('Please select a valid product from the list.');
      return;
    }
    const newTransaction = {
      ProductName: selectedProduct.ProductName,
      ProductCategory: selectedProduct.ProductCategory,
      UnitPrice: parseFloat(unitPrice),
      PaymentMethod: paymentMethod
    };
    try {
      await axios.post('http://localhost:5000/api/transactions', newTransaction);
      // Clear form and notify parent component
      setProductName('');
      setUnitPrice('');
      setSelectedProduct(null);
      onTransactionAdded();
    } catch (error) {
      console.error("Failed to add transaction:", error);
      alert('Error: Could not add transaction.');
    }
  };

  return (
    <div className="entry-form-container">
      <h3>New Transaction</h3>
      <form onSubmit={handleSubmit} className="entry-form">
        <div className="autocomplete-wrapper">
          <input
            type="text"
            value={productName}
            onChange={handleProductNameChange}
            placeholder="Start typing product name..."
            required
          />
          {suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((p, i) => (
                <li key={i} onClick={() => handleSuggestionClick(p)}>
                  {p.ProductName}
                </li>
              ))}
            </ul>
          )}
        </div>
        <input
          type="number"
          step="0.01"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          placeholder="Sale Price"
          required
        />
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option>Credit Card</option>
          <option>PayPal</option>
          <option>Debit Card</option>
          <option>Cash</option>
        </select>
        <button type="submit">Add Sale</button>
      </form>
    </div>
  );
};

export default TransactionEntryForm;