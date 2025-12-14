// services/authService.js - ATUALIZADO
import api from './api';

export const authService = {
  async register(data) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(data) {
    const response = await api.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key]) formData.append(key, data[key]);
    });
    const response = await api.put('/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async changePassword(data) {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  },

  // 🔐 NOVOS MÉTODOS PARA AS FUNCIONALIDADES DO PERFIL
  async sendVerificationEmail() {
    const response = await api.post('/auth/verify-email/send');
    return response.data;
  },

  async getActiveSessions() {
    const response = await api.get('/auth/sessions');
    return response.data;
  },

  async revokeSession(sessionId) {
    const response = await api.delete(`/auth/sessions/${sessionId}`);
    return response.data;
  },

  async revokeAllSessions() {
    const response = await api.delete('/auth/sessions');
    return response.data;
  },

  async setup2FA() {
    const response = await api.post('/auth/2fa/setup');
    return response.data;
  },

  async confirm2FA(data) {
    const response = await api.post('/auth/2fa/confirm', data);
    return response.data;
  },

  async disable2FA() {
    const response = await api.delete('/auth/2fa');
    return response.data;
  },

  async getPreferences() {
    const response = await api.get('/auth/preferences');
    return response.data;
  },

  async updatePreferences(data) {
    const response = await api.put('/auth/preferences', data);
    return response.data;
  },

  async exportUserData() {
    const response = await api.get('/auth/export-data');
    return response.data;
  },

  async deleteAccount() {
    const response = await api.delete('/auth/account');
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};