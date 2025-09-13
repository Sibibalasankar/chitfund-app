import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { FlatList, RefreshControl, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";

const ParticipantDashboard = () => {
  const { user, logout } = useAuth();
  const {
    funds,
    notifications,
    fetchFunds,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useData();
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);

  const userFunds = funds.filter((f) => f.participantId._id === user._id);

  // Compute dynamic totals
  const totalPaid = userFunds
    .filter((f) => f.status === "paid")
    .reduce((sum, f) => sum + f.amount, 0);

  const pendingAmount = userFunds
    .filter((f) => f.status === "pending" || f.status === "overdue")
    .reduce((sum, f) => sum + f.amount, 0);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchFunds(), fetchNotifications()]);
    setRefreshing(false);
  }, []);
  // Filter notifications only for this user
  const userNotifications = notifications.filter(
    (n) => n.userId === user._id // or n.phone === user.phone depending on your schema
  );

  const renderFundItem = ({ item }) => (
    <View
      style={[
        styles.fundItem,
        item.status === "overdue" && styles.overdueItem,
        item.status === "paid" && styles.paidItem,
        item.status === "pending" && styles.pendingItem,
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.fundTitle}>₹{item.amount.toLocaleString()}</Text>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusIndicator,
              item.status === "paid" && styles.statusPaid,
              item.status === "pending" && styles.statusPending,
              item.status === "overdue" && styles.statusOverdue,
            ]}
          />
          <Text style={styles[item.status]}>{item.status.toUpperCase()}</Text>
        </View>
        <Text style={styles.fundDate}>
          Due: {new Date(item.dueDate).toLocaleDateString()}
        </Text>
        {item.paymentDate && (
          <Text style={styles.fundDate}>
            Paid: {new Date(item.paymentDate).toLocaleDateString()}
          </Text>
        )}
      </View>
      {item.status === "pending" && (
        <TouchableOpacity style={styles.payButton}>
          <Text style={styles.payButtonText}>Pay Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.isRead && styles.unreadNotification,
      ]}
      onPress={() => markNotificationAsRead(item._id)}
    >
      {!item.isRead && <View style={styles.unreadIndicator} />}
      <View style={styles.notificationContent}>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Overview content
  const overviewContent = (
    <View style={styles.overviewContainer}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCards}>
        <View style={[styles.summaryCard, { backgroundColor: "#4CAF50" }]}>
          <Text style={styles.summaryAmount}>₹{totalPaid.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Total Paid</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: "#FF9800" }]}>
          <Text style={styles.summaryAmount}>₹{pendingAmount.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Pending Amount</Text>
        </View>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Account Summary</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: "#e0f7fa" }]}>
              <Ionicons name="checkmark-done" size={20} color="#007bff" />
            </View>
            <Text style={styles.statNumber}>
              {userFunds.filter((f) => f.status === "paid").length}
            </Text>
            <Text style={styles.statLabel}>Paid</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: "#fff3e0" }]}>
              <Ionicons name="time" size={20} color="#FF9800" />
            </View>
            <Text style={styles.statNumber}>
              {userFunds.filter((f) => f.status === "pending").length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: "#ffebee" }]}>
              <Ionicons name="alert" size={20} color="#F44336" />
            </View>
            <Text style={styles.statNumber}>
              {userFunds.filter((f) => f.status === "overdue").length}
            </Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Activity</Text>
        {userFunds.slice(0, 3).map((f) => (
          <View key={f._id} style={styles.activityItem}>
            <View style={styles.activityDot} />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>
                {f.status === "paid"
                  ? `Payment of ₹${f.amount.toLocaleString()} completed`
                  : `Fund of ₹${f.amount.toLocaleString()} due on ${new Date(
                    f.dueDate
                  ).toLocaleDateString()}`}
              </Text>
              <Text style={styles.activityTime}>
                {new Date(f.updatedAt || f.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        ))}
        {userFunds.length === 0 && (
          <Text style={styles.noDataText}>No recent activity</Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {activeTab === "overview" && (
        <FlatList
          data={[]}
          ListHeaderComponent={overviewContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {activeTab === "funds" && (
        <FlatList
          data={userFunds}
          keyExtractor={(item) => item._id}
          renderItem={renderFundItem}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>No funds found</Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={[
            styles.fundsContainer,
            userFunds.length === 0 && styles.emptyContainer
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      {activeTab === "notifications" && (
        <FlatList
          data={userNotifications}
          keyExtractor={(item) => item._id}
          renderItem={renderNotificationItem}
          ListHeaderComponent={
            <View style={styles.notificationsHeader}>
              <Text style={styles.sectionTitle}>Notifications</Text>
              {userNotifications.length > 0 && (
                <TouchableOpacity onPress={markAllNotificationsAsRead}>
                  <Text style={styles.markAllRead}>Mark all read</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>No notifications</Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={[
            styles.notificationsContainer,
            userNotifications.length === 0 && styles.emptyContainer,
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}


      {/* Bottom Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "overview" && styles.activeTab]}
          onPress={() => setActiveTab("overview")}
        >
          <Ionicons
            name="home-outline"
            size={24}
            color={activeTab === "overview" ? "#007bff" : "#666"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "overview" && styles.activeTabText,
            ]}
          >
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "funds" && styles.activeTab]}
          onPress={() => setActiveTab("funds")}
        >
          <Ionicons
            name="wallet-outline"
            size={24}
            color={activeTab === "funds" ? "#007bff" : "#666"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "funds" && styles.activeTabText,
            ]}
          >
            My Funds
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "notifications" && styles.activeTab]}
          onPress={() => setActiveTab("notifications")}
        >
          <Ionicons
            name="notifications-outline"
            size={24}
            color={activeTab === "notifications" ? "#007bff" : "#666"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "notifications" && styles.activeTabText,
            ]}
          >
            Notifications
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 16,
    color: "#666",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  logoutButton: {
    backgroundColor: "#F44336",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  overviewContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  summaryCards: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 6,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
  },
  summaryAmount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  statsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007bff",
    marginRight: 12,
    marginTop: 6,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: "#666",
  },
  noDataText: {
    textAlign: "center",
    color: "#999",
    fontStyle: "italic",
    marginVertical: 10,
  },
  fundsContainer: {
    paddingTop: 16,
    paddingBottom: 80,
  },
  fundItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  paidItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  pendingItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  overdueItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  fundTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8,
    color: "#333",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusPaid: {
    backgroundColor: "#4CAF50",
  },
  statusPending: {
    backgroundColor: "#FF9800",
  },
  statusOverdue: {
    backgroundColor: "#F44336",
  },
  paid: {
    color: "#4CAF50",
    fontWeight: "600",
    fontSize: 12,
  },
  pending: {
    color: "#FF9800",
    fontWeight: "600",
    fontSize: 12,
  },
  overdue: {
    color: "#F44336",
    fontWeight: "600",
    fontSize: 12,
  },
  fundDate: {
    fontSize: 12,
    color: "#666",
  },
  payButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  payButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  notificationsContainer: {
    paddingTop: 16,
    paddingBottom: 80,
  },
  notificationsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  markAllRead: {
    color: "#007bff",
    fontWeight: "600",
  },
  notificationItem: {
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: "#f0f7ff",
  },
  notificationContent: {
    flex: 1,
    marginLeft: 12,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "#666",
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007bff",
    marginTop: 6,
  },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    // backgroundColor: "#f0f7ff",
  },
  tabText: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },
  activeTabText: {
    color: "#007bff",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    marginTop: 12,
    color: "#999",
    fontSize: 16,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
});

export default ParticipantDashboard;