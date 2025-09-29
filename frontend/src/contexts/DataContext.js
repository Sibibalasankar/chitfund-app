import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const DataContext = createContext();
export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [funds, setFunds] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loans, setLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // ✅ Use your backend IP
  const API_BASE_URL = "https://chitfund-app-4b4s.onrender.com/api";

  // ---- Fetch Users ----
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      const data = await res.json();
      setUsers(data);
      return data;
    } catch (err) {
      console.error("Fetch Users Error:", err);
      throw err;
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
 // In your DataContext - updateUser function
const updateUser = async (id, userData) => {
  try {
    console.log('📤 Sending update request for user:', id, 'Data:', userData);
    
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    
    const data = await res.json();
    console.log('📥 Server response:', data);
    
    if (!res.ok) throw new Error(data.error || "Failed to update user");

    // Update local state
    setUsers((prev) => prev.map((u) => (u._id === id ? data.user : u)));
    
    console.log('✅ Local state updated');
    return data.user;
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
      return data;
    } catch (err) {
      console.error("Delete User Error:", err);
      throw err;
    }
  };

  // ---- Fetch Funds ----
  const fetchFunds = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/funds`);
      const data = await res.json();
      setFunds(data);
      return data;
    } catch (err) {
      console.error("Fetch Funds Error:", err);
      throw err;
    } finally {
      setIsLoading(false);
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

  // ---- Update Fund ----
  const updateFund = async (id, updatedData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/funds/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update fund");

      setFunds((prev) => prev.map((f) => (f._id === id ? data.fund : f)));
      return data.fund;
    } catch (err) {
      console.error("Update Fund Error:", err);
      throw err;
    }
  };

  // ---- Update Fund Status ----
  const updateFundStatus = async (id, status) => {
    return updateFund(id, { status });
  };

  // ---- Delete Fund ----
  const deleteFund = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/funds/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete fund");

      setFunds((prev) => prev.filter((f) => f._id !== id));
      return data;
    } catch (err) {
      console.error("Delete Fund Error:", err);
      throw err;
    }
  };

  // ---- Fetch Notifications ----
  const fetchNotifications = async (phone = null) => {
    try {
      const url = phone
        ? `${API_BASE_URL}/notifications/${phone}`
        : `${API_BASE_URL}/notifications`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(data);
      return data;
    } catch (err) {
      console.error("Fetch Notifications Error:", err);
      throw err;
    }
  };

  // ---- Mark Notification As Read ----
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
      return data;
    } catch (err) {
      console.error("Mark Notification Error:", err);
      throw err;
    }
  };

  // ---- Mark All Notifications As Read ----
  const markAllNotificationsAsRead = async () => {
    try {
      // Use the batch endpoint if available, otherwise mark individually
      const res = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        return;
      }
      
      // Fallback: mark individually
      await Promise.all(
        notifications
          .filter((n) => !n.isRead)
          .map((n) => markNotificationAsRead(n._id))
      );
    } catch (err) {
      console.error("Mark All Notifications Error:", err);
      throw err;
    }
  };

  // ---- Fetch Loans ----
  const fetchLoans = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/loans`);
      const data = await res.json();
      setLoans(data);
      return data;
    } catch (err) {
      console.error("Fetch Loans Error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Add Loan ----
  const addLoan = async (loanData) => {
    try {
      console.log("Sending loan data:", loanData);
      
      const res = await fetch(`${API_BASE_URL}/loans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loanData),
      });
      
      const data = await res.json();
      console.log("Server response:", res.status, data);
      
      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to add loan");
      }
      
      setLoans((prev) => [...prev, data.loan]);
      return data.loan;
    } catch (err) {
      console.error("Add Loan Error details:", err);
      throw err;
    }
  };

  // ---- Update Loan ----
  const updateLoan = async (id, updatedData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/loans/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update loan");
      
      setLoans(prev => prev.map(loan => 
        loan._id === id ? { ...loan, ...data.loan } : loan
      ));
      
      return data.loan;
    } catch (err) {
      console.error("Update Loan Error:", err);
      throw err;
    }
  };

  // ---- Update Loan Status ----
  const updateLoanStatus = async (id, status) => {
    return updateLoan(id, { status });
  };

  // ---- Delete Loan ----
  const deleteLoan = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/loans/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete loan");
      setLoans((prev) => prev.filter((l) => l._id !== id));
      return data;
    } catch (err) {
      console.error("Delete Loan Error:", err);
      throw err;
    }
  };

  // ---- Refresh All Data ----
  const refreshAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchUsers(), fetchFunds(), fetchLoans()]);
      if (user) await fetchNotifications(user.phone);
    } catch (err) {
      console.error("Refresh all data error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Load all data on app start
  useEffect(() => {
    if (user) {
      refreshAllData();
    }
  }, [user]);

  const value = {
    // State
    users,
    funds,
    loans,
    notifications,
    isLoading,
    
    // Functions
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    
    fetchFunds,
    addFund,
    updateFund,
    updateFundStatus,
    deleteFund,
    
    fetchLoans,
    addLoan,
    updateLoan,
    updateLoanStatus,
    deleteLoan,
    
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    
    refreshAllData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};