import API from './axios';

export const authApi = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  logout: (refreshToken) => API.post('/auth/logout', { refreshToken }),
  getMe: () => API.get('/auth/me'),
  changePassword: (data) => API.patch('/auth/change-password', data),
};
