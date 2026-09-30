import { createContext, useContext, useMemo, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("blocktrust_user") || "null"));

  async function login(values) {
    const { data } = await api.post("/auth/login", values);
    localStorage.setItem("blocktrust_token", data.token);
    localStorage.setItem("blocktrust_user", JSON.stringify(data.user));
    setUser(data.user);
  }

  async function register(values) {
    const { data } = await api.post("/auth/register", values);
    localStorage.setItem("blocktrust_token", data.token);
    localStorage.setItem("blocktrust_user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }

  function logout() {
    localStorage.removeItem("blocktrust_token");
    localStorage.removeItem("blocktrust_user");
    setUser(null);
  }

  const value = useMemo(() => ({ user, login, register, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
