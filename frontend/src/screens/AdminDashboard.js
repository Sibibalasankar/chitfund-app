import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { validatePhone, validateName } from "../utils/validation";
import Icon from "react-native-vector-icons/MaterialIcons";

import AdminTabs from "../components/Admin/Tabs";
import StatsOverview from "../components/Admin/StatsOverview";
import UserList from "../components/Admin/UserList";
import UserForm from "../components/Admin/UserForm";
import FundList from "../components/Admin/FundList";
import FundForm from "../components/Admin/FundForm";
import NotificationList from "../components/Admin/NotificationList";

const AdminDashboard = ({ navigation }) => {
  const { logout } = useAuth();
  const {
  users,
  funds,
  notifications,
  isLoading,
  addUser,
  updateUser,
  deleteUser,
  fetchUsers,
  fetchFunds,
  fetchNotifications,
  addFund,
  updateFund,
  updateFundStatus,
  deleteFund, // 👈 add this line
} = useData();

  const [fundModalVisible, setFundModalVisible] = useState(false);
  const [fundFormData, setFundFormData] = useState({
    participantId: "",
    amount: 0,
    dueDate: "",
    status: "pending",
  });
  const [editingFund, setEditingFund] = useState(null); // ✅ track edit mode

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    role: "participant",
    status: "active",
  });

  // ✅ Refresh users, funds, notifications
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchUsers(), fetchFunds(), fetchNotifications()]);
    } catch (error) {
      console.log("Refresh Error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // --- User Handlers ---
  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({ name: "", phone: "", role: "participant", status: "active" });
    setModalVisible(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      phone: user.phone,
      role: user.role,
      status: user.status,
    });
    setModalVisible(true);
  };

  const handleSaveUser = async () => {
    if (!formData.name || !formData.phone)
      return Alert.alert("Error", "Please fill all fields");
    if (!validateName(formData.name))
      return Alert.alert("Error", "Name must be at least 2 characters");
    if (!validatePhone(formData.phone))
      return Alert.alert("Error", "Enter valid 10-digit phone");

    try {
      if (editingUser) {
        await updateUser(editingUser._id, formData);
        Alert.alert("Success", "User updated successfully");
      } else {
        await addUser(formData);
        Alert.alert("Success", "User added successfully");
      }
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to save user");
    }

    setModalVisible(false);
  };

  const handleDeleteUser = (userId, userName) => {
    Alert.alert("Delete User", `Are you sure you want to delete ${userName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteUser(userId);
            Alert.alert("Deleted", `${userName} has been removed`);
          } catch (err) {
            Alert.alert("Error", err.message || "Failed to delete user");
          }
        },
      },
    ]);
  };

  const toggleUserStatus = async (user) => {
    try {
      await updateUser(user._id, {
        status: user.status === "active" ? "inactive" : "active",
      });
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to update status");
    }
  };

  // --- Fund Handlers ---
  const handleAddFund = () => {
    setEditingFund(null);
    setFundFormData({
      participantId: "",
      amount: 0,
      dueDate: "",
      status: "pending",
    });
    setFundModalVisible(true);
  };

  const handleEditFund = (fund) => {
    setEditingFund(fund);
    setFundFormData({
      participantId: fund.participantId?._id || fund.participantId,
      amount: fund.amount,
      dueDate: fund.dueDate,
      status: fund.status,
    });
    setFundModalVisible(true);
  };

  const handleSaveFund = async () => {
    if (!fundFormData.participantId || fundFormData.amount <= 0 || !fundFormData.dueDate) {
      return Alert.alert("Error", "Please fill all fields");
    }
    try {
      if (editingFund) {
        await updateFund(editingFund._id, fundFormData);
        Alert.alert("Success", "Fund updated successfully");
      } else {
        await addFund(fundFormData);
        Alert.alert("Success", "Fund added successfully");
      }
      setFundModalVisible(false);
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to save fund");
    }
  };
// --- Fund Handlers ---
const handleDeleteFund = (fundId, participantName) => {
  Alert.alert(
    "Delete Fund",
    `Are you sure you want to delete ${participantName}'s fund?`,
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteFund(fundId); // make sure deleteFund exists in your DataContext
            Alert.alert("Deleted", `Fund for ${participantName} has been removed`);
            setFundModalVisible(false); // close modal after delete
          } catch (err) {
            Alert.alert("Error", err.message || "Failed to delete fund");
          }
        },
      },
    ]
  );
};

  // --- Logout ---
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
        },
      },
    ]);
  };

  // --- Tab Content ---
  const getActiveTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <StatsOverview
            users={users}
            funds={funds}
            notifications={notifications}
            onAddUser={handleAddUser}
            onAddFund={handleAddFund}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            setActiveTab={setActiveTab}
          />
        );

      case "users":
        return (
          <View style={styles.tabContent}>
            <TouchableOpacity
              style={styles.gradientButton}
              onPress={handleAddUser}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientInner}
              >
                <Icon name="person-add" size={20} color="#fff" />
                <Text style={styles.gradientButtonText}>Add User</Text>
              </LinearGradient>
            </TouchableOpacity>
            <UserList
              users={users || []}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
              onToggleStatus={toggleUserStatus}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          </View>
        );

      case "funds":
        return (
          <View style={styles.tabContent}>
            <TouchableOpacity
              style={styles.gradientButton}
              onPress={handleAddFund}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#28a745", "#81c784"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientInner}
              >
                <Icon name="add-circle" size={20} color="#fff" />
                <Text style={styles.gradientButtonText}>Add Fund</Text>
              </LinearGradient>
            </TouchableOpacity>

            <FundList
              funds={funds || []}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              onUpdateStatus={async (id, status, participantName) => {
                try {
                  await updateFundStatus(id, status);
                  Alert.alert("Success", `${participantName}'s fund marked as ${status}`);
                } catch (err) {
                  Alert.alert("Error", err.message || "Failed to update fund");
                }
              }}
              onEditFund={handleEditFund} // ✅ pass edit handler
            />
          </View>
        );

      case "notifications":
        return (
          <NotificationList
            notifications={notifications || []}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        );

      default:
        return null;
    }
  };

  if (isLoading)
    return (
      <ActivityIndicator
        size="large"
        color="#667eea"
        style={{ flex: 1, justifyContent: "center" }}
      />
    );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#4e54c8", "#8f94fb"]} style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Icon name="logout" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.content}>{getActiveTabContent()}</View>

      <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} notifications={notifications} />

      <UserForm
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSaveUser}
      />

      <FundForm
        visible={fundModalVisible}                     // ✅ use correct state
        onClose={() => setFundModalVisible(false)}
        users={users}
        formData={fundFormData}                        // ✅ use fundFormData
        setFormData={setFundFormData}                  // ✅ use fundFormData setter
        onSave={handleSaveFund}
        onDelete={async () => {                        // ✅ delete handler
          if (!editingFund) return;
          Alert.alert(
            "Delete Fund",
            "Are you sure you want to delete this fund?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                  try {
                    await deleteFund(editingFund._id);   // implement deleteFund in your DataContext
                    Alert.alert("Deleted", "Fund has been removed");
                    setFundModalVisible(false);
                    setEditingFund(null);
                  } catch (err) {
                    Alert.alert("Error", err.message || "Failed to delete fund");
                  }
                },
              },
            ]
          );
        }}
        isEditing={!!editingFund}                      // ✅ edit mode flag
      />


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: { fontSize: 20, color: "#fff", fontWeight: "bold" },
  content: { flex: 1 },
  tabContent: { flex: 1, padding: 16 },
  gradientButton: { marginBottom: 15, borderRadius: 10, overflow: "hidden" },
  gradientInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  gradientButtonText: { color: "#fff", fontWeight: "bold", marginLeft: 8, fontSize: 15 },
});

export default AdminDashboard;
