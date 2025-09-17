import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';
// Add FiBarChart2 to the import line
import { FiGrid, FiClipboard, FiTrendingUp, FiTag, FiCircle, FiBarChart2 } from 'react-icons/fi';

const navItems = [
  { text: "Dashboard", icon: <FiGrid />, path: "/" },
  { text: "Transactions", icon: <FiClipboard />, path: "/transactions" },
  { text: "Forecast", icon: <FiTrendingUp />, path: "/forecast" },
  { text: "Classification", icon: <FiTag />, path: "/classification" },
  { text: "Clustering", icon: <FiCircle />, path: "/clustering" },
  { text: "Charts", icon: <FiBarChart2 />, path: "/charts" }, // <-- New Item
];

const Sidebar = () => {
  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h1>SMART DASHBOARD</h1>
      </div>
      <ul className="sidebar-list">
        {navItems.map((item) => (
          <li key={item.text} className="sidebar-list-item">
            <Link to={item.path}>
              {item.icon}
              <span>{item.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
