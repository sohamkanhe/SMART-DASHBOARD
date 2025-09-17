// src/components/Topbar.jsx
import React from 'react';
import './Topbar.css';
import { FiSearch, FiMoon, FiSettings, FiUser } from 'react-icons/fi';

const Topbar = () => {
  return (
    <header className="topbar">
      <div className="search-wrapper">
        <FiSearch className="search-icon" />
        <input type="text" placeholder="Search..." />
      </div>
      <div className="topbar-icons">
        <button className="icon-button"><FiMoon /></button>
        <button className="icon-button"><FiSettings /></button>
        <button className="icon-button"><FiUser /></button>
      </div>
    </header>
  );
};

export default Topbar;