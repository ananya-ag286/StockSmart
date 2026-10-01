import React, { useState, useEffect } from 'react';
import { reportApi, orderApi } from '../api';
import { formatCurrency } from '../utils/formatters';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import Badge from '../components/common/Badge';
import { 
  Package, 
  Boxes, 
  MapPin, 
  Users, 
  AlertTriangle, 
  IndianRupee, 
  ShoppingCart, 
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export default function DashboardPage({ onNavigate }) {
  const [summary, setSummary] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [byLocation, setByLocation] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sumRes, lowRes, locRes, ordersRes] = await Promise.all([
        reportApi.getSummary(),
        reportApi.getLowStock(),
        reportApi.getByLocation(),
        orderApi.getAll()
      ]);

      setSummary(sumRes);
      setLowStock(lowRes || []);
      setByLocation(locRes || []);
      setRecentOrders((ordersRes || []).slice(-5).reverse());
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading dashboard metrics..." />;
  if (error) return <Alert type="error" message={error} onClose={() => setError(null)} />;

  const hasNoProducts = (summary?.totalProducts ?? 0) === 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-subtitle">Inventory at a glance</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={loadDashboardData}>
          Refresh Metrics
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid-metrics">
        <StatCard
          title="Total Products"
          value={summary?.totalProducts ?? 0}
          icon={Package}
          subtext="Catalog items"
        />
        <StatCard
          title="Total Inventory Qty"
          value={summary?.totalInventoryQuantity ?? 0}
          icon={Boxes}
          subtext="Units across locations"
        />
        <StatCard
          title="Total Inventory Value"
          value={formatCurrency(summary?.totalInventoryValue || 0)}
          icon={IndianRupee}
          subtext="Current stock valuation (₹)"
        />
        <StatCard
          title="Low Stock Items"
          value={summary?.lowStockProductsCount ?? 0}
          icon={AlertTriangle}
          subtext="Needs reordering"
          isAlert={summary?.lowStockProductsCount > 0}
        />
        <StatCard
          title="Active Locations"
          value={summary?.totalLocations ?? 0}
          icon={MapPin}
          subtext="Stores & warehouses"
        />
        <StatCard
          title="Suppliers"
          value={summary?.totalSuppliers ?? 0}
          icon={Users}
          subtext="Registered vendors"
        />
        <StatCard
          title="Total Orders"
          value={summary?.totalOrders ?? 0}
          icon={ShoppingCart}
          subtext="Customer orders"
        />
        <StatCard
          title="Processed Orders"
          value={summary?.processedOrders ?? 0}
          icon={CheckCircle}
          subtext="Fulfilled orders"
        />
      </div>

      {/* Overview Tables Row */}
      <div className="grid-two-columns">
        {/* Low Stock Alerts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={15} className="text-amber" />
              Low Stock Alerts ({lowStock.length})
            </h3>
            {onNavigate && (
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('reports')}>
                View All <ArrowRight size={14} />
              </button>
            )}
          </div>
          <div className="card-body no-padding">
            {hasNoProducts ? (
              <p style={{ padding: '20px', color: 'var(--text-secondary)', textAlign: 'center', fontSize: '13.5px' }}>
                No products added yet.
              </p>
            ) : lowStock.length === 0 ? (
              <p style={{ padding: '20px', color: 'var(--text-secondary)', textAlign: 'center', fontSize: '13.5px' }}>
                All products are sufficiently stocked.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Location</th>
                      <th>SKU</th>
                      <th>Current Stock</th>
                      <th>Reorder Level</th>
                      <th>Supplier Info</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.slice(0, 5).map((item) => (
                      <tr key={`${item.productId}-${item.locationId || 'default'}`}>
                        <td style={{ fontWeight: '500' }}>{item.productName}</td>
                        <td style={{ fontSize: '13px', fontWeight: '500' }}>{item.locationName || '-'}</td>
                        <td><code>{item.sku}</code></td>
                        <td style={{ fontWeight: '600', color: item.currentStock === 0 ? 'var(--danger)' : 'var(--warning)' }}>
                          {item.currentStock}
                        </td>
                        <td>{item.reorderLevel}</td>
                        <td style={{ fontSize: '12px' }}>
                          {item.preferredSupplierName ? (
                            <span>
                              <strong>{item.preferredSupplierName}</strong>
                              <br />
                              <span style={{ color: 'var(--text-secondary)' }}>
                                Price: {formatCurrency(item.supplierPrice)} | {item.leadTimeDays}d lead
                              </span>
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>No Supplier</span>
                          )}
                        </td>
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

        {/* Inventory by Location */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={15} className="text-terracotta" />
              Stock Distribution by Location
            </h3>
            {onNavigate && (
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('locations')}>
                Locations <ArrowRight size={14} />
              </button>
            )}
          </div>
          <div className="card-body no-padding">
            {byLocation.length === 0 ? (
              <p style={{ padding: '20px', color: 'var(--text-secondary)', textAlign: 'center', fontSize: '13.5px' }}>
                No locations configured yet.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Location</th>
                      <th>Type</th>
                      <th>Items</th>
                      <th>Total Quantity</th>
                      <th>Valuation (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byLocation.map((loc) => (
                      <tr key={loc.locationId}>
                        <td style={{ fontWeight: '500' }}>{loc.locationName}</td>
                        <td>
                          <Badge type={loc.locationType} text={loc.locationType} />
                        </td>
                        <td>{loc.totalItemsCount}</td>
                        <td style={{ fontWeight: '600' }}>{loc.totalQuantity}</td>
                        <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{formatCurrency(loc.totalValue || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

