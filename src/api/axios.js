import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000",
    withCredentials: true,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
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
    csrf: "/api/sanctum/csrf-cookie",
    login: "/api/login",
    logout: "/api/logout",
    user: "/api/user",
};

export const getXsrfToken = () => {
    const token = document.cookie
        .split(";")
        .find((cookie) => cookie.trim().startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

    return token ? decodeURIComponent(token) : "";
};

export default api;
