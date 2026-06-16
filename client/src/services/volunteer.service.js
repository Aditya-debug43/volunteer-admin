import api from './api';

export const volunteerService = {
  list: (params) => api.get('/volunteers', { params }).then((r) => r.data),
  getOne: (id) => api.get(`/volunteers/${id}`).then((r) => r.data),
  update: (id, payload) => api.put(`/volunteers/${id}`, payload).then((r) => r.data),
  changeStatus: (id, status, reason) => api.put(`/volunteers/${id}/status`, { status, reason }).then((r) => r.data),
  activity: (id) => api.get(`/volunteers/${id}/activity`).then((r) => r.data),
  bulkApprove: (ids) => api.post('/volunteers/bulk-approve', { ids }).then((r) => r.data),
};

export const adminService = {
  stats: () => api.get('/admin/stats').then((r) => r.data),
  pending: () => api.get('/admin/pending').then((r) => r.data),
  trend: (city) => api.get('/admin/registrations-trend', { params: { city } }).then((r) => r.data),
  broadcast: (payload) => api.post('/admin/send-email', payload).then((r) => r.data),
};

export const eventService = {
  list: (params) => api.get('/events', { params }).then((r) => r.data),
  getOne: (id) => api.get(`/events/${id}`).then((r) => r.data),
  create: (payload) => api.post('/events', payload).then((r) => r.data),
  register: (id) => api.post(`/events/${id}/register`).then((r) => r.data),
  cancel: (id) => api.delete(`/events/${id}/register`).then((r) => r.data),
};
