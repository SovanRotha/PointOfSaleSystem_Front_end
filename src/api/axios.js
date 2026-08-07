import axios from "axios";

const api = axios.create({
    baseURL: "https://pointofsale-1.onrender.com",
    withCredentials: true,
    withXSRFToken: true, // Enables automatic parsing of XSRF-TOKEN cookie
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
    },
});

export const AUTH_ENDPOINTS = {
    csrf: "/sanctum/csrf-cookie",
    login: "/login",
    logout: "/api/logout",
    user: "/api/user",
};

export default api;
