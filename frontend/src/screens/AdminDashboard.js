import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { validateName, validatePhone } from "../utils/validation";

import FundForm from "../components/Admin/FundForm";
import FundList from "../components/Admin/FundList";
import LoanForm from "../components/Admin/LoanForm";
import LoanList from "../components/Admin/LoanList";
import NotificationList from "../components/Admin/NotificationList";
import StatsOverview from "../components/Admin/StatsOverview";
import AdminTabs from "../components/Admin/Tabs";
import UserForm from "../components/Admin/UserForm";
import UserList from "../components/Admin/UserList";

const AdminDashboard = ({ navigation }) => {
  const { logout } = useAuth();
  const {
    users,
    funds,
    loans,
    notifications,
    isLoading,
    addUser,
    updateUser,
    deleteUser,
    fetchUsers,
    fetchFunds,
    fetchLoans,
    fetchNotifications,
    addFund,
    updateFund,
    updateFundStatus,
    deleteFund,
    addLoan,
    updateLoan,
    updateLoanStatus,
    deleteLoan,
  } = useData();

  const [fundModalVisible, setFundModalVisible] = useState(false);
  const [fundFormData, setFundFormData] = useState({
    participantId: "",
    amount: 0,
    dueDate: "",
    status: "pending",
  });
  const [editingFund, setEditingFund] = useState(null);



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

  const [userSearch, setUserSearch] = useState(""); // ✅ Search state


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
      setModalVisible(false);
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to save user");
    }
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
              await deleteFund(fundId);
              Alert.alert("Deleted", `Fund for ${participantName} has been removed`);
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
      { text: "Logout", style: "destructive", onPress: () => logout() },
    ]);
  };
  const [loanModalVisible, setLoanModalVisible] = useState(false);
  const [loanFormData, setLoanFormData] = useState({
    participantId: "",
    principalAmount: 0,
    interestRate: 0,
    totalInstallments: 1,
    paidInstallments: 0,
    startDate: "",
    status: "pending"
  });
  const [editingLoan, setEditingLoan] = useState(null);

  // --- Refresh ---
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchUsers(), fetchFunds(), fetchLoans(), fetchNotifications()]);
    } catch (error) {
      console.log("Refresh Error:", error);
      Alert.alert("Error", "Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  // --- Loan Handlers ---
  const handleAddLoan = () => {
    setEditingLoan(null);
    setLoanFormData({
      participantId: "",
      principalAmount: 0,
      interestRate: 0,
      totalInstallments: 1,
      paidInstallments: 0,
      startDate: "",
      status: "pending"
    });
    setLoanModalVisible(true);
  };

  const handleEditLoan = (loan) => {
    setEditingLoan(loan);
    setLoanFormData({
      participantId: loan.participantId?._id || loan.participantId,
      principalAmount: loan.principalAmount || loan.amount || 0,
      interestRate: loan.interestRate || 0,
      totalInstallments: loan.totalInstallments || 1,
      paidInstallments: loan.paidInstallments || 0,
      startDate: loan.startDate || "",
      status: loan.status || "pending",
      installmentAmount: loan.installmentAmount || 0
    });
    setLoanModalVisible(true);
  };

  const handleSaveLoan = async (loanData) => {
    if (!loanData.participantId || loanData.principalAmount <= 0 || loanData.interestRate <= 0) {
      return Alert.alert("Error", "Please fill all required fields");
    }
    try {
      if (editingLoan) {
        await updateLoan(editingLoan._id, loanData);
        Alert.alert("Success", "Loan updated successfully");
      } else {
        await addLoan(loanData);
        Alert.alert("Success", "Loan added successfully");
      }
      setLoanModalVisible(false);
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to save loan");
    }
  };

  const handleDeleteLoan = (loanId, participantName) => {
    Alert.alert(
      "Delete Loan",
      `Are you sure you want to delete ${participantName}'s loan?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteLoan(loanId);
              Alert.alert("Deleted", `Loan for ${participantName} has been removed`);
            } catch (err) {
              Alert.alert("Error", err.message || "Failed to delete loan");
            }
          },
        },
      ]
    );
  };

  // --- Filtered Users ---
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.phone.includes(userSearch) ||
    user.role.toLowerCase().includes(userSearch.toLowerCase())
  );

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
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, phone, or role"
              value={userSearch}
              onChangeText={setUserSearch}
            />

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
              users={filteredUsers}
              loans={loans}
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
              onEditFund={handleEditFund}
            />
          </View>
        );

      case "loans":
        return (
          <View style={styles.tabContent}>
            <TouchableOpacity style={styles.gradientButton} onPress={handleAddLoan} activeOpacity={0.8}>
              <LinearGradient colors={["#17a2b8", "#6fc2d0"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientInner}>
                <Icon name="add-circle" size={20} color="#fff" />
                <Text style={styles.gradientButtonText}>Add Loan</Text>
              </LinearGradient>
            </TouchableOpacity>

            <LoanList
              loans={loans || []}
              fetchLoans={fetchLoans}
              updateLoan={updateLoan} // ✅ Add this line
              onEditLoan={handleEditLoan}
              onDeleteLoan={handleDeleteLoan}
              onUpdateStatus={async (id, status, participantName) => {
                try {
                  await updateLoanStatus(id, status);
                  Alert.alert("Success", `${participantName}'s loan marked as ${status}`);
                } catch (err) {
                  Alert.alert("Error", err.message || "Failed to update loan");
                }
              }}
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
        editingUser={editingUser}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSaveUser}
      />

      <LoanForm
        visible={loanModalVisible}
        onClose={() => setLoanModalVisible(false)}
        users={users} // ✅ Make sure you're passing the users array
        formData={loanFormData}
        setFormData={setLoanFormData}
        onSave={handleSaveLoan}
        onDelete={editingLoan ? () => handleDeleteLoan(editingLoan._id, editingLoan.participantId?.name) : null}
        isEditing={!!editingLoan}
      />

      <FundForm
        visible={fundModalVisible}
        onClose={() => setFundModalVisible(false)}
        users={users}
        formData={fundFormData}
        setFormData={setFundFormData}
        onSave={handleSaveFund}
        onDelete={editingFund ? () => handleDeleteFund(editingFund._id, editingFund.participantId?.name) : null}
        isEditing={!!editingFund}
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
  gradientButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold", marginLeft: 8 },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: "#fff",
  },
});

export default AdminDashboard;