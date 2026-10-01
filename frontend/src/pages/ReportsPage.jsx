import React, { useState, useEffect } from 'react';
import { reportApi } from '../api';
import { formatCurrency } from '../utils/formatters';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import Badge from '../components/common/Badge';
import { 
  BarChart3, 
  AlertTriangle, 
  MapPin, 
  Package, 
  Boxes, 
  IndianRupee, 
  ShoppingCart,
  Printer
} from 'lucide-react';

export default function ReportsPage() {
  const [summary, setSummary] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [byLocation, setByLocation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sumRes, lowRes, locRes] = await Promise.all([
        reportApi.getSummary(),
        reportApi.getLowStock(),
        reportApi.getByLocation()
      ]);

      setSummary(sumRes);
      setLowStock(lowRes || []);
      setByLocation(locRes || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch KPI report data.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <LoadingSpinner message="Calculating inventory KPIs & generating reports..." />;
  if (error) return <Alert type="error" message={error} onClose={() => setError(null)} />;

  return (
    <div className="report-page">
      {/* Print-Only Professional Header */}
      <div className="print-only report-print-header" style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid var(--primary)', paddingBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#202321', margin: 0, letterSpacing: '-0.3px' }}>StockSmart</h1>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary)', margin: '2px 0 0 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Official Inventory & Valuation Report</p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '11px', color: '#6b7280' }}>
            <p style={{ margin: 0, fontWeight: '500' }}>Generated: {new Date().toLocaleString()}</p>
            <p style={{ margin: '2px 0 0 0', fontStyle: 'italic' }}>Confidential - Internal Use Only</p>
          </div>
        </div>
      </div>

      <div className="page-header screen-only">
        <div>
          <p className="page-subtitle">Inventory valuation, replenishment alerts, and location distribution analytics</p>
        </div>
        <div className="page-actions screen-only">
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={16} /> Print Report
          </button>
          <button className="btn btn-primary" onClick={loadReports}>
            Refresh Analytics
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid-metrics">
        <StatCard
          title="Total Products"
          value={summary?.totalProducts ?? 0}
          icon={Package}
        />
        <StatCard
          title="Total Stock Units"
          value={summary?.totalInventoryQuantity ?? 0}
          icon={Boxes}
        />
        <StatCard
          title="Inventory Valuation"
          value={formatCurrency(summary?.totalInventoryValue || 0)}
          icon={IndianRupee}
        />
        <StatCard
          title="Low Stock Items"
          value={summary?.lowStockProductsCount ?? 0}
          icon={AlertTriangle}
          isAlert={summary?.lowStockProductsCount > 0}
        />
        <StatCard
          title="Orders Placed"
          value={summary?.totalOrders ?? 0}
          icon={ShoppingCart}
        />
        <StatCard
          title="Fulfilled Orders"
          value={summary?.processedOrders ?? 0}
          icon={BarChart3}
        />
      </div>

      {/* Section 1: Low Stock Report */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} className="text-amber" />
            Low Stock & Replenishment Report
          </h3>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Products at or below reorder threshold
          </span>
        </div>
        <div className="card-body no-padding">
          {lowStock.length === 0 ? (
            <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
              No items require immediate reordering. Stock levels are healthy.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Location</th>
                    <th>SKU</th>
                    <th>Reorder Level</th>
                    <th>Current Stock</th>
                    <th>Supplier</th>
                    <th>Supplier Price</th>
                    <th>Lead Time</th>
                    <th>Min Order Qty</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((item) => (
                    <tr key={`${item.productId}-${item.locationId || 'default'}`}>
                      <td style={{ fontWeight: '600' }}>{item.productName}</td>
                      <td style={{ fontWeight: '500' }}>{item.locationName || '-'}</td>
                      <td><code>{item.sku}</code></td>
                      <td>{item.reorderLevel} units</td>
                      <td style={{ fontWeight: '700', color: item.currentStock === 0 ? '#dc2626' : '#d97706' }}>
                        {item.currentStock} units
                      </td>
                      <td style={{ fontWeight: '500' }}>{item.preferredSupplierName || 'Unassigned'}</td>
                      <td style={{ fontWeight: '600', color: item.supplierPrice ? 'var(--primary)' : 'inherit' }}>
                        {item.supplierPrice ? formatCurrency(item.supplierPrice) : '-'}
                      </td>
                      <td>{item.leadTimeDays ? `${item.leadTimeDays} days` : '-'}</td>
                      <td>{item.minimumOrderQuantity ? `${item.minimumOrderQuantity} units` : '-'}</td>
                      <td>
                        <Badge type={item.status} text={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Location Distribution Report */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} className="text-terracotta" />
            Inventory Breakdown by Location
          </h3>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Physical inventory & valuation per facility
          </span>
        </div>
        <div className="card-body no-padding">
          {byLocation.length === 0 ? (
            <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
              No location data available.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Location ID</th>
                    <th>Facility Name</th>
                    <th>Facility Type</th>
                    <th>Unique Products</th>
                    <th>Total Stock Units</th>
                    <th>Location Total Value (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {byLocation.map((loc) => (
                    <tr key={loc.locationId}>
                      <td>#{loc.locationId}</td>
                      <td style={{ fontWeight: '600' }}>{loc.locationName}</td>
                      <td>
                        <Badge type={loc.locationType} text={loc.locationType} />
                      </td>
                      <td>{loc.totalItemsCount}</td>
                      <td style={{ fontWeight: '600' }}>{loc.totalQuantity} units</td>
                      <td style={{ fontWeight: '700', color: 'var(--primary)' }}>
                        {formatCurrency(loc.totalValue || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Print-Only Footer */}
      <div className="print-only report-print-footer" style={{ marginTop: '16px', paddingTop: '8px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9ca3af' }}>
        <span>StockSmart Inventory Management System</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
}

