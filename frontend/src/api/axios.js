import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true
})

api.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config;
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
                const refreshResponse = await axios.get("/auth/update-refresh-token");
                const newAccessToken = refreshResponse.data.accessToken
                localStorage.setItem("accessToken", newAccessToken)

                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

                return api(originalRequest)
            } catch (refreshError) {

                localStorage.removeItem("accessToken")
                return Promise.reject(refreshError)
            }
        }
        return Promise.reject(error)
    }
)

export default api;