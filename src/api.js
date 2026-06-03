const BASE = '/api';

function getToken() {
  return localStorage.getItem('meihua_token');
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

/**
 * Wrapper fetch dengan logging otomatis.
 * Melempar Error jika HTTP status >= 400.
 */
async function apiFetch(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${BASE}${url}`;
  console.log(`[MeiHua API] ${options.method || 'GET'} ${fullUrl}`);

  let res;
  try {
    res = await fetch(fullUrl, {...options,});
  } catch (networkErr) {
    console.error(`[MeiHua API] Network error on ${fullUrl}:`, networkErr);
    throw new Error(
      'Tidak dapat terhubung ke server. Pastikan:\n' +
      '1. Backend sudah berjalan (node server.js)\n' +
      '2. Proxy di package.json sudah diset ke port yang benar'
    );
  }

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  console.log(`[MeiHua API] ${res.status} response from ${fullUrl}:`, data);

  if (!res.ok) {
    const msg = data?.message || data?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

function extractToken(data) {
  return (
    data?.token ||
    data?.access_token ||
    data?.data?.token ||
    data?.data?.access_token ||
    null
  );
}

function extractUser(data) {
  return (
    data?.user ||
    data?.data?.user ||
    data?.data ||
    null
  );
}

export async function apiLogin(email, password) {
  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const token = extractToken(data);
    const user  = extractUser(data);

    if (!token) {
      console.error('[MeiHua API] Login response tidak mengandung token:', data);
      return { message: data?.message || 'Login gagal: token tidak ditemukan.' };
    }

    let normalizedUser;
    if (user && typeof user === 'object') {
      normalizedUser = {
        name: user.name || user.username || user.email || email.split('@')[0],
        role: user.role || 'user',
      };
    } else if (typeof user === 'string') {
      normalizedUser = { name: user, role: 'user' };
    } else {
      normalizedUser = { name: email.split('@')[0], role: 'user' };
    }

    console.log('[MeiHua API] Login sukses, user:', normalizedUser);
    return { token, user: normalizedUser };

  } catch (err) {
    console.error('[MeiHua API] Login error:', err);
    return { message: err.message };
  }
}

export async function apiRegister(name, email, password) {
  try {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const token = extractToken(data);
    const user  = extractUser(data);

    if (!token) {
      console.error('[MeiHua API] Register response tidak mengandung token:', data);
      return { message: data?.message || 'Registrasi gagal: token tidak ditemukan.' };
    }

    let normalizedUser;
    if (user && typeof user === 'object') {
      normalizedUser = {
        name: user.name || user.username || name,
        role: user.role || 'user',
      };
    } else if (typeof user === 'string') {
      normalizedUser = { name: user, role: 'user' };
    } else {
      normalizedUser = { name, role: 'user' };
    }

    console.log('[MeiHua API] Register sukses, user:', normalizedUser);
    return { token, user: normalizedUser };

  } catch (err) {
    console.error('[MeiHua API] Register error:', err);
    return { message: err.message };
  }
}

export async function apiGetProducts(cat = '') {
  try {
    const qs   = cat ? `?cat=${encodeURIComponent(cat)}` : '';
    const data = await apiFetch(`/products${qs}`);

    const list = Array.isArray(data) ? data : (data?.data ?? data?.products ?? []);
    console.log(`[MeiHua API] Loaded ${list.length} products`);
    return list;

  } catch (err) {
    console.error('[MeiHua API] getProducts error:', err);
    return [];
  }
}

export async function apiAddProduct(productData) {
  return apiFetch('/products', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(productData),
  });
}

export async function apiUpdateProduct(id, productData) {
  return apiFetch(`/products/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(productData),
  });
}

export async function apiDeleteProduct(id) {
  return apiFetch(`/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

export async function apiGetCategories() {
  try {
    const data = await apiFetch('/categories');

    const list = Array.isArray(data) ? data : (data?.data ?? data?.categories ?? []);
    console.log(`[MeiHua API] Loaded ${list.length} categories`);
    return list;

  } catch (err) {
    console.error('[MeiHua API] getCategories error:', err);
    return [];
  }
}

export async function apiAddCategory(categoryData) {
  return apiFetch('/categories', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(categoryData),
  });
}

export async function apiUpdateCategory(id, categoryData) {
  return apiFetch(`/categories/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(categoryData),
  });
}

export async function apiDeleteCategory(id) {
  return apiFetch(`/categories/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

export async function apiGetOrders() {
  try {
    const token = getToken();

    if (!token) {
      console.warn('Token tidak ditemukan');
      return [];
    }

    const data = await apiFetch('/orders', {
      headers: authHeaders(),
    });

    console.log('RAW ORDERS:', data);

    let orders = [];

    if (Array.isArray(data)) {
      orders = data;
    } else if (Array.isArray(data.orders)) {
      orders = data.orders;
    } else if (Array.isArray(data.data)) {
      orders = data.data;
    } else {
      orders = [];
    }

    const normalized = orders.map(order => ({
      id: String(order.id),
      customer: order.customer || '-',
      phone: order.phone || '-',
      address: order.address || '-',
      total: Number(order.total || 0),
      status: order.status || 'pending',
      date: order.date || '',
      items: Array.isArray(order.items) ? order.items : []
    }));

    console.log('NORMALIZED ORDERS:', normalized);

    return normalized;
  } catch (err) {
    console.error('getOrders error:', err);
    return [];
  }
}

export async function apiCreateOrder(orderData) {
  return apiFetch('/orders', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(orderData),
  });
}

export async function apiGetMyOrders() {
  try {
    const token = getToken();
    if (!token) return [];
    const data = await apiFetch('/orders', {
      headers: authHeaders(),
    });
    const list = Array.isArray(data) ? data : (data?.data ?? data?.orders ?? []);
    return list;
  } catch (err) {
    console.error('[MeiHua API] getMyOrders error:', err);
    return [];
  }
}

export async function apiUpdateOrderStatus(id, status) {
  return apiFetch(`/orders/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
}