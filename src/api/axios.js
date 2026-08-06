import axios from "axios";

const api = axios.create({
    baseURL: "https://pointofsale-sk8k.onrender.com",
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
    },
});

export const AUTH_ENDPOINTS = {
    csrf: "/api/sanctum/csrf-cookie",
    login: "/api/login",
    logout: "/api/logout",
    user: "/api/user",
};

export default api;