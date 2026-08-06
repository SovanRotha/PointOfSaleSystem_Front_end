import { createContext, useEffect, useState } from "react";
import api, { AUTH_ENDPOINTS } from "../api/axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

   const logout = async () => {
    try {
      await api.post(AUTH_ENDPOINTS.logout);
    } catch(error){
      console.log(error);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
