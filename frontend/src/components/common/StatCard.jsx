import React from 'react';

export default function StatCard({ title, value, icon: Icon, subtext, isAlert = false }) {
  return (
    <div className={`stat-card ${isAlert ? 'stat-card-alert' : ''}`}>
      <div className="stat-card-header">
        <span className="stat-title">{title}</span>
        {Icon && (
          <div className="stat-icon-subtle">
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className="stat-value">{value}</div>
      {subtext && <div className="stat-sub">{subtext}</div>}
    </div>
  );
}
