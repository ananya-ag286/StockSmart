import React, { useState, useEffect } from 'react';
import { locationApi } from '../api';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import { Plus, Search, Edit2, Trash2, Eye, MapPin, Building, Store } from 'lucide-react';

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [deletingLocation, setDeletingLocation] = useState(null);
  const [viewingLocation, setViewingLocation] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'STORE',
    address: ''
  });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await locationApi.getAll();
      setLocations(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load location records.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingLocation(null);
    setFormData({ name: '', type: 'STORE', address: '' });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (loc) => {
    setEditingLocation(loc);
    setFormData({
      name: loc.name || '',
      type: loc.type || 'STORE',
      address: loc.address || ''
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.type) {
      setError('Location name and type are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      if (editingLocation) {
        await locationApi.update(editingLocation.id, formData);
        setSuccessMsg('Location updated successfully.');
      } else {
        await locationApi.create(formData);
        setSuccessMsg('Location created successfully.');
      }
      setIsFormOpen(false);
      loadLocations();
    } catch (err) {
      setError(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingLocation) return;
    try {
      setSubmitting(true);
      await locationApi.delete(deletingLocation.id);
      setSuccessMsg('Location deleted successfully.');
      setDeletingLocation(null);
      loadLocations();
    } catch (err) {
      setError(err.message || 'Failed to delete location.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLocations = locations.filter(l => {
    const matchesSearch = 
      (l.name && l.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.address && l.address.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = !typeFilter || l.type === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-subtitle">Manage store fronts, distribution warehouses, and addresses</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} /> Add Location
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
            placeholder="Search by Location Name or Address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ width: '180px' }}
        >
          <option value="">All Types</option>
          <option value="STORE">STORE</option>
          <option value="WAREHOUSE">WAREHOUSE</option>
        </select>
      </div>

      {/* Locations Table */}
      <div className="card">
        <div className="card-body no-padding">
          {loading ? (
            <LoadingSpinner message="Fetching location directory..." />
          ) : filteredLocations.length === 0 ? (
            <EmptyState
              title="No locations found"
              message="No location records match your query."
              actionLabel="Add Location"
              onAction={handleOpenCreate}
            />
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Location Name</th>
                    <th>Facility Type</th>
                    <th>Address</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLocations.map((loc) => (
                    <tr key={loc.id}>
                      <td>#{loc.id}</td>
                      <td style={{ fontWeight: '600' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          {loc.type === 'STORE' ? <Store size={15} style={{ color: 'var(--info)' }} /> : <Building size={15} style={{ color: 'var(--warehouse)' }} />}
                          {loc.name}
                        </span>
                      </td>
                      <td>
                        <Badge type={loc.type} text={loc.type} />
                      </td>
                      <td>{loc.address || '-'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            className="btn btn-secondary btn-icon"
                            title="View Location Details"
                            onClick={() => setViewingLocation(loc)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn btn-secondary btn-icon"
                            title="Edit Location"
                            onClick={() => handleOpenEdit(loc)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="btn btn-secondary btn-icon"
                            title="Delete Location"
                            style={{ color: 'var(--danger)' }}
                            onClick={() => setDeletingLocation(loc)}
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
        title={editingLocation ? `Edit Location #${editingLocation.id}` : 'Add New Location'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">Location Name *</label>
            <input
              type="text"
              className="form-control"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Downtown Flagship Store"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Location Type *</label>
            <select
              className="form-control"
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="STORE">STORE</option>
              <option value="WAREHOUSE">WAREHOUSE</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              className="form-control"
              rows="3"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="500 Main Street, Suite 10, City, State"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingLocation ? 'Update Location' : 'Add Location'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        isOpen={!!viewingLocation}
        onClose={() => setViewingLocation(null)}
        title={`Location Details: ${viewingLocation?.name}`}
      >
        {viewingLocation && (
          <div>
            <table className="table" style={{ border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              <tbody>
                <tr>
                  <td style={{ fontWeight: '600', width: '140px' }}>Location ID</td>
                  <td>#{viewingLocation.id}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: '600' }}>Name</td>
                  <td>{viewingLocation.name}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: '600' }}>Type</td>
                  <td><Badge type={viewingLocation.type} text={viewingLocation.type} /></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: '600' }}>Address</td>
                  <td>{viewingLocation.address || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewingLocation(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingLocation}
        onClose={() => setDeletingLocation(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Location"
        message={`Are you sure you want to delete location "${deletingLocation?.name}" (${deletingLocation?.type})?`}
        confirmText="Delete Location"
        loading={submitting}
      />
    </div>
  );
}
