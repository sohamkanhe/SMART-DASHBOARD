import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Forecast from './pages/Forecast';
import Transactions from './pages/Transactions';
import Classification from './pages/Classification';
import Clustering from './pages/Clustering'; 
import Charts from './pages/Charts'; 
function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Topbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/classification" element={<Classification />} />
            <Route path="/clustering" element={<Clustering />} />
            <Route path="/charts" element={<Charts />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;