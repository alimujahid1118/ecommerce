import axios from "axios";
import { clearChatToken, getChatToken } from "./chatToken";

// Dedicated axios instance for the separately deployed chat service.
// Auth is a Bearer token (not cookies), so no withCredentials needed.
const chatApi = axios.create({
    baseURL: `${import.meta.env.VITE_CHAT_SERVER_URL}/api/chat`
});

chatApi.interceptors.request.use(async (config) => {
    const token = await getChatToken();
    config.headers.Authorization = `Bearer ${token}`;
    return config;
});

chatApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Chat token expired between cache refreshes — get a fresh one and retry once.
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                clearChatToken();
                const token = await getChatToken(true);
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return chatApi(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default chatApi;
