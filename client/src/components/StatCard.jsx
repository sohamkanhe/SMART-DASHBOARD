import React from 'react';
import './StatCard.css';

const StatCard = ({ icon, title, value, subtext }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-icon">
        {icon}
      </div>
      <div className="stat-card-info">
        <h4>{title}</h4>
        <p>{value}</p>
        <span>{subtext}</span>
      </div>
    </div>
  );
};

export default StatCard;