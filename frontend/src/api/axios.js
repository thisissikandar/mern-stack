import axios from "axios";
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_REACT_BASE_URL,
  timeout: 1000,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const payload = refreshToken.split(".")[1];
        const refreshPlayload = atob(payload);
        const refreshTokenExp = JSON.parse(refreshPlayload);
        const currentTime = Math.floor(Date.now() / 1000);
        if (refreshTokenExp.exp < currentTime) {
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("accessToken");
          window.location.pathname = "/login";
        } else {
          const {accessToken, refreshToken} = await refreshAccessToken();
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          localStorage.setItem("refreshToken",refreshToken)
          localStorage.setItem("accessToken",accessToken)
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error("Error refreshing access token:", refreshError);
        if (refreshError.response && refreshError.response.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.pathname="/login"
        }
        throw refreshError;
      }
    }
    return Promise.reject(error);
  }
);

const refreshAccessToken = async () => {
  try {
    const response = await axiosInstance.post("/auth/refresh-token", {
      refreshToken: `${localStorage.getItem("refreshToken")}`,
    });
    const accessToken = response.data.message.accessToken;
    const refreshToken = response.data.message.refreshToken;
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw error;
  }
};
