import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Charts.css';

const Charts = () => {
  const [chartData, setChartData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data (categories and products)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/chart_data');
        setCategories(response.data.categories);
        setProducts(response.data.products);
        setChartData(response.data);
        // Set a default category to show a chart on first load
        if (response.data.categories.length > 0) {
          setSelectedCategory(response.data.categories[0]);
        }
      } catch (err) {
        setError('Failed to fetch chart data.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedProduct(''); // Reset product selection when category changes
  };

  const handleProductChange = (e) => {
    setSelectedProduct(e.target.value);
  };

  const renderChart = () => {
    if (!chartData) return null;

    // SCENARIO 3: A specific product is selected
    if (selectedProduct) {
      const productHistory = chartData.product_sales_history[selectedProduct];
      return (
        <>
          <h3>Sales History for: {selectedProduct}</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={productHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="Date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="UnitsSold" fill="#8884d8" name="Units Sold" />
            </BarChart>
          </ResponsiveContainer>
        </>
      );
    }

    // SCENARIO 2: A category is selected (but no product)
    if (selectedCategory) {
      const categorySales = chartData.category_sales_over_time[selectedCategory];
      const productDistribution = chartData.product_distribution_by_category[selectedCategory];
      const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

      return (
        <div className="chart-grid">
          <div className="chart-wrapper">
            <h3>Sales Over Time for: {selectedCategory}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={categorySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="Date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="TotalRevenue" stroke="#82ca9d" name="Total Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-wrapper">
            <h3>Product Distribution in: {selectedCategory}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={productDistribution} dataKey="UnitsSold" nameKey="ProductName" cx="50%" cy="50%" outerRadius={100} label>
                  {productDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }
    
    // SCENARIO 1: Nothing is selected (initial state)
    return <p>Please select a category to view charts.</p>;
  };

  if (loading) return <div className="charts-container"><p>Loading chart data...</p></div>;
  if (error) return <div className="charts-container error-message">{error}</div>;

  return (
    <div className="charts-container">
      <div className="charts-header">
        <h2>Chart Analysis</h2>
        <p>Filter by category or product to visualize sales data.</p>
      </div>
      <div className="filter-controls">
        <select onChange={handleCategoryChange} value={selectedCategory}>
          <option value="">-- Select a Category --</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        
        {selectedCategory && (
          <select onChange={handleProductChange} value={selectedProduct}>
            <option value="">-- Select a Product (Optional) --</option>
            {products
              .filter(p => p.ProductCategory === selectedCategory)
              .map(p => <option key={p.ProductName} value={p.ProductName}>{p.ProductName}</option>)}
          </select>
        )}
      </div>
      <div className="chart-display-area">
        {renderChart()}
      </div>
    </div>
  );
};

export default Charts;
