import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});

// 1. Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Optimization: Don't even try to refresh if checking user status
    if (
      originalRequest.url?.includes("/get-user") ||
      originalRequest.url?.includes("/current-user")
    ) {
      return Promise.reject(error);
    }

    // 3. Handle Token Refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data.data;
        localStorage.setItem("accessToken", accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Session expired or guest user:", refreshError);
        localStorage.removeItem("accessToken");

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
