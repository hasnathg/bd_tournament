import { createContext, useContext, useMemo, useState } from "react";
import { apiPost } from "../api/http";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (payload) => {
    // payload: { email, password }
    const res = await apiPost("/auth/login", payload);
    setUser(res.user); // { id, name, email, role }
    return res.user;
  };

  const register = async (payload) => {
    // payload: { name, email, password, ...optional fields }
    const res = await apiPost("/auth/register", payload);
    return res.user;
  };

  const logout = () => setUser(null);

  const value = useMemo(
    () => ({ user, login, register, logout }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
