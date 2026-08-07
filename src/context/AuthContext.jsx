import { createContext, useEffect, useState } from "react";
import api, { AUTH_ENDPOINTS } from "../api/axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch initial user state
  const fetchUser = async () => {
    try {
      const res = await api.get(AUTH_ENDPOINTS.user);
      const user = res.data.user ?? res.data;
      setUser(user);
      return user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Login handler with CSRF cookie initialization
  const login = async (credentials) => {
    // 1. Get Sanctum CSRF cookie FIRST
    await api.get(AUTH_ENDPOINTS.csrf);

    // 2. Perform login request
    const res = await api.post(AUTH_ENDPOINTS.login, credentials);

    // 3. Fetch logged-in user profile
    const loggedInUser = res.data.user ?? (await fetchUser());
    setUser(loggedInUser);

    return res.data;
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post(AUTH_ENDPOINTS.logout);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        fetchUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}