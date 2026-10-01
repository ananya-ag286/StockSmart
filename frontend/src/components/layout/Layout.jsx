import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ activeTab, setActiveTab, children }) {
  const titles = {
    dashboard: 'Dashboard',
    products: 'Products',
    inventory: 'Inventory',
    orders: 'Orders',
    suppliers: 'Suppliers',
    'purchase-orders': 'Purchase Orders',
    locations: 'Locations',
    barcodes: 'Barcode / RFID',
    reports: 'Reports',
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-wrapper">
        <Header activeTabTitle={titles[activeTab] || 'StockSmart'} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
