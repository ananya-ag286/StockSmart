import React, { useState } from 'react';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import InventoryPage from './pages/InventoryPage';
import OrdersPage from './pages/OrdersPage';
import SuppliersPage from './pages/SuppliersPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import LocationsPage from './pages/LocationsPage';
import BarcodeRfidPage from './pages/BarcodeRfidPage';
import ReportsPage from './pages/ReportsPage';
import './styles/main.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActiveTab} />;
      case 'products':
        return <ProductsPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'orders':
        return <OrdersPage />;
      case 'suppliers':
        return <SuppliersPage />;
      case 'purchase-orders':
        return <PurchaseOrdersPage />;
      case 'locations':
        return <LocationsPage />;
      case 'barcodes':
        return <BarcodeRfidPage />;
      case 'reports':
        return <ReportsPage />;
      default:
        return <DashboardPage onNavigate={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderPage()}
    </Layout>
  );
}
