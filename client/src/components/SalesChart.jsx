import React from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import './SalesChart.css';

const SalesChart = ({ historicalData, forecastData }) => {
  
  // A more robust way to combine historical and forecast data
  let combinedData = [];

  if (historicalData && historicalData.length > 0) {
    // 1. Add all historical points, ensuring they have a 'cost' key
    combinedData = historicalData.map(item => ({ ...item, cost: item.cost }));

    if (forecastData && forecastData.length > 0) {
      // 2. Find the last historical point to create a seamless connection
      const lastHistoricalPoint = combinedData[combinedData.length - 1];

      // 3. Create the first forecast point that connects to the historical data
      const connectingForecastPoint = {
        date: lastHistoricalPoint.date,
        forecast: lastHistoricalPoint.cost // Start forecast from the last actual cost
      };

      // 4. Combine the historical data, the connection point, and the future forecast data
      combinedData = [
        ...combinedData,
        connectingForecastPoint,
        ...forecastData
      ];
    }
  }

  return (
    <div className="sales-chart-container">
      <h3>Sales Overview & Forecast</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={combinedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="date" stroke="#888" angle={-20} textAnchor="end" height={50} />
          <YAxis stroke="#888" />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--background-light)', border: '1px solid #333' }} 
          />
          <Legend />
          {/* This line will only render where 'cost' has a value */}
          <Line type="monotone" dataKey="cost" name="Historical Sales" stroke="#665DFF" strokeWidth={2} dot={false} />
          
          {/* This line will only render where 'forecast' has a value */}
          <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#19ffb5" strokeWidth={2} strokeDasharray="5 5" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;