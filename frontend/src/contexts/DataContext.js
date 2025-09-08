import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const DataContext = createContext();
export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [funds, setFunds] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Use your backend IP
  const API_BASE_URL = "http://192.168.1.44:5000/api";

  // ---- Fetch Users ----
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Fetch Users Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Add User ----
  const addUser = async (userData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to add user");

      setUsers((prev) => [...prev, data.user]);
      return data.user;
    } catch (err) {
      console.error("Add User Error:", err);
      throw err;
    }
  };

  // ---- Update User ----
  const updateUser = async (id, userData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user");

      setUsers((prev) => prev.map((u) => (u._id === id ? data.user : u)));
    } catch (err) {
      console.error("Update User Error:", err);
      throw err;
    }
  };

  // ---- Delete User ----
  const deleteUser = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete user");

      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Delete User Error:", err);
      throw err;
    }
  };

  // ---- Fetch Funds ----
  const fetchFunds = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/funds`);
      const data = await res.json();
      setFunds(data);
    } catch (err) {
      console.error("Fetch Funds Error:", err);
    }
  };

  // ---- Add Fund ----
  const addFund = async (fundData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/funds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fundData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add fund");

      setFunds((prev) => [...prev, data.fund]);
      return data.fund;
    } catch (err) {
      console.error("Add Fund Error:", err);
      throw err;
    }
  };

  // ---- Update Fund Status ----
  const updateFundStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/funds/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update fund");

      setFunds((prev) => prev.map((f) => (f._id === id ? data.fund : f)));
    } catch (err) {
      console.error("Update Fund Error:", err);
      throw err;
    }
  };

  // ---- Fetch Notifications ----
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`);
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Fetch Notifications Error:", err);
    }
  };

// ---- Mark Notification As Read (single) ----
const markNotificationAsRead = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to mark notification as read");

    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
  } catch (err) {
    console.error("Mark Notification Error:", err);
  }
};

// ---- Mark All Notifications As Read ----
const markAllNotificationsAsRead = async () => {
  try {
    await Promise.all(
      notifications
        .filter((n) => !n.isRead)
        .map((n) =>
          fetch(`${API_BASE_URL}/notifications/${n._id}/read`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
          })
        )
    );

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  } catch (err) {
    console.error("Mark All Notifications Error:", err);
  }
};


  // ✅ Load all data on app start
  useEffect(() => {
    fetchUsers();
    fetchFunds();
    fetchNotifications();
  }, []);

  const value = {
  users,
  funds,
  notifications,
  isLoading,
  fetchUsers,
  fetchFunds,
  fetchNotifications,   // <-- make sure this is here
  addUser,
  updateUser,
  deleteUser,
  addFund,
  updateFundStatus,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};


  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
