import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  forgotPassword: (data: any) => api.post('/auth/forgot-password', data),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
}

// User API
export const userAPI = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: any) => api.put('/users/me', data),
  updateAppearance: (data: any) => api.patch('/users/me/appearance', data),
  getUserByUsername: (username: string) => api.get(`/users/${username}/public`),
  deleteAccount: () => api.delete('/users/me'),
}

// Links API
export const linksAPI = {
  getLinks: () => api.get('/links'),
  createLink: (data: any) => api.post('/links', data),
  updateLink: (id: string, data: any) => api.put(`/links/${id}`, data),
  deleteLink: (id: string) => api.delete(`/links/${id}`),
  reorderLinks: (data: any) => api.patch('/links/reorder', data),
  getLinkAnalytics: (id: string, days?: number) => api.get(`/links/${id}/analytics`, { params: { days } }),
}

// Social Links API
export const socialLinksAPI = {
  getSocialLinks: () => api.get('/social-links'),
  createSocialLink: (data: any) => api.post('/social-links', data),
  updateSocialLink: (id: string, data: any) => api.put(`/social-links/${id}`, data),
  deleteSocialLink: (id: string) => api.delete(`/social-links/${id}`),
}

// Analytics API
export const analyticsAPI = {
  getOverview: (days?: number) => api.get('/analytics/overview', { params: { days } }),
  getChartData: (days?: number) => api.get('/analytics/chart', { params: { days } }),
  getReferrers: (days?: number) => api.get('/analytics/referrers', { params: { days } }),
  getLocations: (days?: number) => api.get('/analytics/locations', { params: { days } }),
  getDevices: (days?: number) => api.get('/analytics/devices', { params: { days } }),
  exportAnalytics: (days?: number) => api.get('/analytics/export', { params: { days } }),
  trackPageView: (username: string) => api.post('/analytics/track-view', { username }),
  trackLinkClick: (linkId: string, timeToClick?: number) => api.post('/analytics/track-click', { linkId, timeToClick }),
}

// Upload API
export const uploadAPI = {
  uploadFile: (file: File, type: string) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/upload/${type}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

// Collections API
export const collectionsAPI = {
  getCollections: () => api.get('/collections'),
  createCollection: (data: any) => api.post('/collections', data),
  updateCollection: (id: string, data: any) => api.put(`/collections/${id}`, data),
  deleteCollection: (id: string) => api.delete(`/collections/${id}`),
}

// Subscribers API
export const subscribersAPI = {
  getSubscribers: () => api.get('/subscribers'),
  createSubscriber: (data: any) => api.post('/subscribers', data),
  deleteSubscriber: (id: string) => api.delete(`/subscribers/${id}`),
  exportSubscribers: () => api.get('/subscribers/export'),
}
