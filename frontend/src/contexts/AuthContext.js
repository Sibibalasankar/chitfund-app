import React, { createContext, useState, useContext, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

const AuthContext = createContext();
const API_BASE_URL = "http://192.168.1.44:5000/api/auth"; // change to your backend IP

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync("userToken");
        const savedUser = await SecureStore.getItemAsync("userData");
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (err) {
        console.error("Error loading auth data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  // --- Login (works for Admin & User)
  const login = async (phone, password) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/login`, { phone, password });
      const { user, token } = res.data;

      setUser(user);
      setToken(token);

      await SecureStore.setItemAsync("userToken", token);
      await SecureStore.setItemAsync("userData", JSON.stringify(user));

      return user; // <-- contains role (admin or participant)
    } catch (error) {
      const message = error.response?.data?.error || "Login failed";
      setAuthError(message);
      throw new Error(message);
    }
  };

  // --- Register (Users only, Admins must be seeded in DB)
  const register = async (userData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/register`, userData);
      const { user, token } = res.data;

      setUser(user);
      setToken(token);

      await SecureStore.setItemAsync("userToken", token);
      await SecureStore.setItemAsync("userData", JSON.stringify(user));

      return user;
    } catch (error) {
      const message = error.response?.data?.error || "Registration failed";
      setAuthError(message);
      throw new Error(message);
    }
  };

  // --- Forgot Password (Users only)
  const forgotPassword = async (phone) => {
    try {
      return await axios.post(`${API_BASE_URL}/forgot-password`, { phone });
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to send OTP");
    }
  };

  // --- Reset Password (Users only)
  const resetPassword = async (phone, otp, newPassword) => {
    try {
      return await axios.post(`${API_BASE_URL}/reset-password`, {
        phone,
        otp,
        newPassword,
      });
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to reset password");
    }
  };

  // --- Logout
  const logout = async () => {
    setUser(null);
    setToken(null);
    await SecureStore.deleteItemAsync("userToken");
    await SecureStore.deleteItemAsync("userData");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        authError,
        login,
        register,
        forgotPassword,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
