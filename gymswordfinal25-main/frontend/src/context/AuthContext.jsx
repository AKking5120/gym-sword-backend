import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, formatApiErrorDetail } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      localStorage.removeItem("gs_token");
      setUser(false);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    const token = data?.token;
    const userData = data?.user;
    if (token) localStorage.setItem("gs_token", token);
    setUser(userData);
    return userData;
  };

  const adminLogin = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    const token = data?.token;
    const userData = data?.user;
    if (!userData || userData.role !== "admin") {
      throw new Error("Not an admin account");
    }
    if (token) localStorage.setItem("gs_token", token);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, referralCode) => {
    const { data } = await api.post("/auth/register", {
      name, email, password,
      referred_by: referralCode || undefined,
    });
    // No token returned - user must verify email first
    return data?.user || { email: data?.user?.email };
  };

  const logout = async () => {
    localStorage.removeItem("gs_token");
    setUser(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, ready, login, adminLogin, register, logout, refresh: fetchMe, formatErr: formatApiErrorDetail }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
