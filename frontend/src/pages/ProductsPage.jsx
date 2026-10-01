import React, { useState, useEffect } from 'react';
import { productApi, supplierProductApi } from '../api';
import { formatCurrency } from '../utils/formatters';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import { Plus, Search, Edit2, Trash2, Eye, Truck } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [productSuppliers, setProductSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    reorderLevel: '',
    barcode: '',
    rfidTag: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productApi.getAll();
      setProducts(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenViewDetails = async (product) => {
    setViewingProduct(product);
    setProductSuppliers([]);
    try {
      setLoadingSuppliers(true);
      const suppliersData = await supplierProductApi.getByProduct(product.id);
      setProductSuppliers(suppliersData || []);
    } catch (err) {
      console.error('Failed to load suppliers for product', err);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      category: 'Electronics',
      price: '',
      reorderLevel: '10',
      barcode: '',
      rfidTag: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      sku: product.sku || '',
      category: product.category || '',
      price: product.price ?? '',
      reorderLevel: product.reorderLevel ?? '',
      barcode: product.barcode || '',
      rfidTag: product.rfidTag || ''
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) {
      setError('Name and SKU are required fields.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : 0,
        reorderLevel: formData.reorderLevel ? parseInt(formData.reorderLevel) : 0,
        barcode: formData.barcode ? formData.barcode.trim() : null,
        rfidTag: formData.rfidTag ? formData.rfidTag.trim() : null
      };

      if (editingProduct) {
        await productApi.update(editingProduct.id, payload);
        setSuccessMsg('Product updated successfully.');
      } else {
        await productApi.create(payload);
        setSuccessMsg('Product created successfully.');
      }

      setIsFormOpen(false);
      loadProducts();
    } catch (err) {
      setError(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    try {
      setSubmitting(true);
      await productApi.delete(deletingProduct.id);
      setSuccessMsg('Product deleted successfully.');
      setDeletingProduct(null);
      loadProducts();
    } catch (err) {
      setError(err.message || 'Failed to delete product.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter products
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.rfidTag && p.rfidTag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-subtitle">Manage catalog items, pricing, SKUs, and Barcode/RFID tags</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} /> Add Product
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
            placeholder="Search by Name, SKU, Barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            className="form-control"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ width: '180px' }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="card-body no-padding">
          {loading ? (
            <LoadingSpinner message="Fetching products catalog..." />
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              title="No products found"
              message="No product matches your filter criteria or catalog is empty."
              actionLabel="Add Product"
              onAction={handleOpenCreate}
            />
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product Name</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Selling Price (₹)</th>
                    <th>Reorder Level</th>
                    <th>Barcode</th>
                    <th>RFID Tag</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td>#{p.id}</td>
                      <td style={{ fontWeight: '600' }}>{p.name}</td>
                      <td><code>{p.sku}</code></td>
                      <td>{p.category || '-'}</td>
                      <td style={{ fontWeight: '500' }}>{formatCurrency(p.price)}</td>
                      <td>{p.reorderLevel ?? '-'}</td>
                      <td style={{ fontSize: '12px', color: p.barcode ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {p.barcode || 'Unassigned'}
                      </td>
                      <td style={{ fontSize: '12px', color: p.rfidTag ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {p.rfidTag || 'Unassigned'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            className="btn btn-secondary btn-icon"
                            title="View Details & Suppliers"
                            onClick={() => handleOpenViewDetails(p)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn btn-secondary btn-icon"
                            title="Edit Product"
                            onClick={() => handleOpenEdit(p)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="btn btn-secondary btn-icon"
                            title="Delete Product"
                            style={{ color: 'var(--danger)' }}
                            onClick={() => setDeletingProduct(p)}
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
        title={editingProduct ? `Edit Product #${editingProduct.id}` : 'Create New Product'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              className="form-control"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Wireless Mouse M185"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">SKU *</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g. ELEC-MOU-001"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-control"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Electronics, Apparel..."
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Selling Price (₹)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="599.00"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reorder Level (Min Stock)</label>
              <input
                type="number"
                className="form-control"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                placeholder="10"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Barcode Identifier</label>
              <input
                type="text"
                className="form-control"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="e.g. 8901234567890"
              />
            </div>

            <div className="form-group">
              <label className="form-label">RFID Tag Identifier</label>
              <input
                type="text"
                className="form-control"
                value={formData.rfidTag}
                onChange={(e) => setFormData({ ...formData, rfidTag: e.target.value })}
                placeholder="e.g. RFID-99887766"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail & Suppliers Modal */}
      <Modal
        isOpen={!!viewingProduct}
        onClose={() => setViewingProduct(null)}
        title={`Product Details: ${viewingProduct?.name || ''}`}
        size="large"
      >
        {viewingProduct && (
          <div>
            <table className="table" style={{ border: '1px solid var(--border-color)', borderRadius: '6px', marginBottom: '20px' }}>
              <tbody>
                <tr>
                  <td style={{ fontWeight: '600', width: '140px' }}>Product ID</td>
                  <td>#{viewingProduct.id}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: '600' }}>Name</td>
                  <td>{viewingProduct.name}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: '600' }}>SKU</td>
                  <td><code>{viewingProduct.sku}</code></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: '600' }}>Category</td>
                  <td>{viewingProduct.category || 'N/A'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: '600' }}>Selling Price</td>
                  <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{formatCurrency(viewingProduct.price)}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: '600' }}>Reorder Level</td>
                  <td>{viewingProduct.reorderLevel ?? 'N/A'} units</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: '600' }}>Barcode</td>
                  <td>{viewingProduct.barcode || 'None'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: '600' }}>RFID Tag</td>
                  <td>{viewingProduct.rfidTag || 'None'}</td>
                </tr>
              </tbody>
            </table>

            {/* Mapped Suppliers Section */}
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={16} className="text-terracotta" />
                Suppliers Offering This Product
              </h4>

              {loadingSuppliers ? (
                <LoadingSpinner message="Fetching mapped suppliers..." />
              ) : productSuppliers.length === 0 ? (
                <p style={{ padding: '16px', background: 'var(--bg-app)', borderRadius: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  No suppliers are currently mapped to this product.
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Supplier</th>
                        <th>Supplier Price</th>
                        <th>Lead Time</th>
                        <th>Min Order Qty</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productSuppliers.map((sp) => (
                        <tr key={sp.id}>
                          <td style={{ fontWeight: '600' }}>{sp.supplier?.name}</td>
                          <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{formatCurrency(sp.supplierPrice)}</td>
                          <td>{sp.leadTimeDays} days</td>
                          <td>{sp.minimumOrderQuantity} units</td>
                          <td>
                            <Badge type={sp.status || 'ACTIVE'} text={sp.status || 'ACTIVE'} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ marginTop: '24px' }}>
              <button className="btn btn-secondary" onClick={() => setViewingProduct(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Delete Product"
        message={`Are you sure you want to delete product "${deletingProduct?.name}" (SKU: ${deletingProduct?.sku})? This action cannot be undone.`}
        confirmText="Delete Product"
        loading={submitting}
      />
    </div>
  );
}

