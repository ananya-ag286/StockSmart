import React, { useState, useEffect } from 'react';
import { purchaseOrderApi, supplierApi, productApi, locationApi, supplierProductApi } from '../api';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import Badge from '../components/common/Badge';
import { formatCurrency } from '../utils/formatters';
import { 
  Plus, 
  Search, 
  Eye, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  PlusCircle, 
  MinusCircle,
  MapPin,
  Calendar,
  Building2,
  PackageCheck
} from 'lucide-react';

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingPo, setViewingPo] = useState(null);
  const [receivingPo, setReceivingPo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State for PO creation
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [poItems, setPoItems] = useState([
    { productId: '', quantity: '10', unitPrice: '' }
  ]);
  const [supplierProductsMap, setSupplierProductsMap] = useState({});

  // Form State for Receiving PO
  const [receiveLocationId, setReceiveLocationId] = useState('');
  const [receiveQuantities, setReceiveQuantities] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [poRes, supRes, prodRes, locRes] = await Promise.all([
        purchaseOrderApi.getAll(),
        supplierApi.getAll(),
        productApi.getAll(),
        locationApi.getAll()
      ]);

      setPurchaseOrders(poRes || []);
      setSuppliers(supRes || []);
      setProducts(prodRes || []);
      setLocations(locRes || []);

      if (locRes && locRes.length > 0) {
        setSelectedLocationId(locRes[0].id.toString());
        setReceiveLocationId(locRes[0].id.toString());
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch purchase orders data.');
    } finally {
      setLoading(false);
    }
  };

  // When supplier is selected in create form, pre-fetch supplier product mappings to auto-populate unit price
  const handleSupplierSelect = async (supplierIdStr) => {
    setSelectedSupplierId(supplierIdStr);
    if (!supplierIdStr) {
      setSupplierProductsMap({});
      return;
    }

    try {
      const mappings = await supplierProductApi.getBySupplier(supplierIdStr);
      const mapObj = {};
      (mappings || []).forEach(m => {
        if (m.product && m.product.id != null) {
          mapObj[m.product.id] = m.supplierPrice;
        }
      });
      setSupplierProductsMap(mapObj);

      // Auto update price for items if matching mapping exists
      setPoItems(prev => prev.map(item => {
        if (item.productId && mapObj[item.productId] !== undefined) {
          return { ...item, unitPrice: mapObj[item.productId].toString() };
        }
        return item;
      }));
    } catch (err) {
      console.error('Error fetching supplier products:', err);
    }
  };

  const handleOpenCreate = () => {
    const defaultSup = suppliers.length > 0 ? suppliers[0].id.toString() : '';
    const defaultLoc = locations.length > 0 ? locations[0].id.toString() : '';
    const defaultProd = products.length > 0 ? products[0].id.toString() : '';

    setSelectedSupplierId(defaultSup);
    setSelectedLocationId(defaultLoc);
    setExpectedDate('');

    if (defaultSup) {
      handleSupplierSelect(defaultSup);
    } else {
      setSupplierProductsMap({});
    }

    setPoItems([{ productId: defaultProd, quantity: '10', unitPrice: '' }]);
    setIsCreateOpen(true);
  };

  const handleAddItemRow = () => {
    const defaultProd = products.length > 0 ? products[0].id.toString() : '';
    const initialPrice = defaultProd && supplierProductsMap[defaultProd] !== undefined 
      ? supplierProductsMap[defaultProd].toString() : '';
    setPoItems(prev => [...prev, { productId: defaultProd, quantity: '10', unitPrice: initialPrice }]);
  };

  const handleRemoveItemRow = (index) => {
    if (poItems.length === 1) return;
    setPoItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setPoItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      if (field === 'productId') {
        const mappedPrice = supplierProductsMap[value];
        if (mappedPrice !== undefined) {
          updated[index].unitPrice = mappedPrice.toString();
        } else {
          const prod = products.find(p => p.id === parseInt(value));
          if (prod && prod.price) {
            updated[index].unitPrice = prod.price.toString();
          }
        }
      }

      return updated;
    });
  };

  const calculateTotal = () => {
    return poItems.reduce((sum, item) => {
      const qty = parseInt(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      return sum + (qty * price);
    }, 0);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      setError('Please select a supplier.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const itemsPayload = poItems.map(item => ({
        productId: parseInt(item.productId),
        quantity: parseInt(item.quantity),
        unitPrice: item.unitPrice !== '' ? parseFloat(item.unitPrice) : null
      }));

      const payload = {
        supplierId: parseInt(selectedSupplierId),
        receiveLocationId: selectedLocationId ? parseInt(selectedLocationId) : null,
        expectedDate: expectedDate ? new Date(expectedDate).toISOString() : null,
        items: itemsPayload
      };

      await purchaseOrderApi.create(payload);
      setSuccessMsg('Purchase Order created successfully.');
      setIsCreateOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to create Purchase Order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReceive = (po) => {
    setReceivingPo(po);
    const initialLoc = po.receiveLocation?.id?.toString() || (locations.length > 0 ? locations[0].id.toString() : '');
    setReceiveLocationId(initialLoc);

    const qtys = {};
    (po.items || []).forEach(item => {
      const remaining = item.quantity - (item.receivedQuantity || 0);
      qtys[item.id] = remaining > 0 ? remaining : 0;
    });
    setReceiveQuantities(qtys);
  };

  const handleReceiveSubmit = async (e) => {
    e.preventDefault();
    if (!receivingPo) return;
    if (!receiveLocationId) {
      setError('Please select a target location to receive inventory.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const receivePayload = {
        locationId: parseInt(receiveLocationId),
        itemReceivedQuantities: receiveQuantities
      };

      await purchaseOrderApi.receive(receivingPo.id, receivePayload);
      setSuccessMsg(`Stock successfully received into inventory for Purchase Order ${receivingPo.purchaseOrderNumber}.`);
      setReceivingPo(null);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to receive Purchase Order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelPo = async (poId) => {
    if (!window.confirm('Are you sure you want to cancel this Purchase Order?')) return;
    try {
      setSubmitting(true);
      setError(null);
      await purchaseOrderApi.cancel(poId);
      setSuccessMsg('Purchase Order cancelled successfully.');
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to cancel Purchase Order.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOrders = purchaseOrders.filter(po => {
    const poNum = po.purchaseOrderNumber || '';
    const supName = po.supplier?.name || '';
    const matchesSearch = 
      poNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <LoadingSpinner message="Loading Purchase Orders & Supplier Procurement data..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-subtitle">Supplier procurement, purchase order tracking, and stock intake</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} /> Create Purchase Order
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
            placeholder="Search by PO Number or Supplier Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '180px' }}
          >
            <option value="">All Statuses</option>
            <option value="ORDERED">ORDERED</option>
            <option value="RECEIVED">RECEIVED</option>
            <option value="PARTIALLY_RECEIVED">PARTIALLY RECEIVED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="card">
        <div className="card-body no-padding">
          {filteredOrders.length === 0 ? (
            <p style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No purchase orders found.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>PO Number</th>
                    <th>Supplier</th>
                    <th>Order Date</th>
                    <th>Fulfillment Location</th>
                    <th>Total Value (₹)</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((po) => (
                    <tr key={po.id}>
                      <td style={{ fontWeight: '600' }}>
                        <code>{po.purchaseOrderNumber}</code>
                      </td>
                      <td style={{ fontWeight: '600' }}>{po.supplier?.name}</td>
                      <td>{po.orderDate ? new Date(po.orderDate).toLocaleDateString('en-IN') : 'N/A'}</td>
                      <td>
                        {po.receiveLocation ? (
                          <span>{po.receiveLocation.name} ({po.receiveLocation.type})</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Pending Selection</span>
                        )}
                      </td>
                      <td style={{ fontWeight: '700', color: 'var(--primary)' }}>
                        {formatCurrency(po.totalAmount)}
                      </td>
                      <td>
                        <Badge type={po.status} text={po.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary btn-icon"
                            onClick={() => setViewingPo(po)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>

                          {(po.status === 'ORDERED' || po.status === 'PARTIALLY_RECEIVED') && (
                            <>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleOpenReceive(po)}
                                title="Receive Stock into Inventory"
                              >
                                <PackageCheck size={14} /> Receive Stock
                              </button>
                              <button
                                className="btn btn-secondary btn-icon"
                                onClick={() => handleCancelPo(po.id)}
                                title="Cancel PO"
                                style={{ color: 'var(--danger)' }}
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
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

      {/* Create Purchase Order Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Supplier Purchase Order"
        size="large"
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Select Supplier *</label>
              <select
                className="form-control"
                required
                value={selectedSupplierId}
                onChange={(e) => handleSupplierSelect(e.target.value)}
              >
                <option value="">-- Select Supplier --</option>
                {suppliers.map(sup => (
                  <option key={sup.id} value={sup.id}>{sup.name} [{sup.status || 'ACTIVE'}]</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Target Intake Location</label>
              <select
                className="form-control"
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
              >
                <option value="">-- Select Location --</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name} ({loc.type})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ margin: 0 }}>Procurement Line Items *</label>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddItemRow}
              >
                <PlusCircle size={14} /> Add Line Item
              </button>
            </div>

            {poItems.map((item, index) => {
              const selectedProduct = products.find(p => p.id === parseInt(item.productId));
              const qty = parseInt(item.quantity) || 0;
              const price = parseFloat(item.unitPrice) || 0;
              const lineTotal = qty * price;
              const hasSupplierMapping = item.productId && supplierProductsMap[item.productId] !== undefined;

              return (
                <div key={index} className="form-row" style={{ alignItems: 'center', marginBottom: '10px', background: '#F8FAF5', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <div style={{ flex: 2 }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Product</label>
                    <select
                      className="form-control"
                      required
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                    >
                      <option value="">-- Select Product --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Order Quantity</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      required
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>
                      Supplier Price (₹) {hasSupplierMapping && <span style={{ color: 'var(--success)', fontWeight: '600' }}>(Mapped)</span>}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      required
                      placeholder="0.00"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                    />
                  </div>

                  <div style={{ width: '120px', textAlign: 'right', fontWeight: '600', fontSize: '14px', paddingTop: '16px' }}>
                    {formatCurrency(lineTotal)}
                  </div>

                  <div style={{ paddingTop: '16px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-icon"
                      disabled={poItems.length === 1}
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

          <div style={{ background: '#FAF3E8', border: '1px solid var(--warning-border)', padding: '16px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Total Purchase Order Amount:</span>
            <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)' }}>{formatCurrency(calculateTotal())}</span>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsCreateOpen(false)} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Submit Purchase Order'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Receive Stock Modal */}
      <Modal
        isOpen={!!receivingPo}
        onClose={() => setReceivingPo(null)}
        title={`Receive Inventory Stock - ${receivingPo?.purchaseOrderNumber}`}
      >
        {receivingPo && (
          <form onSubmit={handleReceiveSubmit}>
            <div style={{ marginBottom: '16px', background: 'var(--bg-app)', padding: '12px', borderRadius: '6px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Supplier: <strong>{receivingPo.supplier?.name}</strong></p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>PO Status: <Badge type={receivingPo.status} text={receivingPo.status} /></p>
            </div>

            <div className="form-group">
              <label className="form-label">Target Inventory Location *</label>
              <select
                className="form-control"
                required
                value={receiveLocationId}
                onChange={(e) => setReceiveLocationId(e.target.value)}
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name} ({loc.type})</option>
                ))}
              </select>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Stock received will automatically increase available inventory at this location.
              </p>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>Item Quantity Intake</h4>
            <div className="table-responsive" style={{ marginBottom: '20px' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Ordered Qty</th>
                    <th>Already Received</th>
                    <th>Receiving Now</th>
                  </tr>
                </thead>
                <tbody>
                  {(receivingPo.items || []).map(item => {
                    const remaining = item.quantity - (item.receivedQuantity || 0);
                    return (
                      <tr key={item.id}>
                        <td style={{ fontWeight: '600' }}>{item.product?.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.receivedQuantity || 0}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max={remaining}
                            className="form-control"
                            style={{ width: '90px' }}
                            value={receiveQuantities[item.id] !== undefined ? receiveQuantities[item.id] : remaining}
                            onChange={(e) => setReceiveQuantities({ ...receiveQuantities, [item.id]: parseInt(e.target.value) || 0 })}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setReceivingPo(null)} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Receiving...' : 'Confirm Stock Receive'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* View PO Detail Modal */}
      <Modal
        isOpen={!!viewingPo}
        onClose={() => setViewingPo(null)}
        title={`Purchase Order Details - ${viewingPo?.purchaseOrderNumber}`}
        size="large"
      >
        {viewingPo && (
          <div>
            <div className="grid-two-columns" style={{ marginBottom: '20px', background: 'var(--bg-app)', padding: '16px', borderRadius: '6px' }}>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Supplier:</p>
                <p style={{ fontWeight: '600', fontSize: '15px' }}>{viewingPo.supplier?.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Email: {viewingPo.supplier?.email || 'N/A'}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Status & Location:</p>
                <p><Badge type={viewingPo.status} text={viewingPo.status} /></p>
                <p style={{ fontSize: '13px', fontWeight: '500', marginTop: '4px' }}>
                  Target Location: {viewingPo.receiveLocation ? `${viewingPo.receiveLocation.name} (${viewingPo.receiveLocation.type})` : 'Not specified'}
                </p>
              </div>
            </div>

            <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>Procurement Line Items</h4>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Supplier Unit Price (₹)</th>
                    <th>Ordered Qty</th>
                    <th>Received Qty</th>
                    <th>Line Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {(viewingPo.items || []).map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: '600' }}>{item.product?.name}</td>
                      <td><code>{item.product?.sku}</code></td>
                      <td>{formatCurrency(item.unitPrice)}</td>
                      <td>{item.quantity}</td>
                      <td>{item.receivedQuantity || 0}</td>
                      <td style={{ fontWeight: '600' }}>{formatCurrency(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '16px', textAlign: 'right', fontSize: '16px', fontWeight: '700' }}>
              Total Order Amount: <span style={{ color: 'var(--primary)' }}>{formatCurrency(viewingPo.totalAmount)}</span>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewingPo(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
