import axios from "axios";

const api = axios.create({
    baseURL:
        //'https://ecommerce-backend-seven-ashy.vercel.app/api',
        'http://localhost:8080/api',
    withCredentials: true
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes("/auth/update-refresh-token")
        ) {
            originalRequest._retry = true;

            try {
                await api.get("/auth/update-refresh-token");

                return api(originalRequest)
            } catch (refreshError) {
                return Promise.reject(refreshError)
            }
        }
        return Promise.reject(error)
    }
)

export default api;