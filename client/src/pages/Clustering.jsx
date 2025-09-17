import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Clustering.css';

const Clustering = () => {
  const [products, setProducts] = useState([]);
  const [optimalK, setOptimalK] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClusteringData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/predict/product_clustering');
        setProducts(response.data.clustered_products);
        setOptimalK(response.data.optimal_k);
      } catch (err) {
        const errorMessage = err.response?.data?.error || 'Failed to fetch clustering data.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchClusteringData();
  }, []);
  
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label">{`${data.ProductName}`}</p>
          <p>{`Total Revenue: $${data.TotalRevenue.toFixed(2)}`}</p>
          <p>{`Units Sold: ${data.TotalUnitsSold}`}</p>
          <p>{`Cluster: ${data.Cluster}`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="clustering-container"><p>Running clustering model...</p></div>;
  if (error) return <div className="clustering-container error-message">{error}</div>;

  return (
    <div className="clustering-container">
      <div className="clustering-header">
        <h2>Product Clustering Analysis</h2>
        <p>Products are automatically segmented into {optimalK} groups using K-Means based on their sales patterns.</p>
      </div>

      <div className="chart-container">
        <h3>Product Segments</h3>
        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <CartesianGrid stroke="#333" />
            <XAxis type="number" dataKey="TotalRevenue" name="Total Revenue" unit="$" stroke="#888" />
            <YAxis type="number" dataKey="TotalUnitsSold" name="Units Sold" stroke="#888" />
            <ZAxis type="category" dataKey="ProductName" name="Product Name" />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter name="Cluster 0" data={products.filter(p => p.Cluster === 0)} fill="#8884d8" />
            <Scatter name="Cluster 1" data={products.filter(p => p.Cluster === 1)} fill="#82ca9d" />
            <Scatter name="Cluster 2" data={products.filter(p => p.Cluster === 2)} fill="#ffc658" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Clustering;