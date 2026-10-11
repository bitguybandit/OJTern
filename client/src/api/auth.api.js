import api from './axios';

export const loginApi = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const signupApi = async ({ name, email, password, role, academicProgram }) => {
  const res = await api.post('/auth/signup', { name, email, password, role, academicProgram });
  return res.data;
};

export const getMeApi = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};
