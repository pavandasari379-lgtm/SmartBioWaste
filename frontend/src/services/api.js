// Centralized API Service for SmartBioWaste AI
const API_URL = import.meta.env.VITE_API_URL || '';

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = 'API Request Failed';
    try {
      const data = await response.json();
      errorDetail = data.detail || data.message || JSON.stringify(data);
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(typeof errorDetail === 'object' ? JSON.stringify(errorDetail) : errorDetail);
  }
  if (response.status === 204) return null;
  return await response.json();
}

export const api = {
  // --- AUTH ---
  async login(email, password) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  async register(userData) {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // --- AI PREDICTION & QUALITY ---
  async checkImageQuality(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/api/image-quality`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData
    });
    return handleResponse(res);
  },

  async predictWaste(file, skipQualityCheck = false) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('skip_quality_check', skipQualityCheck);
    const res = await fetch(`${API_URL}/api/predict`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData
    });
    return handleResponse(res);
  },

  async getWastePrediction(horizon = 'next_7_days') {
    const res = await fetch(`${API_URL}/api/waste-prediction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ horizon })
    });
    return handleResponse(res);
  },

  // --- CATEGORIES & SAFETY ---
  async getCategories() {
    const res = await fetch(`${API_URL}/api/waste/categories`);
    return handleResponse(res);
  },

  async getSafety(category) {
    const res = await fetch(`${API_URL}/api/safety/${category}`);
    return handleResponse(res);
  },

  // --- SCANS & HISTORY ---
  async getScans(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/api/scans?${query}`);
    return handleResponse(res);
  },

  async deleteScan(scanId) {
    const res = await fetch(`${API_URL}/api/scans/${scanId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  getExportScansUrl() {
    return `${API_URL}/api/scans/export/csv`;
  },

  // --- ANALYTICS ---
  async getAnalyticsOverview() {
    const res = await fetch(`${API_URL}/api/analytics/overview`);
    return handleResponse(res);
  },

  async getCategoryAnalytics() {
    const res = await fetch(`${API_URL}/api/analytics/category`);
    return handleResponse(res);
  },

  async getBinAnalytics() {
    const res = await fetch(`${API_URL}/api/analytics/bin`);
    return handleResponse(res);
  },

  async getTrendAnalytics(days = 7) {
    const res = await fetch(`${API_URL}/api/analytics/trends?days=${days}`);
    return handleResponse(res);
  },

  // --- SMART COLLECTION & BINS ---
  async getBins() {
    const res = await fetch(`${API_URL}/api/bins`);
    return handleResponse(res);
  },

  async updateBin(binId, data) {
    const res = await fetch(`${API_URL}/api/bins/${binId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getCollections(statusFilter = '') {
    const query = statusFilter ? `?status_filter=${statusFilter}` : '';
    const res = await fetch(`${API_URL}/api/collections${query}`);
    return handleResponse(res);
  },

  async scheduleCollection(data) {
    const res = await fetch(`${API_URL}/api/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateCollection(id, data) {
    const res = await fetch(`${API_URL}/api/collections/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getCollectionSafetyChecklist() {
    const res = await fetch(`${API_URL}/api/collection/safety`);
    return handleResponse(res);
  },

  // --- INCIDENTS ---
  async getIncidents(statusFilter = '', priorityFilter = '') {
    const params = new URLSearchParams();
    if (statusFilter) params.append('status_filter', statusFilter);
    if (priorityFilter) params.append('priority_filter', priorityFilter);
    const res = await fetch(`${API_URL}/api/incidents?${params.toString()}`);
    return handleResponse(res);
  },

  async reportIncident(data) {
    const res = await fetch(`${API_URL}/api/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateIncident(id, data) {
    const res = await fetch(`${API_URL}/api/incidents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // --- KNOWLEDGE BASE ---
  async getKnowledge(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/api/knowledge?${query}`);
    return handleResponse(res);
  },

  async getKnowledgeArticle(id) {
    const res = await fetch(`${API_URL}/api/knowledge/${id}`);
    return handleResponse(res);
  },

  async createKnowledgeArticle(data) {
    const res = await fetch(`${API_URL}/api/knowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // --- VOICE ASSISTANT ---
  async sendVoiceQuery(query, language = 'en') {
    const res = await fetch(`${API_URL}/api/voice/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, language })
    });
    return handleResponse(res);
  },

  // --- NOTIFICATIONS ---
  async getNotifications() {
    const res = await fetch(`${API_URL}/api/notifications`);
    return handleResponse(res);
  },

  async markNotificationRead(id) {
    const res = await fetch(`${API_URL}/api/notifications/${id}/read`, {
      method: 'PUT'
    });
    return handleResponse(res);
  },

  // --- ADMIN ---
  async getAdminUsers() {
    const res = await fetch(`${API_URL}/api/admin/users`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async updateAdminUserRole(userId, role, isActive) {
    const res = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ role, is_active: isActive })
    });
    return handleResponse(res);
  },

  async getAdminRules() {
    const res = await fetch(`${API_URL}/api/admin/rules`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async updateAdminRule(category, data) {
    const res = await fetch(`${API_URL}/api/admin/rules/${category}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  }
};
