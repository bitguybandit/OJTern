import api from './axios';

export const getStudentProfileApi = async () => {
  const res = await api.get('/students/profile');
  return res.data;
};

export const saveStudentProfileApi = async (profileData) => {
  const res = await api.post('/students/profile', profileData);
  return res.data;
};

export const getSkillsApi = async () => {
  const res = await api.get('/students/skills');
  return res.data;
};

export const getRecommendationsApi = async (profileId) => {
  const res = await api.get(`/recommendations/${profileId}`);
  return res.data;
};

export const getMyApplicationsApi = async () => {
  const res = await api.get('/applications/my');
  return res.data;
};

export const applyToPostingApi = async (formData) => {
  const res = await api.post('/applications', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};
