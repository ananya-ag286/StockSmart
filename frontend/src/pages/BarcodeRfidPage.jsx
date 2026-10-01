import React, { useState, useEffect } from 'react';
import { productApi } from '../api';
import { formatCurrency } from '../utils/formatters';
import Alert from '../components/common/Alert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { QrCode, Radio, Search, CheckCircle, Package } from 'lucide-react';

export default function BarcodeRfidPage() {
  const [activeTab, setActiveTab] = useState('barcode');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Search input states
  const [barcodeInput, setBarcodeInput] = useState('');
  const [rfidInput, setRfidInput] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [foundProduct, setFoundProduct] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Assignment states
  const [selectedProductId, setSelectedProductId] = useState('');
  const [newBarcode, setNewBarcode] = useState('');
  const [newRfid, setNewRfid] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await productApi.getAll();
      setProducts(data || []);
      if (data && data.length > 0) {
        setSelectedProductId(data[0].id);
        setNewBarcode(data[0].barcode || '');
        setNewRfid(data[0].rfidTag || '');
      }
    } catch {
      // ignore silent error on catalog fetch
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleProductSelectChange = (id) => {
    setSelectedProductId(id);
    const prod = products.find(p => p.id === parseInt(id));
    if (prod) {
      setNewBarcode(prod.barcode || '');
      setNewRfid(prod.rfidTag || '');
    }
  };

  const handleBarcodeLookup = async (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    try {
      setSearchLoading(true);
      setSearchError(null);
      setFoundProduct(null);
      const prod = await productApi.getByBarcode(barcodeInput.trim());
      setFoundProduct(prod);
    } catch (err) {
      setSearchError(err.message || `No product found with barcode "${barcodeInput}"`);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRfidLookup = async (e) => {
    e.preventDefault();
    if (!rfidInput.trim()) return;

    try {
      setSearchLoading(true);
      setSearchError(null);
      setFoundProduct(null);
      const prod = await productApi.getByRfid(rfidInput.trim());
      setFoundProduct(prod);
    } catch (err) {
      setSearchError(err.message || `No product found with RFID tag "${rfidInput}"`);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSaveTags = async (e) => {
    e.preventDefault();
    if (!selectedProductId) return;

    try {
      setAssignLoading(true);
      setSearchError(null);
      setSuccessMsg(null);

      if (newBarcode.trim()) {
        await productApi.updateBarcode(selectedProductId, newBarcode.trim());
      }
      if (newRfid.trim()) {
        await productApi.updateRfid(selectedProductId, newRfid.trim());
      }

      setSuccessMsg('Barcode and RFID identifiers updated successfully for selected product.');
      loadProducts();
    } catch (err) {
      setSearchError(err.message || 'Failed to update Barcode/RFID tags.');
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-subtitle">Product identification, barcode lookup, and RFID tag assignment</p>
        </div>
      </div>

      <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />
      <Alert type="error" message={searchError} onClose={() => setSearchError(null)} />

      {/* Sub-tabs Header */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <button
          className={`btn ${activeTab === 'barcode' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('barcode'); setFoundProduct(null); setSearchError(null); }}
          style={{ borderRadius: '6px 6px 0 0', borderBottom: 'none' }}
        >
          <QrCode size={18} /> Barcode Search
        </button>
        <button
          className={`btn ${activeTab === 'rfid' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('rfid'); setFoundProduct(null); setSearchError(null); }}
          style={{ borderRadius: '6px 6px 0 0', borderBottom: 'none' }}
        >
          <Radio size={18} /> RFID Tag Lookup
        </button>
        <button
          className={`btn ${activeTab === 'assign' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('assign'); setFoundProduct(null); setSearchError(null); }}
          style={{ borderRadius: '6px 6px 0 0', borderBottom: 'none' }}
        >
          Tag Assignment
        </button>
      </div>

      {/* TAB 1: Barcode Search */}
      {activeTab === 'barcode' && (
        <div style={{ maxWidth: '640px' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={20} color="var(--primary)" /> Barcode Lookup Interface
              </h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleBarcodeLookup}>
                <div className="form-group">
                  <label className="form-label">Scan or Enter Product Barcode</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 8901234567890"
                      required
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary" disabled={searchLoading}>
                      {searchLoading ? 'Scanning...' : 'Search Barcode'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RFID Lookup */}
      {activeTab === 'rfid' && (
        <div style={{ maxWidth: '640px' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={18} className="text-olive" /> RFID Tag Lookup Interface
              </h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleRfidLookup}>
                <div className="form-group">
                  <label className="form-label">Scan or Enter Product RFID Tag</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. RFID-99887766"
                      required
                      value={rfidInput}
                      onChange={(e) => setRfidInput(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary" disabled={searchLoading}>
                      {searchLoading ? 'Scanning...' : 'Lookup RFID'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Assign / Update Tags */}
      {activeTab === 'assign' && (
        <div style={{ maxWidth: '640px' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Assign Barcode & RFID Tag</h3>
            </div>
            <div className="card-body">
              {loadingProducts ? (
                <LoadingSpinner message="Loading product list..." />
              ) : (
                <form onSubmit={handleSaveTags}>
                  <div className="form-group">
                    <label className="form-label">Select Target Product *</label>
                    <select
                      className="form-control"
                      value={selectedProductId}
                      onChange={(e) => handleProductSelectChange(e.target.value)}
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Barcode Identifier</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Barcode"
                      value={newBarcode}
                      onChange={(e) => setNewBarcode(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">RFID Tag Identifier</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter RFID Tag"
                      value={newRfid}
                      onChange={(e) => setNewRfid(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={assignLoading}>
                    {assignLoading ? 'Saving...' : 'Save Barcode & RFID Identifiers'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lookup Result Display Card */}
      {foundProduct && (
        <div style={{ maxWidth: '640px', marginTop: '24px' }}>
          <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
            <div className="card-header" style={{ background: '#f0fdf4' }}>
              <h3 className="card-title" style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={20} /> Product Identified Successfully
              </h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{foundProduct.name}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Category: {foundProduct.category || 'N/A'}</p>
                </div>
              </div>

              <table className="table" style={{ border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: '600', width: '150px' }}>Product ID</td>
                    <td>#{foundProduct.id}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: '600' }}>SKU</td>
                    <td><code>{foundProduct.sku}</code></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: '600' }}>Selling Price</td>
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{formatCurrency(foundProduct.price)}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: '600' }}>Reorder Level</td>
                    <td>{foundProduct.reorderLevel ?? 'N/A'} units</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: '600' }}>Barcode</td>
                    <td><code>{foundProduct.barcode || 'Not assigned'}</code></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: '600' }}>RFID Tag</td>
                    <td><code>{foundProduct.rfidTag || 'Not assigned'}</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

