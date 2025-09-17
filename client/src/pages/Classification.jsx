import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Classification.css';

const Classification = () => {
  const [products, setProducts] = useState([]);
  const [accuracy, setAccuracy] = useState(null);
  const [modelUsed, setModelUsed] = useState('');
  const [selectedModel, setSelectedModel] = useState('best'); // To control the dropdown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClassificationData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Pass the selected model as a query parameter in the API call
      const response = await axios.get(`http://localhost:5000/api/predict/product_classification?model=${selectedModel}`);
      setProducts(response.data.classified_products);
      setAccuracy(response.data.model_accuracy);
      setModelUsed(response.data.model_used);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch classification data.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedModel]); // Re-run the fetch when selectedModel changes

  useEffect(() => {
    fetchClassificationData();
  }, [fetchClassificationData]);

  const getBadgeClass = (performance) => {
    if (performance === 'Best Seller') return 'badge-best';
    if (performance === 'Average Seller') return 'badge-average';
    if (performance === 'Slow-Moving') return 'badge-slow';
    return '';
  };

  const renderContent = () => {
    if (loading) return <p className="status-message">Running classification model(s)...</p>;
    if (error) return <p className="status-message error">{error}</p>;
    return (
      <>
        <div className="metrics-container">
          <div className="metric-card">
            <h4>Model Used</h4>
            <p className="model-name">{modelUsed}</p>
          </div>
          <div className="metric-card">
            <h4>Model Accuracy</h4>
            <p>{accuracy !== null ? `${(accuracy * 100).toFixed(0)}%` : 'N/A'}</p>
          </div>
        </div>
        <div className="classification-table-container">
          <h3>Classified Products</h3>
          <table className="classification-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Total Units Sold</th>
                <th>Predicted Performance</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={index}>
                  <td>{product.ProductName}</td>
                  <td>{product.Category}</td>
                  <td>{product.TotalUnitsSold}</td>
                  <td>
                    <span className={`performance-badge ${getBadgeClass(product.PredictedPerformance)}`}>
                      {product.PredictedPerformance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  return (
    <div className="classification-container">
      <div className="classification-header">
        <h2>Product Performance Classification</h2>
        <div className="model-selector-wrapper">
          <p>Select a model to categorize your products based on sales performance.</p>
          <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="model-select">
            <option value="best">Best Model</option>
            <option value="decision_tree">Decision Tree</option>
            <option value="logistic_regression">Logistic Regression</option>
            <option value="naive_bayes">Naive Bayes</option>
          </select>
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default Classification;