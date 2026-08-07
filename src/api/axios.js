import axios from "axios";

const api = axios.create({
    baseURL: "https://pointofsale-1.onrender.com",
    withCredentials: false,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("pos_access_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export const AUTH_ENDPOINTS = {
    csrf: "/sanctum/csrf-cookie",
    login: "/api/login",
    logout: "/api/logout",
    user: "/api/user",
};

export default api;
