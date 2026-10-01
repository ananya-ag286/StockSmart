import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Boxes, 
  ShoppingCart, 
  Users, 
  Truck,
  MapPin, 
  QrCode, 
  BarChart3,
  Store
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'suppliers', label: 'Suppliers', icon: Users },
    { id: 'purchase-orders', label: 'Purchase Orders', icon: Truck },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'barcodes', label: 'Barcode / RFID', icon: QrCode },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Store size={20} className="brand-icon" />
        <h1>StockSmart</h1>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={16} className="nav-icon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
