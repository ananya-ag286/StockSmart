import React, { useState, useEffect } from 'react';
import { inventoryApi, productApi, locationApi } from '../api';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import { Plus, Search, Edit2, Trash2, Boxes } from 'lucide-react';

export default function InventoryPage() {
  const [inventories, setInventories] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingInv, setEditingInv] = useState(null);
  const [deletingInv, setDeletingInv] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Add Inventory Form
  const [addForm, setAddForm] = useState({
    productId: '',
    locationId: '',
    quantity: '50'
  });

  // Edit Quantity Form
  const [editQuantity, setEditQuantity] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [invData, prodData, locData] = await Promise.all([
        inventoryApi.getAll(),
        productApi.getAll(),
        locationApi.getAll()
      ]);
      setInventories(invData || []);
      setProducts(prodData || []);
      setLocations(locData || []);
    } catch (err) {
      setError(err.message || 'Failed to load inventory records.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setAddForm({
      productId: products.length > 0 ? products[0].id : '',
      locationId: locations.length > 0 ? locations[0].id : '',
      quantity: '50'
    });
    setIsAddOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.productId || !addForm.locationId) {
      setError('Product and Location selection are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await inventoryApi.create(
        addForm.productId,
        addForm.locationId,
        parseInt(addForm.quantity, 10) || 0
      );
      setSuccessMsg('Inventory record created successfully.');
      setIsAddOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to add inventory record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (inv) => {
    setEditingInv(inv);
    setEditQuantity(inv.quantity ?? 0);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingInv) return;

    try {
      setSubmitting(true);
      setError(null);
      await inventoryApi.update(editingInv.id, parseInt(editQuantity, 10) || 0);
      setSuccessMsg('Inventory quantity updated successfully.');
      setEditingInv(null);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to update quantity.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingInv) return;
    try {
      setSubmitting(true);
      await inventoryApi.delete(deletingInv.id);
      setSuccessMsg('Inventory record removed successfully.');
      setDeletingInv(null);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete inventory record.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredInventories = inventories.filter(inv => {
    const pName = inv.product?.name || '';
    const pSku = inv.product?.sku || '';
    const lName = inv.location?.name || '';

    const matchesSearch = 
      pName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation = !selectedLocation || inv.location?.id === parseInt(selectedLocation);

    return matchesSearch && matchesLocation;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-subtitle">Track and adjust stock quantities across stores and warehouses</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Add Stock Record
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
            placeholder="Search by Product Name, SKU, or Location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          style={{ width: '200px' }}
        >
          <option value="">All Locations</option>
          {locations.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.name} ({loc.type})</option>
          ))}
        </select>
      </div>

      {/* Inventory Table */}
      <div className="card">
        <div className="card-body no-padding">
          {loading ? (
            <LoadingSpinner message="Fetching stock records across locations..." />
          ) : filteredInventories.length === 0 ? (
            <EmptyState
              title="No inventory records"
              message="No stock entries matched your search or no records have been added."
              actionLabel="Add Stock Record"
              onAction={handleOpenAdd}
            />
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Record ID</th>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Location</th>
                    <th>Location Type</th>
                    <th>Quantity</th>
                    <th>Reorder Threshold</th>
                    <th>Stock Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventories.map((inv) => {
                    const product = inv.product || {};
                    const location = inv.location || {};
                    const isLow = product.reorderLevel != null && inv.quantity <= product.reorderLevel;

                    return (
                      <tr key={inv.id}>
                        <td>#{inv.id}</td>
                        <td style={{ fontWeight: '600' }}>{product.name || 'Unknown'}</td>
                        <td><code>{product.sku || 'N/A'}</code></td>
                        <td>{location.name || 'Unknown'}</td>
                        <td>
                          <Badge type={location.type} text={location.type} />
                        </td>
                        <td style={{ fontWeight: '700', fontSize: '15px', color: isLow ? '#dc2626' : 'var(--text-primary)' }}>
                          {inv.quantity} units
                        </td>
                        <td>{product.reorderLevel ?? '-'}</td>
                        <td>
                          {isLow ? (
                            <Badge type="warning" text="Low Stock" />
                          ) : (
                            <Badge type="ok" text="Sufficient" />
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              className="btn btn-secondary btn-icon"
                              title="Update Quantity"
                              onClick={() => handleOpenEdit(inv)}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="btn btn-secondary btn-icon"
                              title="Delete Record"
                              style={{ color: 'var(--danger)' }}
                              onClick={() => setDeletingInv(inv)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Stock Record Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Inventory Record"
      >
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label className="form-label">Select Product *</label>
            <select
              className="form-control"
              required
              value={addForm.productId}
              onChange={(e) => setAddForm({ ...addForm, productId: e.target.value })}
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select Location *</label>
            <select
              className="form-control"
              required
              value={addForm.locationId}
              onChange={(e) => setAddForm({ ...addForm, locationId: e.target.value })}
            >
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name} - [{l.type}]</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Quantity *</label>
            <input
              type="number"
              min="0"
              className="form-control"
              required
              value={addForm.quantity}
              onChange={(e) => setAddForm({ ...addForm, quantity: e.target.value })}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Inventory Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Quantity Modal */}
      <Modal
        isOpen={!!editingInv}
        onClose={() => setEditingInv(null)}
        title={`Update Stock Quantity - #${editingInv?.id}`}
      >
        {editingInv && (
          <form onSubmit={handleEditSubmit}>
            <div style={{ marginBottom: '16px', background: 'var(--bg-app)', padding: '12px', borderRadius: '6px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Product: <strong>{editingInv.product?.name}</strong></p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Location: <strong>{editingInv.location?.name} ({editingInv.location?.type})</strong></p>
            </div>

            <div className="form-group">
              <label className="form-label">New Stock Quantity *</label>
              <input
                type="number"
                min="0"
                className="form-control"
                required
                value={editQuantity}
                onChange={(e) => setEditQuantity(e.target.value)}
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setEditingInv(null)} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Updating...' : 'Save New Quantity'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingInv}
        onClose={() => setDeletingInv(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Inventory Record"
        message={`Are you sure you want to remove inventory for "${deletingInv?.product?.name}" at "${deletingInv?.location?.name}"?`}
        confirmText="Delete Record"
        loading={submitting}
      />
    </div>
  );
}
