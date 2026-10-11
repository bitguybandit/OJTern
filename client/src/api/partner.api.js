import api from './axios';

export const getCompanyProfileApi = async () => {
  const res = await api.get('/companies/profile');
  return res.data;
};

export const saveCompanyProfileApi = async (data) => {
  const res = await api.post('/companies/profile', data);
  return res.data;
};

export const getMyPostingsApi = async () => {
  const res = await api.get('/postings?mine=true');
  return res.data;
};

export const getAllActivePostingsApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`/postings${query ? '?' + query : ''}`);
  return res.data;
};

export const getPostingDetailApi = async (id) => {
  const res = await api.get(`/postings/${id}`);
  return res.data;
};

export const createPostingApi = async (data) => {
  const res = await api.post('/postings', data);
  return res.data;
};

export const updatePostingApi = async (id, data) => {
  const res = await api.patch(`/postings/${id}`, data);
  return res.data;
};

export const getApprovedApplicantsApi = async (postingId) => {
  const res = await api.get(`/partner/postings/${postingId}/applicants`);
  return res.data;
};

export const decideApplicantApi = async (applicationId, decision) => {
  const res = await api.patch(`/partner/applications/${applicationId}`, { decision });
  return res.data;
};
