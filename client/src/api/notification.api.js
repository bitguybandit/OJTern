import api from './axios';

export const getNotificationsApi = async () => {
  const res = await api.get('/notifications');
  return res.data;
};

export const markNotificationReadApi = async (id) => {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
};

export const getUnreadCountApi = async () => {
  const res = await api.get('/notifications/unread-count');
  return res.data;
};
