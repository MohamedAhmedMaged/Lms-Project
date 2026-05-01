import API from "./axios";

export const paymentApi = {
  createCheckout: (data) => API.post("/payments/checkout", data),
  verifyPayment: (sessionId) =>
    API.post("/payments/verify", { session_id: sessionId }),
  getHistory: () => API.get("/payments/history"),
  getById: (id) => API.get(`/payments/${id}`),
  refund: (id, data) => API.post(`/payments/${id}/refund`, data),
};
