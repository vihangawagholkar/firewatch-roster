import { createContext, useContext, useEffect, useState } from "react";
import axios from "../api/api"; // Ensure this has baseURL + withCredentials: true
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in on first load
  useEffect(() => {
    axios.get("/api/auth/me", { withCredentials: true })
      .then(res => {
        console.log("User data:", res.data);  // Log the actual response
        setUser(res.data);
      })
      .catch(err => {
        console.error("Error fetching user data:", err);
        setUser(null);  // Set user to null if there's an error (e.g., not logged in)
      })
      .finally(() => {
        console.log("Finished loading authentication state");
        setLoading(false);
      });
  }, []);

  // Login
  const login = async (credentials) => {
    const res = await axios.post("/api/auth/login", credentials, {
      withCredentials: true
    });
    console.log("Login response:", res);
    setUser(res.data.user);
    return res;
  };

  // Logout
  const logout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);