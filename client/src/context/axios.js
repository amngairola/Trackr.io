import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});
// 1. Request Interceptor: Attach Access Token
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

// 2. Response Interceptor: Handle 401 Errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // --- FIX 2: PREVENT INFINITE LOOP START ---

    // A. If the error comes from checking the current user, DO NOT redirect.
    // This just means the user is a guest (not logged in yet).
    if (
      originalRequest.url?.includes("/get-user") ||
      originalRequest.url?.includes("/current-user")
    ) {
      return Promise.reject(error);
    }

    // B. If user is already on Login/Register page, DO NOT redirect.
    // If they type a wrong password, we don't want to refresh the page.
    if (
      window.location.pathname === "/login" ||
      window.location.pathname === "/register"
    ) {
      return Promise.reject(error);
    }

    // 3. Handle Token Refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      //VITE_BASE_URL
      try {
        // Call backend refresh endpoint
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/refresh-token`, // Use backticks ` ` and ${ }
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data.data;

        // Save new token
        localStorage.setItem("accessToken", accessToken);

        // Update header and retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, session is truly expired.
        console.error("Session expired:", refreshError);
        localStorage.removeItem("accessToken");

        // Final safety check: Only redirect if NOT on login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
