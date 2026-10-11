import api from './axios';

export const getCoordinatorApplicationsApi = async (status = '') => {
  const query = status ? `?status=${status}` : '';
  const res = await api.get(`/coordinator/applications${query}`);
  return res.data;
};

export const getApplicationDetailApi = async (id) => {
  const res = await api.get(`/coordinator/applications/${id}`);
  return res.data;
};

export const reviewApplicationApi = async (id, { action, comment }) => {
  const res = await api.patch(`/coordinator/applications/${id}`, { action, comment });
  return res.data;
};

export const getCompaniesQueueApi = async (status = '') => {
  const query = status ? `?status=${status}` : '';
  const res = await api.get(`/coordinator/companies${query}`);
  return res.data;
};

export const verifyCompanyApi = async (id, status) => {
  const res = await api.patch(`/coordinator/companies/${id}`, { status });
  return res.data;
};

export const getDashboardStatsApi = async () => {
  const res = await api.get('/coordinator/stats');
  return res.data;
};
