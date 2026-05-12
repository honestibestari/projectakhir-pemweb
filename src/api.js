const BASE = '/api';

function getToken() {
  return localStorage.getItem('meihua_token');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}

export const apiLogin = (email, password) =>
  fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  }).then(r => r.json());

export const apiRegister = (name, email, password) =>
  fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  }).then(r => r.json());

export const apiGetProducts = (cat = '') =>
  fetch(`${BASE}/products${cat ? `?cat=${cat}` : ''}`).then(r => r.json());

export const apiAddProduct = (data) =>
  fetch(`${BASE}/products`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data)
  }).then(r => r.json());

export const apiUpdateProduct = (id, data) =>
  fetch(`${BASE}/products/${id}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(data)
  }).then(r => r.json());

export const apiDeleteProduct = (id) =>
  fetch(`${BASE}/products/${id}`, {
    method: 'DELETE', headers: authHeaders()
  }).then(r => r.json());

export const apiGetCategories = () =>
  fetch(`${BASE}/categories`).then(r => r.json());

export const apiAddCategory = (data) =>
  fetch(`${BASE}/categories`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data)
  }).then(r => r.json());

export const apiUpdateCategory = (id, data) =>
  fetch(`${BASE}/categories/${id}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(data)
  }).then(r => r.json());

export const apiDeleteCategory = (id) =>
  fetch(`${BASE}/categories/${id}`, {
    method: 'DELETE', headers: authHeaders()
  }).then(r => r.json());

export const apiGetOrders = () =>
  fetch(`${BASE}/orders`, { headers: authHeaders() }).then(r => r.json());

export const apiUpdateOrderStatus = (id, status) =>
  fetch(`${BASE}/orders/${id}/status`, {
    method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status })
  }).then(r => r.json());