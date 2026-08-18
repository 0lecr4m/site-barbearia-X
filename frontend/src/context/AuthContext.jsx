import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/services.js";
const AuthContext = createContext(null),
  KEY = "projetox_token";
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(KEY);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);
  const save = (data) => {
    localStorage.setItem(KEY, data.token);
    setToken(data.token);
    setUser(data.user);
  };
  const logout = () => {
    localStorage.removeItem(KEY);
    setToken(null);
    setUser(null);
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login: async (v) => save(await authApi.login(v)),
        register: async (v) => save(await authApi.register(v)),
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
