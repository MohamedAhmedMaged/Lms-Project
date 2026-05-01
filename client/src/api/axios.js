import axios from "axios";

const API = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshTokenPromise = null;

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!refreshTokenPromise) {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          return Promise.reject(error);
        }

        refreshTokenPromise = axios.post("/api/v1/auth/refresh-token", { refreshToken })
          .then((res) => {
            const { accessToken, refreshToken: newRefresh } = res.data.data;
            localStorage.setItem("accessToken", accessToken);
            if (newRefresh) localStorage.setItem("refreshToken", newRefresh);
            return accessToken;
          })
          .catch(() => {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            return Promise.reject(error);
          })
          .finally(() => {
            refreshTokenPromise = null;
          });
      }

      try {
        const newToken = await refreshTokenPromise;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return API(originalRequest);
      } catch {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default API;
