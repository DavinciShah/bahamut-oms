import apiClient from './apiClient';

const tenantService = {
  getCurrent: () => apiClient.get('/tenants/current'),
  update: (data) => apiClient.put('/tenants/current', data),
  getTeam: () => apiClient.get('/tenants/team'),
  inviteUser: (data) => apiClient.post('/tenants/team/invite', data),
  updateTeamMember: (id, data) => apiClient.put(`/tenants/team/${id}`, data),
  removeTeamMember: (id) => apiClient.delete(`/tenants/team/${id}`),
  getSettings: () => apiClient.get('/tenants/settings'),
  updateSettings: (data) => apiClient.put('/tenants/settings', data),
  getDomains: () => apiClient.get('/tenants/domains'),
  addDomain: (domain) => apiClient.post('/tenants/domains', { domain })
};

export default tenantService;
