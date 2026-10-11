import api from './axios';

export const getUsersApi = async () => {
  const res = await api.get('/admin/users');
  return res.data;
};

export const createUserApi = async (userData) => {
  const res = await api.post('/admin/users', userData);
  return res.data;
};

export const updateUserApi = async (id, userData) => {
  const res = await api.patch(`/admin/users/${id}`, userData);
  return res.data;
};

export const getAuditLogsApi = async () => {
  const res = await api.get('/admin/audit-logs');
  return res.data;
};
