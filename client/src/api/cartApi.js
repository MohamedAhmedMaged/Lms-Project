import API from './axios';

export const cartApi = {
  getCart: () => API.get('/cart'),
  addItem: (courseId) => API.post(`/cart/add/${courseId}`),
  removeItem: (courseId) => API.delete(`/cart/remove/${courseId}`),
  clearCart: () => API.delete('/cart/clear'),
  applyCoupon: (code) => API.post('/cart/coupon', { code }),
};
