const BASE_URL = '/api';

async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}`;
    try {
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        errorMessage = json.message || json.error || text || errorMessage;
      } catch {
        errorMessage = text || errorMessage;
      }
    } catch {}
    throw new Error(errorMessage);
  }
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return await response.text();
}

export const productApi = {
  getAll: () => fetch(`${BASE_URL}/products`).then(handleResponse),
  getById: (id) => fetch(`${BASE_URL}/products/${id}`).then(handleResponse),
  create: (data) => fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  update: (id, data) => fetch(`${BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  delete: (id) => fetch(`${BASE_URL}/products/${id}`, { method: 'DELETE' }).then(handleResponse),
  getByBarcode: (barcode) => fetch(`${BASE_URL}/products/barcode/${encodeURIComponent(barcode)}`).then(handleResponse),
  getByRfid: (rfidTag) => fetch(`${BASE_URL}/products/rfid/${encodeURIComponent(rfidTag)}`).then(handleResponse),
  updateBarcode: (id, barcode) => fetch(`${BASE_URL}/products/${id}/barcode?barcode=${encodeURIComponent(barcode)}`, { method: 'PUT' }).then(handleResponse),
  updateRfid: (id, rfidTag) => fetch(`${BASE_URL}/products/${id}/rfid?rfidTag=${encodeURIComponent(rfidTag)}`, { method: 'PUT' }).then(handleResponse),
};

export const supplierApi = {
  getAll: () => fetch(`${BASE_URL}/suppliers`).then(handleResponse),
  getById: (id) => fetch(`${BASE_URL}/suppliers/${id}`).then(handleResponse),
  create: (data) => fetch(`${BASE_URL}/suppliers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  update: (id, data) => fetch(`${BASE_URL}/suppliers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  delete: (id) => fetch(`${BASE_URL}/suppliers/${id}`, { method: 'DELETE' }).then(handleResponse),
};

export const locationApi = {
  getAll: () => fetch(`${BASE_URL}/locations`).then(handleResponse),
  getById: (id) => fetch(`${BASE_URL}/locations/${id}`).then(handleResponse),
  create: (data) => fetch(`${BASE_URL}/locations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  update: (id, data) => fetch(`${BASE_URL}/locations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  delete: (id) => fetch(`${BASE_URL}/locations/${id}`, { method: 'DELETE' }).then(handleResponse),
};

export const inventoryApi = {
  getAll: () => fetch(`${BASE_URL}/inventory`).then(handleResponse),
  getById: (id) => fetch(`${BASE_URL}/inventory/${id}`).then(handleResponse),
  create: (productId, locationId, quantity) => 
    fetch(`${BASE_URL}/inventory?productId=${productId}&locationId=${locationId}&quantity=${quantity}`, {
      method: 'POST'
    }).then(handleResponse),
  update: (id, quantity) => 
    fetch(`${BASE_URL}/inventory/${id}?quantity=${quantity}`, {
      method: 'PUT'
    }).then(handleResponse),
  delete: (id) => fetch(`${BASE_URL}/inventory/${id}`, { method: 'DELETE' }).then(handleResponse),
};

export const orderApi = {
  getAll: () => fetch(`${BASE_URL}/orders`).then(handleResponse),
  getById: (id) => fetch(`${BASE_URL}/orders/${id}`).then(handleResponse),
  create: (orderRequest) => fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderRequest)
  }).then(handleResponse),
  checkStock: (id) => fetch(`${BASE_URL}/orders/${id}/check-stock`).then(handleResponse),
  process: (id) => fetch(`${BASE_URL}/orders/${id}/process`, { method: 'POST' }).then(handleResponse),
  cancel: (id) => fetch(`${BASE_URL}/orders/${id}/cancel`, { method: 'POST' }).then(handleResponse),
  updateStatus: (id, status) => fetch(`${BASE_URL}/orders/${id}/status?status=${encodeURIComponent(status)}`, { method: 'PUT' }).then(handleResponse),
  delete: (id) => fetch(`${BASE_URL}/orders/${id}`, { method: 'DELETE' }).then(handleResponse),
};

export const reportApi = {
  getSummary: () => fetch(`${BASE_URL}/reports/summary`).then(handleResponse),
  getLowStock: () => fetch(`${BASE_URL}/reports/low-stock`).then(handleResponse),
  getByLocation: () => fetch(`${BASE_URL}/reports/by-location`).then(handleResponse),
};

export const supplierProductApi = {
  getBySupplier: (supplierId) => fetch(`${BASE_URL}/suppliers/${supplierId}/products`).then(handleResponse),
  getByProduct: (productId) => fetch(`${BASE_URL}/products/${productId}/suppliers`).then(handleResponse),
  addMapping: (supplierId, data) => fetch(`${BASE_URL}/suppliers/${supplierId}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateMapping: (supplierId, productId, data) => fetch(`${BASE_URL}/suppliers/${supplierId}/products/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteMapping: (supplierId, productId) => fetch(`${BASE_URL}/suppliers/${supplierId}/products/${productId}`, {
    method: 'DELETE'
  }).then(handleResponse),
};

export const purchaseOrderApi = {
  getAll: () => fetch(`${BASE_URL}/purchase-orders`).then(handleResponse),
  getById: (id) => fetch(`${BASE_URL}/purchase-orders/${id}`).then(handleResponse),
  getBySupplier: (supplierId) => fetch(`${BASE_URL}/purchase-orders/supplier/${supplierId}`).then(handleResponse),
  create: (data) => fetch(`${BASE_URL}/purchase-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  receive: (id, receiveData) => fetch(`${BASE_URL}/purchase-orders/${id}/receive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(receiveData || {})
  }).then(handleResponse),
  cancel: (id) => fetch(`${BASE_URL}/purchase-orders/${id}/cancel`, { method: 'POST' }).then(handleResponse),
};

