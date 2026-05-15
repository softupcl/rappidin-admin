import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    if (token.startsWith('JWT ')) {
      config.headers.Authorization = token;
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

export const ordersService = {
  getAll: async (params?: { status?: string; date?: string }) => {
    const { data } = await api.get('/admin/orders', { params });
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get(`/admin/orders/${id}`);
    return data;
  },
  assignDelivery: async (orderId: number, deliveryId: number) => {
    const { data } = await api.put(`/admin/orders/${orderId}/assign`, { id_delivery: deliveryId });
    return data;
  },
  updateStatus: async (orderId: number, status: string) => {
    const { data } = await api.put(`/admin/orders/${orderId}/status`, { status });
    return data;
  },
};

export const deliveriesService = {
  getAll: async () => {
    const { data } = await api.get('/admin/deliveries');
    return data;
  },
  updateAvailability: async (id: number, isAvailable: boolean) => {
    const { data } = await api.put(`/admin/deliveries/${id}/availability`, { isAvailable });
    return data;
  },
};

export const productsService = {
  getAll: async () => {
    const { data } = await api.get('/admin/products');
    return data;
  },
  create: async (product: any) => {
    const { data } = await api.post('/admin/products', product);
    return data;
  },
  update: async (id: number, product: any) => {
    const { data } = await api.put(`/admin/products/${id}`, product);
    return data;
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/admin/products/${id}`);
    return data;
  },
};

export const categoriesService = {
  getAll: async () => {
    const { data } = await api.get('/admin/categories');
    return data;
  },
  create: async (category: any) => {
    const { data } = await api.post('/admin/categories', category);
    return data;
  },
  update: async (id: number, category: any) => {
    const { data } = await api.put(`/admin/categories/${id}`, category);
    return data;
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/admin/categories/${id}`);
    return data;
  },
};

export const usersService = {
  getAll: async () => {
    const { data } = await api.get('/admin/users');
    return data;
  },
  create: async (user: any) => {
    const { data } = await api.post('/admin/users', user);
    return data;
  },
  update: async (id: number, user: any) => {
    const { data } = await api.put(`/admin/users/${id}`, user);
    return data;
  },
  delete: async (id: number) => {
    const { data } = await api.delete(`/admin/users/${id}`);
    return data;
  },
  updateStatus: async (id: number, isActive: boolean) => {
    const { data } = await api.put('/admin/users/${id}/status', { isActive });
    return data;
  },
};

export const settingsService = {
  get: async () => {
    const { data } = await api.get('/admin/settings');
    return data;
  },
  update: async (settings: any) => {
    const { data } = await api.put('/admin/settings', settings);
    return data;
  },
};

export const dashboardService = {
  getStats: async () => {
    const { data } = await api.get('/admin/dashboard/stats');
    return data;
  },
};

export const storageService = {
  uploadImage: async (file: File, folder = 'categories') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    const { data } = await api.post('/storage/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};

export default api;