import React from 'react';

export default function Header({ activeTabTitle }) {
  return (
    <header className="header">
      <div className="header-title">
        <h2>{activeTabTitle}</h2>
      </div>
    </header>
  );
}
