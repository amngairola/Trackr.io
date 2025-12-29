import { createContext, useContext, useState, useEffect } from "react";
import api from "./axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await api.get("/get-user", {
          withCredentials: true,
        });
        setUser(data.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // 2. Login Function
  const login = async (email, password) => {
    const { data } = await api.post("/login", { email, password });
    localStorage.setItem("accessToken", data.data.accessToken);
    setUser(data.data.user);
    return data;
  };

  // 3. Logout Function
  const logout = async () => {
    await api.get("/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
