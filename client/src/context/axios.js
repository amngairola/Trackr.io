import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_BASE_URL || "http://localhost:3000/api/v1/users",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 (Unauthorized) and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // This line automatically sends the HttpOnly Refresh Token Cookie
        await api.post("/users/refresh-token");

        // If successful, retry the original failed request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, let the error pass (user will be redirected to login)
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
