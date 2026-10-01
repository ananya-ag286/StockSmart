import React, { useState, useEffect } from 'react';
import { orderApi, productApi, locationApi } from '../api';
import { formatCurrency } from '../utils/formatters';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import { Plus, Search, Eye, CheckCircle, XCircle, Trash2, ShoppingCart, PlusCircle, MinusCircle, AlertCircle } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [stockCheckOrder, setStockCheckOrder] = useState(null);
  const [stockCheckResults, setStockCheckResults] = useState([]);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // New Order Form state
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [orderItems, setOrderItems] = useState([
    { productId: '', quantity: 1 }
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ordData, prodData, locData] = await Promise.all([
        orderApi.getAll(),
        productApi.getAll(),
        locationApi.getAll()
      ]);
      setOrders(ordData || []);
      setProducts(prodData || []);
      setLocations(locData || []);
    } catch (err) {
      setError(err.message || 'Failed to load order data.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    const defaultLoc = locations.length > 0 ? locations[0].id : '';
    const defaultProd = products.length > 0 ? products[0].id : '';
    setSelectedLocationId(defaultLoc);
    setOrderItems([{ productId: defaultProd, quantity: 1 }]);
    setIsCreateOpen(true);
  };

  const handleAddItemRow = () => {
    const defaultProd = products.length > 0 ? products[0].id : '';
    setOrderItems([...orderItems, { productId: defaultProd, quantity: 1 }]);
  };

  const handleRemoveItemRow = (index) => {
    if (orderItems.length === 1) return;
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderItems];
    newItems[index][field] = value;
    setOrderItems(newItems);
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => {
      const p = products.find(prod => prod.id === parseInt(item.productId));
      const price = p?.price || 0;
      const qty = parseInt(item.quantity) || 0;
      return sum + (price * qty);
    }, 0);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLocationId || orderItems.length === 0) {
      setError('Please select a location and add at least one product item.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const requestPayload = {
        locationId: parseInt(selectedLocationId),
        items: orderItems.map(item => ({
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity)
        }))
      };

      await orderApi.create(requestPayload);
      setSuccessMsg('Order created successfully in PENDING status.');
      setIsCreateOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to create order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckStock = async (order) => {
    try {
      setSubmitting(true);
      setError(null);
      const results = await orderApi.checkStock(order.id);
      setStockCheckOrder(order);
      setStockCheckResults(results || []);
    } catch (err) {
      setError(err.message || 'Failed to check stock availability.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcessConfirm = async () => {
    if (!processingOrder) return;
    try {
      setSubmitting(true);
      setError(null);
      await orderApi.process(processingOrder.id);
      setSuccessMsg(`Order #${processingOrder.orderNumber} processed successfully. Stock deducted.`);
      setProcessingOrder(null);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to process order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancellingOrder) return;
    try {
      setSubmitting(true);
      setError(null);
      await orderApi.cancel(cancellingOrder.id);
      setSuccessMsg(`Order #${cancellingOrder.orderNumber} cancelled. Stock restored if previously processed.`);
      setCancellingOrder(null);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to cancel order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingOrder) return;
    try {
      setSubmitting(true);
      setError(null);
      await orderApi.delete(deletingOrder.id);
      setSuccessMsg('Order deleted successfully.');
      setDeletingOrder(null);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete order.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      (o.orderNumber && o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.location?.name && o.location.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !statusFilter || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-subtitle">Order placement, stock verification, and inventory fulfillment</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} /> Create New Order
        </button>
      </div>

      <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />
      <Alert type="error" message={error} onClose={() => setError(null)} />

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            className="form-control"
            placeholder="Search by Order Number or Location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: '180px' }}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="PROCESSED">PROCESSED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="card-body no-padding">
          {loading ? (
            <LoadingSpinner message="Fetching order records..." />
          ) : filteredOrders.length === 0 ? (
            <EmptyState
              title="No orders found"
              message="No order records match your criteria."
              actionLabel="Create Order"
              onAction={handleOpenCreate}
            />
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Fulfillment Location</th>
                    <th>Order Date</th>
                    <th>Items</th>
                    <th>Total Amount (₹)</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>{ord.orderNumber}</td>
                      <td>{ord.location?.name} ({ord.location?.type})</td>
                      <td>{ord.orderDate ? new Date(ord.orderDate).toLocaleString() : 'N/A'}</td>
                      <td>{ord.items?.length || 0} product(s)</td>
                      <td style={{ fontWeight: '600' }}>{formatCurrency(ord.totalAmount)}</td>
                      <td>
                        <Badge type={ord.status} text={ord.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            className="btn btn-secondary btn-icon"
                            title="View Order Details"
                            onClick={() => setViewingOrder(ord)}
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            className="btn btn-secondary btn-sm"
                            title="Check Stock Availability"
                            onClick={() => handleCheckStock(ord)}
                          >
                            Stock Check
                          </button>

                          {ord.status === 'PENDING' && (
                            <button
                              className="btn btn-success btn-sm"
                              title="Process Order (Deduct Inventory)"
                              onClick={() => setProcessingOrder(ord)}
                            >
                              <CheckCircle size={14} /> Process
                            </button>
                          )}

                          {ord.status !== 'CANCELLED' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              title="Cancel Order"
                              style={{ color: 'var(--warning)' }}
                              onClick={() => setCancellingOrder(ord)}
                            >
                              <XCircle size={14} /> Cancel
                            </button>
                          )}

                          <button
                            className="btn btn-secondary btn-icon"
                            title="Delete Order"
                            style={{ color: 'var(--danger)' }}
                            onClick={() => setDeletingOrder(ord)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Order Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Multi-Item Order"
        size="large"
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Fulfillment Location *</label>
            <select
              className="form-control"
              required
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
            >
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name} - [{loc.type}]</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label className="form-label" style={{ margin: 0 }}>Order Items *</label>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddItemRow}
              >
                <PlusCircle size={14} /> Add Line Item
              </button>
            </div>

            {orderItems.map((item, index) => {
              const selectedProduct = products.find(p => p.id === parseInt(item.productId));
              const unitPrice = selectedProduct?.price || 0;
              const lineTotal = unitPrice * (parseInt(item.quantity) || 0);

              return (
                <div key={index} className="form-row" style={{ alignItems: 'center', marginBottom: '10px', background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
                  <div style={{ flex: 2 }}>
                    <select
                      className="form-control"
                      required
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.price)})</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      placeholder="Qty"
                      required
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    />
                  </div>

                  <div style={{ width: '130px', textAlign: 'right', fontWeight: '600', fontSize: '14px' }}>
                    {formatCurrency(lineTotal)}
                  </div>

                  <div>
                    <button
                      type="button"
                      className="btn btn-secondary btn-icon"
                      disabled={orderItems.length === 1}
                      onClick={() => handleRemoveItemRow(index)}
                      style={{ color: 'var(--danger)' }}
                    >
                      <MinusCircle size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontWeight: '600', color: 'var(--primary)' }}>Calculated Total Amount:</span>
            <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)' }}>{formatCurrency(calculateTotal())}</span>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsCreateOpen(false)} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Submit Order'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Order Detail Modal */}
      <Modal
        isOpen={!!viewingOrder}
        onClose={() => setViewingOrder(null)}
        title={`Order Details - ${viewingOrder?.orderNumber}`}
        size="large"
      >
        {viewingOrder && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px', background: 'var(--bg-app)', padding: '16px', borderRadius: '6px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Location:</span>
                <p style={{ fontWeight: '600' }}>{viewingOrder.location?.name} ({viewingOrder.location?.type})</p>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Status:</span>
                <p><Badge type={viewingOrder.status} text={viewingOrder.status} /></p>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Date:</span>
                <p style={{ fontWeight: '500' }}>{viewingOrder.orderDate ? new Date(viewingOrder.orderDate).toLocaleString() : 'N/A'}</p>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Amount:</span>
                <p style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '16px' }}>{formatCurrency(viewingOrder.totalAmount)}</p>
              </div>
            </div>

            <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>Order Line Items</h4>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Unit Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(viewingOrder.items || []).map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: '600' }}>{item.product?.name}</td>
                      <td><code>{item.product?.sku}</code></td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>{item.quantity}</td>
                      <td style={{ fontWeight: '600' }}>{formatCurrency((item.price || 0) * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewingOrder(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Stock Availability Modal */}
      <Modal
        isOpen={!!stockCheckOrder}
        onClose={() => setStockCheckOrder(null)}
        title={`Stock Availability Check - Order ${stockCheckOrder?.orderNumber}`}
      >
        {stockCheckOrder && (
          <div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Checking current stock at fulfillment location <strong>{stockCheckOrder.location?.name}</strong>:
            </p>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Requested</th>
                    <th>Available Stock</th>
                    <th>Stock Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stockCheckResults.map(res => (
                    <tr key={res.productId}>
                      <td style={{ fontWeight: '600' }}>{res.productName}</td>
                      <td>{res.requestedQuantity}</td>
                      <td style={{ fontWeight: '700', color: res.available ? 'var(--success)' : 'var(--danger)' }}>
                        {res.availableQuantity}
                      </td>
                      <td>
                        {res.available ? (
                          <Badge type="ok" text="Sufficient" />
                        ) : (
                          <Badge type="critical" text="Insufficient" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setStockCheckOrder(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Process Order Confirm Modal */}
      <ConfirmModal
        isOpen={!!processingOrder}
        onClose={() => setProcessingOrder(null)}
        onConfirm={handleProcessConfirm}
        title="Confirm Process Order"
        message={`Are you sure you want to process Order #${processingOrder?.orderNumber}? This will deduct inventory quantities from location "${processingOrder?.location?.name}".`}
        confirmText="Process & Deduct Stock"
        confirmVariant="success"
        loading={submitting}
      />

      {/* Cancel Order Confirm Modal */}
      <ConfirmModal
        isOpen={!!cancellingOrder}
        onClose={() => setCancellingOrder(null)}
        onConfirm={handleCancelConfirm}
        title="Confirm Cancel Order"
        message={`Are you sure you want to cancel Order #${cancellingOrder?.orderNumber}? If this order was already processed, stock quantities will be restored.`}
        confirmText="Cancel Order"
        confirmVariant="danger"
        loading={submitting}
      />

      {/* Delete Order Confirm Modal */}
      <ConfirmModal
        isOpen={!!deletingOrder}
        onClose={() => setDeletingOrder(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Order Record"
        message={`Are you sure you want to delete Order #${deletingOrder?.orderNumber}?`}
        confirmText="Delete Order"
        loading={submitting}
      />
    </div>
  );
}

