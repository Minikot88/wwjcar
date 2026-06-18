import { apiDownload, apiRequest, clearAdminToken, emitCmsUpdated, setAdminToken } from './apiClient.js';

function includeDraftsQuery(includeDrafts) {
  return includeDrafts ? { includeDrafts: true } : undefined;
}

async function mutate(request) {
  const result = await request();
  emitCmsUpdated();
  return result;
}

export const cmsService = {
  login: async (credentials) => {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: credentials
    });
    const token = result.accessToken || result.token;
    if (token) setAdminToken(token);
    return { token, user: result.user };
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST', auth: true });
    } finally {
      clearAdminToken();
    }
  },

  getDashboard: () => apiRequest('/dashboard', { auth: true }),
  getCurrentAdmin: () => apiRequest('/auth/me', { auth: true }),
  getAvailability: (query) => apiRequest('/availability', { query }),

  getCars: (includeDrafts = false) => apiRequest('/cars', { query: includeDraftsQuery(includeDrafts) }),
  getCar: (slug) => apiRequest(`/cars/${slug}`),
  createCar: (payload) => mutate(() => apiRequest('/cars', { method: 'POST', auth: true, body: payload })),
  updateCar: (id, payload) => mutate(() => apiRequest(`/cars/${id}`, { method: 'PUT', auth: true, body: payload })),
  deleteCar: (id) => mutate(() => apiRequest(`/cars/${id}`, { method: 'DELETE', auth: true })),
  uploadCarCover: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return mutate(() => apiRequest(`/cars/${id}/cover-image`, { method: 'POST', auth: true, body: formData }));
  },
  uploadCarGallery: (id, file, payload = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, value);
    });
    return mutate(() => apiRequest(`/cars/${id}/gallery-images`, { method: 'POST', auth: true, body: formData }));
  },
  replaceCarImage: (id, file, payload = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, value);
    });
    return mutate(() => apiRequest(`/car-images/${id}`, { method: 'PUT', auth: true, body: formData }));
  },
  reorderCarGallery: (id, images) => mutate(() => apiRequest(`/cars/${id}/gallery-images/order`, { method: 'PUT', auth: true, body: { images } })),
  deleteCarImage: (id) => mutate(() => apiRequest(`/car-images/${id}`, { method: 'DELETE', auth: true })),
  getBookings: (query = {}) => apiRequest('/bookings', { auth: true, query }),
  getBooking: (id) => apiRequest(`/bookings/${id}`, { auth: true }),
  createBooking: (payload) => mutate(() => apiRequest('/bookings', { method: 'POST', auth: true, body: payload })),
  updateBooking: (id, payload) => mutate(() => apiRequest(`/bookings/${id}`, { method: 'PUT', auth: true, body: payload })),
  deleteBooking: (id) => mutate(() => apiRequest(`/bookings/${id}`, { method: 'DELETE', auth: true })),
  markBookingReturned: (id) => mutate(() => apiRequest(`/bookings/${id}/returned`, { method: 'POST', auth: true })),
  markBookingCancelled: (id) => mutate(() => apiRequest(`/bookings/${id}/cancelled`, { method: 'POST', auth: true })),
  getVehicleCalendar: (id, query = {}) => apiRequest(`/vehicles/${id}/calendar`, { query }),
  getMaintenanceRecords: (query = {}) => apiRequest('/maintenance', { auth: true, query }),
  getMaintenanceRecord: (id) => apiRequest(`/maintenance/${id}`, { auth: true }),
  createMaintenanceRecord: (payload) => mutate(() => apiRequest('/maintenance', { method: 'POST', auth: true, body: payload })),
  updateMaintenanceRecord: (id, payload) => mutate(() => apiRequest(`/maintenance/${id}`, { method: 'PUT', auth: true, body: payload })),
  deleteMaintenanceRecord: (id) => mutate(() => apiRequest(`/maintenance/${id}`, { method: 'DELETE', auth: true })),
  getBusinessReport: () => apiRequest('/business/reports/summary', { auth: true }),
  getCustomerSummary: () => apiRequest('/business/customers/summary', { auth: true }),
  getCustomers: (query = {}) => apiRequest('/business/customers', { auth: true, query }),
  getCustomer: (id) => apiRequest(`/business/customers/${id}`, { auth: true }),
  createCustomer: (payload) => mutate(() => apiRequest('/business/customers', { method: 'POST', auth: true, body: payload })),
  updateCustomer: (id, payload) => mutate(() => apiRequest(`/business/customers/${id}`, { method: 'PUT', auth: true, body: payload })),
  deleteCustomer: (id) => mutate(() => apiRequest(`/business/customers/${id}`, { method: 'DELETE', auth: true })),
  getCustomerNotes: (id) => apiRequest(`/business/customers/${id}/notes`, { auth: true }),
  getCustomerHistory: (id) => apiRequest(`/business/customers/${id}/history`, { auth: true }),
  createCustomerNote: (id, payload) => mutate(() => apiRequest(`/business/customers/${id}/notes`, { method: 'POST', auth: true, body: payload })),
  getContracts: (query = {}) => apiRequest('/business/contracts', { auth: true, query }),
  getContract: (id) => apiRequest(`/business/contracts/${id}`, { auth: true }),
  createContract: (payload) => mutate(() => apiRequest('/business/contracts', { method: 'POST', auth: true, body: payload })),
  updateContract: (id, payload) => mutate(() => apiRequest(`/business/contracts/${id}`, { method: 'PUT', auth: true, body: payload })),
  deleteContract: (id) => mutate(() => apiRequest(`/business/contracts/${id}`, { method: 'DELETE', auth: true })),
  createContractAttachment: (id, payload) => mutate(() => apiRequest(`/business/contracts/${id}/attachments`, { method: 'POST', auth: true, body: payload })),
  getExpenseSummary: () => apiRequest('/business/expenses/summary', { auth: true }),
  getExpenses: (query = {}) => apiRequest('/business/expenses', { auth: true, query }),
  getExpense: (id) => apiRequest(`/business/expenses/${id}`, { auth: true }),
  createExpense: (payload) => mutate(() => apiRequest('/business/expenses', { method: 'POST', auth: true, body: payload })),
  updateExpense: (id, payload) => mutate(() => apiRequest(`/business/expenses/${id}`, { method: 'PUT', auth: true, body: payload })),
  deleteExpense: (id) => mutate(() => apiRequest(`/business/expenses/${id}`, { method: 'DELETE', auth: true })),

  getFaqs: (includeDrafts = false) => apiRequest('/faqs', { query: includeDraftsQuery(includeDrafts) }),
  createFaq: (payload) => mutate(() => apiRequest('/faqs', { method: 'POST', auth: true, body: payload })),
  updateFaq: (id, payload) => mutate(() => apiRequest(`/faqs/${id}`, { method: 'PUT', auth: true, body: payload })),
  deleteFaq: (id) => mutate(() => apiRequest(`/faqs/${id}`, { method: 'DELETE', auth: true })),
  getFaqCategories: () => apiRequest('/faq-categories'),

  getSettings: () => apiRequest('/settings'),
  getAdminSettings: () => apiRequest('/settings', { auth: true }),
  updateSetting: (key, value) => mutate(() => apiRequest(`/settings/${key}`, { method: 'PUT', auth: true, body: { value } })),
  uploadSettingImage: (key, file, payload = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(payload).forEach(([fieldKey, fieldValue]) => {
      if (fieldValue !== undefined && fieldValue !== null) formData.append(fieldKey, fieldValue);
    });
    return mutate(() => apiRequest(`/settings/${key}/image`, { method: 'POST', auth: true, body: formData }));
  },

  getPages: (includeDrafts = false) => apiRequest('/pages', { query: includeDraftsQuery(includeDrafts) }),
  createPage: (payload) => mutate(() => apiRequest('/pages', { method: 'POST', auth: true, body: payload })),
  updatePage: (id, payload) => mutate(() => apiRequest(`/pages/${id}`, { method: 'PUT', auth: true, body: payload })),
  deletePage: (id) => mutate(() => apiRequest(`/pages/${id}`, { method: 'DELETE', auth: true })),
  uploadPageImage: (id, file, payload = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, value);
    });
    return mutate(() => apiRequest(`/pages/${id}/image`, { method: 'POST', auth: true, body: formData }));
  },

  getRentalConditions: () => apiRequest('/rental-conditions'),
  createRentalCondition: (payload) => mutate(() => apiRequest('/rental-conditions', { method: 'POST', auth: true, body: payload })),
  updateRentalCondition: (id, payload) => mutate(() => apiRequest(`/rental-conditions/${id}`, { method: 'PUT', auth: true, body: payload })),
  deleteRentalCondition: (id) => mutate(() => apiRequest(`/rental-conditions/${id}`, { method: 'DELETE', auth: true })),

  getReviews: (includeDrafts = false) => apiRequest('/reviews', { query: includeDraftsQuery(includeDrafts) }),
  createReview: (payload) => mutate(() => apiRequest('/reviews', { method: 'POST', auth: true, body: payload })),
  updateReview: (id, payload) => mutate(() => apiRequest(`/reviews/${id}`, { method: 'PUT', auth: true, body: payload })),
  uploadReviewImage: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return mutate(() => apiRequest(`/reviews/${id}/image`, { method: 'POST', auth: true, body: formData }));
  },
  deleteReview: (id) => mutate(() => apiRequest(`/reviews/${id}`, { method: 'DELETE', auth: true })),

  getUploads: () => apiRequest('/uploads', { auth: true }),
  uploadFile: (file, usageType = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('usageType', usageType);

    return mutate(() => apiRequest('/uploads', {
      method: 'POST',
      auth: true,
      body: formData
    }));
  },
  replaceUpload: (id, file, usageType = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('usageType', usageType);

    return mutate(() => apiRequest(`/uploads/${id}`, {
      method: 'PUT',
      auth: true,
      body: formData
    }));
  },
  deleteUpload: (id) => mutate(() => apiRequest(`/uploads/${id}`, { method: 'DELETE', auth: true })),

  getOperationsHealth: () => apiRequest('/operations/health', { auth: true }),
  getAuditLogs: () => apiRequest('/operations/audit-logs', { auth: true }),
  getBackups: () => apiRequest('/operations/backups', { auth: true }),
  createBackup: () => mutate(() => apiRequest('/operations/backups', { method: 'POST', auth: true })),
  downloadBackup: (backup) => apiDownload(`/operations/backups/${backup.id}/download`, backup.fileName),
  getAdminProfile: () => apiRequest('/operations/profile', { auth: true }),
  updateAdminProfile: (payload) => mutate(() => apiRequest('/operations/profile', { method: 'PUT', auth: true, body: payload })),
  changePassword: (payload) => apiRequest('/operations/password', { method: 'POST', auth: true, body: payload }),
  getSessions: () => apiRequest('/operations/sessions', { auth: true }),
  revokeSession: (id) => mutate(() => apiRequest(`/operations/sessions/${id}/revoke`, { method: 'POST', auth: true }))
};
