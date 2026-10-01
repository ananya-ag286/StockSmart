import React, { useState, useEffect } from 'react';
import { supplierApi, supplierProductApi, productApi, purchaseOrderApi } from '../api';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import { formatCurrency } from '../utils/formatters';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  Package, 
  Truck, 
  PlusCircle, 
  CheckCircle, 
  XCircle,
  Clock
} from 'lucide-react';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deletingSupplier, setDeletingSupplier] = useState(null);

  // View Supplier Details state
  const [viewingSupplier, setViewingSupplier] = useState(null);
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [supplierPos, setSupplierPos] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Add/Edit Product Mapping state
  const [isAddMappingOpen, setIsAddMappingOpen] = useState(false);
  const [mappingFormData, setMappingFormData] = useState({
    productId: '',
    supplierPrice: '',
    leadTimeDays: '5',
    minimumOrderQuantity: '10'
  });

  const [submitting, setSubmitting] = useState(false);

  // Form State for Supplier
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    loadSuppliers();
    loadProducts();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supplierApi.getAll();
      setSuppliers(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load suppliers.');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await productApi.getAll();
      setProductsList(data || []);
    } catch (err) {
      console.error('Failed to load products list:', err);
    }
  };

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setFormData({ name: '', email: '', phone: '', address: '', status: 'ACTIVE' });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name || '',
      email: sup.email || '',
      phone: sup.phone || '',
      address: sup.address || '',
      status: sup.status || 'ACTIVE'
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setError('Supplier name is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      if (editingSupplier) {
        await supplierApi.update(editingSupplier.id, formData);
        setSuccessMsg('Supplier updated successfully.');
      } else {
        await supplierApi.create(formData);
        setSuccessMsg('Supplier added successfully.');
      }
      setIsFormOpen(false);
      loadSuppliers();
    } catch (err) {
      setError(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSupplier) return;
    try {
      setSubmitting(true);
      await supplierApi.delete(deletingSupplier.id);
      setSuccessMsg('Supplier removed successfully.');
      setDeletingSupplier(null);
      loadSuppliers();
    } catch (err) {
      setError(err.message || 'Failed to delete supplier.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Supplier Detail view
  const handleOpenView = async (sup) => {
    setViewingSupplier(sup);
    setLoadingDetails(true);
    try {
      const [spRes, poRes] = await Promise.all([
        supplierProductApi.getBySupplier(sup.id),
        purchaseOrderApi.getBySupplier(sup.id)
      ]);
      setSupplierProducts(spRes || []);
      setSupplierPos(poRes || []);
    } catch (err) {
      console.error('Failed to load supplier details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Open Add Product Mapping Modal
  const handleOpenAddMapping = () => {
    const defaultProdId = productsList.length > 0 ? productsList[0].id.toString() : '';
    const defaultPrice = productsList.length > 0 && productsList[0].price ? productsList[0].price.toString() : '500';
    setMappingFormData({
      productId: defaultProdId,
      supplierPrice: defaultPrice,
      leadTimeDays: '5',
      minimumOrderQuantity: '10'
    });
    setIsAddMappingOpen(true);
  };

  const handleSaveProductMapping = async (e) => {
    e.preventDefault();
    if (!viewingSupplier || !mappingFormData.productId) {
      setError('Please select a valid product.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const payload = {
        productId: parseInt(mappingFormData.productId),
        supplierPrice: parseFloat(mappingFormData.supplierPrice) || 0,
        leadTimeDays: parseInt(mappingFormData.leadTimeDays) || 0,
        minimumOrderQuantity: parseInt(mappingFormData.minimumOrderQuantity) || 1,
        status: 'ACTIVE'
      };

      await supplierProductApi.addMapping(viewingSupplier.id, payload);
      setSuccessMsg('Product mapped to supplier successfully.');
      setIsAddMappingOpen(false);

      // Refresh mapped products for this supplier
      const updatedList = await supplierProductApi.getBySupplier(viewingSupplier.id);
      setSupplierProducts(updatedList || []);
    } catch (err) {
      setError(err.message || 'Failed to map product to supplier.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveProductMapping = async (productId) => {
    if (!viewingSupplier) return;
    if (!window.confirm('Remove this product mapping from supplier?')) return;

    try {
      setSubmitting(true);
      await supplierProductApi.deleteMapping(viewingSupplier.id, productId);
      setSuccessMsg('Product removed from supplier.');
      const updatedList = await supplierProductApi.getBySupplier(viewingSupplier.id);
      setSupplierProducts(updatedList || []);
    } catch (err) {
      setError(err.message || 'Failed to remove product mapping.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.phone && s.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-subtitle">Manage vendor directory, contact details, product mappings, and purchase orders</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} /> Add Supplier
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
            placeholder="Search by Supplier Name, Email, Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="card">
        <div className="card-body no-padding">
          {loading ? (
            <LoadingSpinner message="Fetching suppliers..." />
          ) : filteredSuppliers.length === 0 ? (
            <EmptyState
              title="No suppliers found"
              message="No suppliers match your search query."
              actionLabel="Add Supplier"
              onAction={handleOpenCreate}
            />
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Supplier Name</th>
                    <th>Email Address</th>
                    <th>Phone Number</th>
                    <th>Physical Address</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((s) => (
                    <tr key={s.id}>
                      <td>#{s.id}</td>
                      <td style={{ fontWeight: '600' }}>{s.name}</td>
                      <td>{s.email || '-'}</td>
                      <td>{s.phone || '-'}</td>
                      <td>{s.address || '-'}</td>
                      <td>
                        <Badge 
                          type={s.status === 'ACTIVE' ? 'ok' : 'cancelled'} 
                          text={s.status || 'ACTIVE'} 
                        />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            className="btn btn-secondary btn-icon"
                            title="View Details & Products"
                            onClick={() => handleOpenView(s)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn btn-secondary btn-icon"
                            title="Edit Supplier"
                            onClick={() => handleOpenEdit(s)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="btn btn-secondary btn-icon"
                            title="Delete Supplier"
                            style={{ color: 'var(--danger)' }}
                            onClick={() => setDeletingSupplier(s)}
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

      {/* Create / Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingSupplier ? `Edit Supplier #${editingSupplier.id}` : 'Add New Supplier'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">Supplier / Company Name *</label>
            <input
              type="text"
              className="form-control"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. ABC Electronics Ltd"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@abc.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Status *</label>
              <select
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Physical Address</label>
            <textarea
              className="form-control"
              rows="3"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="100 Logistics Way, Industrial Area, Sector 5"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingSupplier ? 'Update Supplier' : 'Add Supplier'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal with Mapped Products & PO History */}
      <Modal
        isOpen={!!viewingSupplier}
        onClose={() => setViewingSupplier(null)}
        title={`Supplier Profile: ${viewingSupplier?.name}`}
        size="large"
      >
        {viewingSupplier && (
          <div>
            <div className="grid-two-columns" style={{ marginBottom: '20px', background: 'var(--bg-app)', padding: '16px', borderRadius: '6px' }}>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Supplier Info:</p>
                <p style={{ fontWeight: '600', fontSize: '16px' }}>{viewingSupplier.name}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Email: {viewingSupplier.email || 'N/A'}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Phone: {viewingSupplier.phone || 'N/A'}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Status & Address:</p>
                <p><Badge type={viewingSupplier.status === 'ACTIVE' ? 'ok' : 'cancelled'} text={viewingSupplier.status || 'ACTIVE'} /></p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Address: {viewingSupplier.address || 'N/A'}</p>
              </div>
            </div>

            {/* Products Supplied Section */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={18} className="text-terracotta" /> Products Supplied ({supplierProducts.length})
                </h4>
                <button className="btn btn-primary btn-sm" onClick={handleOpenAddMapping}>
                  <PlusCircle size={14} /> Map Product to Supplier
                </button>
              </div>

              {loadingDetails ? (
                <LoadingSpinner message="Loading mapped products..." />
              ) : supplierProducts.length === 0 ? (
                <p style={{ padding: '16px', background: 'var(--bg-app)', borderRadius: '6px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  No products currently mapped to this supplier. Click "Map Product to Supplier" above.
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table" style={{ border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>SKU</th>
                        <th>Supplier Price (₹)</th>
                        <th>Lead Time</th>
                        <th>Min Order Qty</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplierProducts.map(sp => (
                        <tr key={sp.id}>
                          <td style={{ fontWeight: '600' }}>{sp.product?.name}</td>
                          <td><code>{sp.product?.sku}</code></td>
                          <td style={{ fontWeight: '700', color: 'var(--primary)' }}>
                            {formatCurrency(sp.supplierPrice)}
                          </td>
                          <td>{sp.leadTimeDays} days</td>
                          <td>{sp.minimumOrderQuantity} units</td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="btn btn-secondary btn-icon"
                              title="Remove Product Mapping"
                              style={{ color: 'var(--danger)' }}
                              onClick={() => handleRemoveProductMapping(sp.product?.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Purchase Orders History */}
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={18} className="text-amber" /> Purchase Order History ({supplierPos.length})
              </h4>
              {supplierPos.length === 0 ? (
                <p style={{ padding: '16px', background: 'var(--bg-app)', borderRadius: '6px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  No purchase orders placed with this supplier yet.
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table" style={{ border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                    <thead>
                      <tr>
                        <th>PO Number</th>
                        <th>Order Date</th>
                        <th>Status</th>
                        <th>Total Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplierPos.map(po => (
                        <tr key={po.id}>
                          <td><code>{po.purchaseOrderNumber}</code></td>
                          <td>{po.orderDate ? new Date(po.orderDate).toLocaleDateString('en-IN') : 'N/A'}</td>
                          <td><Badge type={po.status} text={po.status} /></td>
                          <td style={{ fontWeight: '600' }}>{formatCurrency(po.totalAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewingSupplier(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal to Map Product to Supplier */}
      <Modal
        isOpen={isAddMappingOpen}
        onClose={() => setIsAddMappingOpen(false)}
        title={`Map Product to ${viewingSupplier?.name}`}
      >
        <form onSubmit={handleSaveProductMapping}>
          <div className="form-group">
            <label className="form-label">Select Product *</label>
            <select
              className="form-control"
              required
              value={mappingFormData.productId}
              onChange={(e) => {
                const pId = e.target.value;
                const prod = productsList.find(p => p.id === parseInt(pId));
                setMappingFormData({
                  ...mappingFormData,
                  productId: pId,
                  supplierPrice: prod && prod.price ? prod.price.toString() : '500'
                });
              }}
            >
              {productsList.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Supplier Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                required
                value={mappingFormData.supplierPrice}
                onChange={(e) => setMappingFormData({ ...mappingFormData, supplierPrice: e.target.value })}
                placeholder="520.00"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lead Time (Days) *</label>
              <input
                type="number"
                min="0"
                className="form-control"
                required
                value={mappingFormData.leadTimeDays}
                onChange={(e) => setMappingFormData({ ...mappingFormData, leadTimeDays: e.target.value })}
                placeholder="5"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Minimum Order Quantity (Units) *</label>
            <input
              type="number"
              min="1"
              className="form-control"
              required
              value={mappingFormData.minimumOrderQuantity}
              onChange={(e) => setMappingFormData({ ...mappingFormData, minimumOrderQuantity: e.target.value })}
              placeholder="10"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddMappingOpen(false)} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Product Mapping'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deletingSupplier}
        onClose={() => setDeletingSupplier(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Supplier"
        message={`Are you sure you want to delete supplier "${deletingSupplier?.name}"?`}
        confirmText="Delete Supplier"
        loading={submitting}
      />
    </div>
  );
}
