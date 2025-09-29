import { LinearGradient } from "expo-linear-gradient";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTranslation } from "../../hooks/useTranslation"; // ✅ Add translation hook

const { width } = Dimensions.get("window");

const StatsOverview = ({
  users,
  funds,
  refreshing,
  onRefresh,
  onAddUser,
  onAddFund,
  notifications = [],
  setActiveTab,
}) => {
  const { t } = useTranslation(); // ✅ Initialize translation hook

  const safeUsers = Array.isArray(users) ? users : [];
  const safeFunds = Array.isArray(funds) ? funds : [];
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  const stats = [
    {
      icon: "people",
      number: safeUsers.length,
      label: t('stats.totalUsers'), // ✅ Translated label
      gradient: ["#667eea", "#764ba2"],
      bgColor: "#f8f9ff",
    },
    {
      icon: "check-circle",
      number: safeFunds.filter((f) => f.status === "paid").length,
      label: t('stats.paidFunds'), // ✅ Translated label
      gradient: ["#56ab2f", "#a8e6cf"],
      bgColor: "#f8fff8",
    },
    {
      icon: "pending",
      number: safeFunds.filter((f) => f.status === "pending").length,
      label: t('stats.pendingFunds'), // ✅ Translated label
      gradient: ["#f093fb", "#f5576c"],
      bgColor: "#fff8f8",
    },
    {
      icon: "account-balance",
      number: safeFunds
        .filter((f) => f.status === "paid")
        .reduce((sum, fund) => sum + Number(fund.amount || 0), 0),
      label: t('stats.totalCollected'), // ✅ Translated label
      gradient: ["#4facfe", "#00f2fe"],
      bgColor: "#f0fdff",
      isAmount: true,
    },
  ];

  const recentActivities = safeNotifications.slice(0, 5);

  const formatAmount = (amount) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return "";
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "payment_received":
        return "account-balance-wallet";
      case "payment_reminder":
        return "notifications";
      case "fund_added":
        return "attach-money";
      case "user_added":
        return "person-add";
      default:
        return "info";
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "payment_received":
        return "#28a745";
      case "payment_reminder":
        return "#ffc107";
      case "fund_added":
        return "#17a2b8";
      case "user_added":
        return "#6f42c1";
      default:
        return "#6c757d";
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#667eea"]}
          tintColor="#667eea"
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('stats.dashboardTitle')}</Text>
        <Text style={styles.headerSubtitle}>{t('stats.dashboardSubtitle')}</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.statCard, { backgroundColor: stat.bgColor }]}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={stat.gradient}
              style={styles.iconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name={stat.icon} size={24} color="#fff" />
            </LinearGradient>

            <View style={styles.statContent}>
              <Text style={styles.statNumber}>
                {stat.isAmount
                  ? formatAmount(stat.number)
                  : stat.number.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>{t('stats.quickActions')}</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={onAddUser}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionGradient}
            >
              <Icon name="person-add" size={20} color="#fff" />
              <Text style={styles.quickActionText}>{t('admin.buttons.addUser')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={onAddFund}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#28a745", "#81c784"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionGradient}
            >
              <Icon name="add-circle" size={20} color="#fff" />
              <Text style={styles.quickActionText}>{t('admin.buttons.addFund')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activities */}
      {recentActivities.length > 0 && (
        <View style={styles.recentActivityContainer}>
          <View style={styles.activityHeader}>
            <Text style={styles.sectionTitle}>{t('stats.recentActivities')}</Text>
            <TouchableOpacity onPress={() => setActiveTab("notifications")}>
              <Text
                style={styles.viewAllText}
                numberOfLines={1}      // ✅ prevents overflow
                ellipsizeMode="tail"   // ✅ trims with …
              >
                {t('stats.viewAll')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activitiesList}>
            {recentActivities.map((activity, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.activityItem,
                  index === recentActivities.length - 1 && styles.lastActivityItem,
                ]}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.activityIconContainer,
                    { backgroundColor: `${getActivityColor(activity.type)}15` },
                  ]}
                >
                  <Icon
                    name={getActivityIcon(activity.type)}
                    size={16}
                    color={getActivityColor(activity.type)}
                  />
                </View>

                <View style={styles.activityContent}>
                  <Text style={styles.activityText} numberOfLines={2}>
                    {activity.message}
                  </Text>
                  <Text style={styles.activityTime}>
                    {formatDate(activity.createdAt)}
                  </Text>
                </View>

                <Icon name="chevron-right" size={16} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}


      {/* Empty State */}
      {recentActivities.length === 0 && (
        <View style={styles.emptyState}>
          <Icon name="inbox" size={48} color="#ccc" />
          <Text style={styles.emptyStateTitle}>{t('stats.noActivities')}</Text>
          <Text style={styles.emptyStateText}>
            {t('stats.activitiesWillAppear')}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6c757d",
    marginTop: 4,
    fontWeight: "400",
  },
  statsGrid: { paddingHorizontal: 20, marginTop: 20 },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  statContent: { flex: 1 },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 4,
    fontWeight: "500",
  },
  quickActionsContainer: { paddingHorizontal: 20, marginTop: 10 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  actionButtons: { flexDirection: "row", gap: 12 },
  quickActionButton: { flex: 1, borderRadius: 12, overflow: "hidden" },
  actionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  quickActionText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 15,
  },
  recentActivityContainer: {
    paddingHorizontal: 20,
    marginTop: 32,
    marginBottom: 20,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",   // ✅ allows Tamil text to wrap if needed
    gap: 6,             // ✅ keeps spacing neat
  },
  viewAllText: {
    color: "#667eea",
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 8, // ✅ extra breathing room
    paddingVertical: 4,
    maxWidth: 120,        // ✅ prevents it from pushing out of screen
    textAlign: "right",
  },

  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  lastActivityItem: { borderBottomWidth: 0 },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: { flex: 1 },
  activityText: {
    fontSize: 15,
    color: "#1a1a1a",
    lineHeight: 20,
    fontWeight: "500",
  },
  activityTime: {
    fontSize: 13,
    color: "#6c757d",
    marginTop: 4,
    fontWeight: "400",
  },
  emptyState: { alignItems: "center", padding: 40, marginTop: 20 },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});

export default StatsOverview;
