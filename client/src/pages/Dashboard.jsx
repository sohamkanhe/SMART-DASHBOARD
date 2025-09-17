import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Dashboard.css';
import StatCard from '../components/StatCard';
import SalesChart from '../components/SalesChart';
import TransactionsTable from '../components/TransactionsTable';
import TransactionEntryForm from '../components/TransactionEntryForm'; // <-- Import the new form
import { FiDollarSign, FiShoppingBag, FiActivity } from 'react-icons/fi';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [kpiData, setKpiData] = useState({ totalSales: 0, totalOrders: 0, avgSaleValue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use useCallback to prevent re-creating the function on every render
  const fetchData = useCallback(async () => {
    try {
      // Don't set loading to true here to prevent full page flash on refresh
      const response = await axios.get('http://localhost:5000/api/transactions');
      const data = response.data;
      
      setTransactions(data);

      const formattedDataForChart = data.map(item => ({
        date: item.Date,
        cost: item.TotalRevenue
      }));
      setChartData(formattedDataForChart);

      if (data.length > 0) {
        const totalSalesValue = data.reduce((sum, item) => sum + item.TotalRevenue, 0);
        const totalOrders = data.length;
        setKpiData({
          totalSales: totalSalesValue,
          totalOrders: totalOrders,
          avgSaleValue: totalSalesValue / totalOrders
        });
      }
    } catch (err) {
      setError("Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // This function will be called by the form when a new sale is added
  const handleTransactionAdded = () => {
    fetchData(); // Simply re-fetch all data to update the dashboard
  };
  
  if (error) return <main className="dashboard"><p className="status-message error">{error}</p></main>;
  if (loading) return <main className="dashboard"><p className="status-message">Loading dashboard...</p></main>;

  return (
    <main className="dashboard">
      {/* The new data entry form is placed at the top */}
      <TransactionEntryForm onTransactionAdded={handleTransactionAdded} />

      <div className="stat-cards-container">
        <StatCard 
          icon={<FiDollarSign />}
          title="Total Sales"
          value={`$${kpiData.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <StatCard 
          icon={<FiShoppingBag />}
          title="Total Orders"
          value={kpiData.totalOrders.toLocaleString()}
        />
        <StatCard 
          icon={<FiActivity />}
          title="Avg. Sale Value"
          value={`$${kpiData.avgSaleValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
      </div>
      <div className="dashboard-main-content">
        <SalesChart historicalData={chartData} />
        <TransactionsTable transactions={transactions.slice(-10).reverse()} /> {/* Show 10 most recent transactions */}
      </div>
    </main>
  );
};

export default Dashboard;