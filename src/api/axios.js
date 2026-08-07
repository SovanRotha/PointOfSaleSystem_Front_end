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
    login: "/login",        // Matches route in web group in api.php
    logout: "/logout",      // Matches /logout route
    user: "/user",          // Matches /user route
};

export default api;