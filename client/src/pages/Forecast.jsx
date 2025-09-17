import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import SalesChart from '../components/SalesChart';
import './Forecast.css';

const Forecast = () => {
  const [historicalData, setHistoricalData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [mae, setMae] = useState(null);
  const [selectedModel, setSelectedModel] = useState('best');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch historical transaction data
      const historicalRes = await axios.get('http://localhost:5000/api/transactions');
      
      // --- FIX: Format the data for the SalesChart ---
      const formattedHistoricalData = historicalRes.data.map(item => ({
        date: item.Date,          // Use 'Date' from the CSV
        cost: item.TotalRevenue   // Use 'TotalRevenue' from the CSV
      }));
      setHistoricalData(formattedHistoricalData);

      // 2. Fetch forecast data
      const forecastRes = await axios.get(`http://localhost:5000/api/predict/forecast?model=${selectedModel}`);
      setForecastData(forecastRes.data.forecast);
      setMae(forecastRes.data.mae);

    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch data. Ensure the backend is running.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedModel]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const renderContent = () => {
    if (loading) {
      return <p className="status-message">Generating forecast...</p>;
    }
    if (error) {
      return <p className="status-message error">{error}</p>;
    }
    return (
      <>
        <div className="forecast-metrics">
          <div className="metric-card">
            <h4>Model Accuracy (MAE)</h4>
            <p>{mae !== null ? `$${mae}` : 'N/A'}</p>
            <span>Lower is better. This is the average error in the model's prediction.</span>
          </div>
        </div>
        <SalesChart 
          historicalData={historicalData} 
          forecastData={forecastData} 
        />
      </>
    );
  };

  return (
    <div className="forecast-container">
      <div className="forecast-header">
        <h2>Sales Forecast</h2>
        <p>Select a regression model to predict future sales.</p>
      </div>
      
      <div className="model-selector">
        <button 
          className={selectedModel === 'linear' ? 'active' : ''}
          onClick={() => setSelectedModel('linear')}
        >
          Linear
        </button>
        <button 
          className={selectedModel === 'polynomial' ? 'active' : ''}
          onClick={() => setSelectedModel('polynomial')}
        >
          Polynomial
        </button>
        <button 
          className={selectedModel === 'best' ? 'active' : ''}
          onClick={() => setSelectedModel('best')}
        >
          Best Fit
        </button>
      </div>

      <div className="forecast-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default Forecast;