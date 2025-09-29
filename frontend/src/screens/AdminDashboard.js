import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTranslation } from "../hooks/useTranslation";
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

  const { currentLanguage, setLanguage } = useLanguage();
  const { t } = useTranslation();

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

  const [userSearch, setUserSearch] = useState("");
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
      return Alert.alert(t('admin.alerts.error'), t('admin.validation.fillAllFields'));
    if (!validateName(formData.name))
      return Alert.alert(t('admin.alerts.error'), t('admin.validation.validName'));
    if (!validatePhone(formData.phone))
      return Alert.alert(t('admin.alerts.error'), t('admin.validation.validPhone'));

    try {
      if (editingUser) {
        await updateUser(editingUser._id, formData);
        Alert.alert(t('admin.alerts.success'), t('admin.alerts.updated').replace('updated', 'User'));
      } else {
        await addUser(formData);
        Alert.alert(t('admin.alerts.success'), t('admin.alerts.added').replace('added', 'User'));
      }
      setModalVisible(false);
    } catch (err) {
      Alert.alert(t('admin.alerts.error'), err.message || "Failed to save user");
    }
  };

  const handleDeleteUser = (userId, userName) => {
    Alert.alert(
      t('admin.buttons.delete') + " " + t('admin.tabs.users').slice(0, -1),
      `${t('admin.alerts.confirmDelete')} ${userName}?`,
      [
        { text: t('admin.buttons.cancel'), style: "cancel" },
        {
          text: t('admin.buttons.delete'),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUser(userId);
              Alert.alert(t('admin.alerts.deleted'), `${userName} ${t('admin.alerts.deleted')}`);
            } catch (err) {
              Alert.alert(t('admin.alerts.error'), err.message || "Failed to delete user");
            }
          },
        },
      ]
    );
  };

const toggleUserStatus = async (user) => {
  try {
    const newStatus = user.status === "active" ? "inactive" : "active";
    await updateUser(user._id, { status: newStatus });
    // 🔑 removed fetchUsers()
    Alert.alert(
      t('admin.alerts.success'),
      `${user.name} ${t('admin.status.updatedTo')} ${newStatus}`
    );
  } catch (err) {
    Alert.alert(t('admin.alerts.error'), err.message || "Failed to update status");
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
      return Alert.alert(t('admin.alerts.error'), t('admin.validation.fillAllFields'));
    }
    try {
      if (editingFund) {
        await updateFund(editingFund._id, fundFormData);
        Alert.alert(t('admin.alerts.success'), t('admin.alerts.updated').replace('updated', 'Fund'));
      } else {
        await addFund(fundFormData);
        Alert.alert(t('admin.alerts.success'), t('admin.alerts.added').replace('added', 'Fund'));
      }
      setFundModalVisible(false);
    } catch (err) {
      Alert.alert(t('admin.alerts.error'), err.message || "Failed to save fund");
    }
  };

  const handleDeleteFund = (fundId, participantName) => {
    Alert.alert(
      t('admin.buttons.delete') + " Fund",
      `${t('admin.alerts.confirmDelete')} ${participantName}'s fund?`,
      [
        { text: t('admin.buttons.cancel'), style: "cancel" },
        {
          text: t('admin.buttons.delete'),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFund(fundId);
              Alert.alert(t('admin.alerts.deleted'), `Fund for ${participantName} ${t('admin.alerts.deleted')}`);
            } catch (err) {
              Alert.alert(t('admin.alerts.error'), err.message || "Failed to delete fund");
            }
          },
        },
      ]
    );
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
      return Alert.alert(t('admin.alerts.error'), t('admin.validation.fillAllFields'));
    }
    try {
      if (editingLoan) {
        await updateLoan(editingLoan._id, loanData);
        Alert.alert(t('admin.alerts.success'), t('admin.alerts.updated').replace('updated', 'Loan'));
      } else {
        await addLoan(loanData);
        Alert.alert(t('admin.alerts.success'), t('admin.alerts.added').replace('added', 'Loan'));
      }
      setLoanModalVisible(false);
    } catch (err) {
      Alert.alert(t('admin.alerts.error'), err.message || "Failed to save loan");
    }
  };

  const handleDeleteLoan = (loanId, participantName) => {
    Alert.alert(
      t('admin.buttons.delete') + " Loan",
      `${t('admin.alerts.confirmDelete')} ${participantName}'s loan?`,
      [
        { text: t('admin.buttons.cancel'), style: "cancel" },
        {
          text: t('admin.buttons.delete'),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteLoan(loanId);
              Alert.alert(t('admin.alerts.deleted'), `Loan for ${participantName} ${t('admin.alerts.deleted')}`);
            } catch (err) {
              Alert.alert(t('admin.alerts.error'), err.message || "Failed to delete loan");
            }
          },
        },
      ]
    );
  };

  // --- Logout ---
  const handleLogout = () => {
    Alert.alert(t('admin.logout'), t('admin.logoutConfirm'), [
      { text: t('admin.buttons.cancel'), style: "cancel" },
      { text: t('admin.logout'), style: "destructive", onPress: () => logout() },
    ]);
  };

  // --- Refresh ---
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchUsers(), fetchFunds(), fetchLoans(), fetchNotifications()]);
    } catch (error) {
      console.log("Refresh Error:", error);
      Alert.alert(t('admin.alerts.error'), "Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
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
              placeholder={t('admin.search.users')}
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
                <Text style={styles.gradientButtonText}>{t('admin.buttons.addUser')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <UserList
              users={filteredUsers}
              loans={loans}
              funds={funds}
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
                <Text style={styles.gradientButtonText}>{t('admin.buttons.addFund')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <FundList
              funds={funds || []}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              onUpdateStatus={async (id, status, participantName) => {
                try {
                  await updateFundStatus(id, status);
                  Alert.alert(t('admin.alerts.success'), `${participantName}'s fund marked as ${status}`);
                } catch (err) {
                  Alert.alert(t('admin.alerts.error'), err.message || "Failed to update fund");
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
                <Text style={styles.gradientButtonText}>{t('admin.buttons.addLoan')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <LoanList
              loans={loans || []}
              fetchLoans={fetchLoans}
              updateLoan={updateLoan}
              onEditLoan={handleEditLoan}
              onDeleteLoan={handleDeleteLoan}
              onUpdateStatus={async (id, status, participantName) => {
                try {
                  await updateLoanStatus(id, status);
                  Alert.alert(t('admin.alerts.success'), `${participantName}'s loan marked as ${status}`);
                } catch (err) {
                  Alert.alert(t('admin.alerts.error'), err.message || "Failed to update loan");
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
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
          {/* Language Toggle */}
          <TouchableOpacity
            style={styles.languageToggle}
            onPress={() => {
              const newLang = currentLanguage === "en" ? "ta" : "en";
              setLanguage(newLang); // From useLanguage context
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.languageInner}
            >
              <Text style={styles.languageText}>{currentLanguage === "en" ? "TA" : "EN"}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>{t("admin.dashboardTitle")}</Text>

          {/* Logout */}
          <TouchableOpacity onPress={handleLogout}>
            <Icon name="logout" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>{getActiveTabContent()}</View>

      <AdminTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
      />

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
        users={users}
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
  languageToggle: {
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 10,
  },
  languageInner: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  languageText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

});

export default AdminDashboard;