import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { 
  FlatList, 
  RefreshControl, 
  StatusBar, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Alert, 
  ActivityIndicator, 
  Modal, 
  Dimensions,
  Platform,
  SafeAreaView
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { useTranslation } from "../hooks/useTranslation";
import { useLanguage } from "../contexts/LanguageContext";
import { useResponsive } from "../hooks/useResponsive";

const { width, height } = Dimensions.get('window');

// Helper to detect devices with bottom navigation bars
const hasBottomNavigationBar = () => {
  return Platform.OS === 'android' && Platform.Version >= 29; // Android 10+ usually have gesture bars
};

// Simplified tab bar height calculation
const getTabBarHeight = () => {
  const baseHeight = 70;
  const extraPadding = Platform.OS === 'ios' 
    ? (height > 800 ? 20 : 10) // iPhone notch/home indicator
    : (hasBottomNavigationBar() ? 15 : 5); // Android navigation bar
  
  return baseHeight + extraPadding;
};

const ParticipantDashboard = () => {
  const { user, logout } = useAuth();
  const {
    funds,
    loans,
    notifications,
    fetchFunds,
    fetchLoans,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useData();

  const { t } = useTranslation();
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();
  const { isDesktop, isTablet, getResponsivePadding, getResponsiveFontSize, getCardWidth, getGridColumns } = useResponsive();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);
  const [loanLoading, setLoanLoading] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Filter user-specific data
  const userFunds = funds.filter((f) => f.participantId._id === user._id && f.type !== "loan");
  const userLoans = loans.filter((l) => l.participantId._id === user._id);
  const totalPaid = userFunds.filter((f) => f.status === "paid").reduce((sum, f) => sum + f.amount, 0);
  const pendingAmount = userFunds.filter((f) => f.status === "pending" || f.status === "overdue").reduce((sum, f) => sum + f.amount, 0);

  const userNotifications = notifications.filter((n) => n.userId === user._id);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchFunds(), fetchLoans(), fetchNotifications()]);
    setRefreshing(false);
  }, []);

  const formatCurrency = (amount) => {
    return `₹${amount?.toLocaleString('en-IN') || '0'}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('common.notAvailable');
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'partially paid': return '#FF9800';
      case 'pending': return '#F44336';
      default: return '#666';
    }
  };

  const handlePayInstallment = async (loanId) => {
    Alert.alert(
      t('participant.payInstallment.title'),
      t('participant.payInstallment.message'),
      [{ text: t('common.ok') }]
    );
  };

  const handleLanguageChange = async (languageCode) => {
    await setLanguage(languageCode);
    setShowLanguageModal(false);
  };

  const getLanguageName = (code) => {
    return code === 'en' ? 'English' : 'தமிழ்';
  };

  const getLanguageFlag = (code) => {
    return code === 'en' ? '🇬🇧' : '🇮🇳';
  };

  // Use the simplified tab bar height calculation
  const tabBarHeight = getTabBarHeight();

  const getContentPadding = () => {
    return tabBarHeight + 10;
  };

  // Render Functions (same as before)
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
        <Text style={styles.fundTitle}>₹{(item.amount || 0).toLocaleString()}</Text>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusIndicator,
              item.status === "paid" && styles.statusPaid,
              item.status === "pending" && styles.statusPending,
              item.status === "overdue" && styles.statusOverdue,
            ]}
          />
          <Text style={styles[item.status]}>{t(`participant.status.${item.status}`).toUpperCase()}</Text>
        </View>
        <Text style={styles.fundDate}>
          {t('participant.due')}: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : t('common.notAvailable')}
        </Text>
        {item.paymentDate && (
          <Text style={styles.fundDate}>
            {t('participant.paid')}: {item.paymentDate ? new Date(item.paymentDate).toLocaleDateString() : t('common.notAvailable')}
          </Text>
        )}
      </View>
      {item.status === "pending" && (
        <TouchableOpacity style={styles.payButton}>
          <Text style={styles.payButtonText}>{t('participant.payNow')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderLoanItem = ({ item }) => (
    <View style={styles.loanCard}>
      <View style={styles.loanHeader}>
        <Text style={styles.loanAmount}>{formatCurrency(item.totalAmount)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{t(`participant.status.${item.status}`)}</Text>
        </View>
      </View>

      <View style={styles.loanDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{t('loanList.principal')}: {formatCurrency(item.principalAmount)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="percent-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{t('loanList.interest')}: {item.interestRate}%</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {t('loanList.installments')}: {item.paidInstallments || 0}/{item.totalInstallments}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="wallet-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {t('loanList.monthly')}: {formatCurrency(item.installmentAmount)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {t('loanList.remaining')}: {formatCurrency(item.remainingAmount)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="rocket-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {t('loanList.startDate')}: {formatDate(item.startDate)}
          </Text>
        </View>

        {item.dueDate && (
          <View style={styles.detailRow}>
            <Ionicons name="alert-circle-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {t('participant.dueDate')}: {formatDate(item.dueDate)}
            </Text>
          </View>
        )}
      </View>

      {item.status !== 'paid' && (
        <TouchableOpacity 
          style={styles.payButton}
          onPress={() => handlePayInstallment(item._id)}
        >
          <Text style={styles.payButtonText}>{t('participant.payInstallment.button')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.isRead && styles.unreadNotification]}
      onPress={() => markNotificationAsRead(item._id)}
    >
      {!item.isRead && <View style={styles.unreadIndicator} />}
      <View style={styles.notificationContent}>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

  const overviewContent = (
    <View style={styles.overviewContainer}>
      <View style={styles.header}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>{t('participant.greeting')},</Text>
          <Text style={styles.userName}>{user?.name}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.languageToggle}
            onPress={() => setShowLanguageModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.languageFlag}>{getLanguageFlag(currentLanguage)}</Text>
            <Text style={styles.languageCode}>{currentLanguage.toUpperCase()}</Text>
            <Ionicons name="chevron-down" size={14} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.summaryCards, isDesktop && styles.desktopSummaryCards]}>
        <View style={[styles.summaryCard, styles.paidCard, isDesktop && styles.desktopSummaryCard]}>
          <View style={styles.summaryIconContainer}>
            <Ionicons name="checkmark-circle" size={28} color="#fff" />
          </View>
          <Text style={styles.summaryAmount}>₹{totalPaid.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>{t('participant.totalPaid')}</Text>
        </View>
        <View style={[styles.summaryCard, styles.pendingCard, isDesktop && styles.desktopSummaryCard]}>
          <View style={styles.summaryIconContainer}>
            <Ionicons name="time" size={28} color="#fff" />
          </View>
          <Text style={styles.summaryAmount}>₹{pendingAmount.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>{t('participant.pendingAmount')}</Text>
        </View>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>{t('participant.accountSummary')}</Text>
        <View style={[styles.statsContainer, isDesktop && styles.desktopStatsContainer]}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: "#e8f5e9" }]}>
              <Ionicons name="checkmark-done" size={22} color="#4CAF50" />
            </View>
            <Text style={styles.statNumber}>{userFunds.filter((f) => f.status === "paid").length}</Text>
            <Text style={styles.statLabel}>{t('participant.paid')}</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: "#fff3e0" }]}>
              <Ionicons name="time" size={22} color="#FF9800" />
            </View>
            <Text style={styles.statNumber}>{userFunds.filter((f) => f.status === "pending").length}</Text>
            <Text style={styles.statLabel}>{t('participant.pending')}</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: "#ffebee" }]}>
              <Ionicons name="alert" size={22} color="#F44336" />
            </View>
            <Text style={styles.statNumber}>{userFunds.filter((f) => f.status === "overdue").length}</Text>
            <Text style={styles.statLabel}>{t('participant.overdue')}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, isDesktop && styles.desktopCard]}>
        <Text style={styles.cardTitle}>{t('participant.recentActivity')}</Text>
        {userFunds.slice(0, 3).map((f) => (
          <View key={f._id} style={styles.activityItem}>
            <View style={styles.activityDot} />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>
                {f.status === "paid"
                  ? t('participant.paymentCompleted', { amount: (f.amount || 0).toLocaleString() })
                  : t('participant.fundDue', { 
                      amount: (f.amount || 0).toLocaleString(), 
                      date: f.dueDate ? new Date(f.dueDate).toLocaleDateString() : t('common.notAvailable')
                    })}
              </Text>
              <Text style={styles.activityTime}>
                {new Date(f.updatedAt || f.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        ))}

        {userFunds.length === 0 && <Text style={styles.noDataText}>{t('participant.noRecentActivity')}</Text>}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {activeTab === "overview" && (
        <FlatList
          data={[]}
          ListHeaderComponent={overviewContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: getContentPadding() }}
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
              <Text style={styles.emptyStateText}>{t('participant.noFunds')}</Text>
            </View>
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={[
            styles.fundsContainer, 
            userFunds.length === 0 && styles.emptyContainer,
            { paddingBottom: getContentPadding() }
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      {activeTab === "loans" && (
        <FlatList
          data={userLoans}
          keyExtractor={(item) => item._id}
          renderItem={renderLoanItem}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>{t('loanList.noLoans')}</Text>
              <Text style={styles.emptyStateSubtext}>
                {t('participant.noLoansSubtext')}
              </Text>
            </View>
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={[
            styles.loansContainer, 
            userLoans.length === 0 && styles.emptyContainer,
            { paddingBottom: getContentPadding() }
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
              <Text style={styles.sectionTitle}>{t('admin.tabs.notifications')}</Text>
              {userNotifications.length > 0 && (
                <TouchableOpacity onPress={markAllNotificationsAsRead}>
                  <Text style={styles.markAllRead}>{t('participant.markAllRead')}</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>{t('participant.noNotifications')}</Text>
            </View>
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={[
            styles.notificationsContainer, 
            userNotifications.length === 0 && styles.emptyContainer,
            { paddingBottom: getContentPadding() }
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {availableLanguages.map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.languageOption,
                  currentLanguage === lang && styles.selectedLanguageOption
                ]}
                onPress={() => handleLanguageChange(lang)}
                activeOpacity={0.7}
              >
                <View style={styles.languageOptionLeft}>
                  <Text style={styles.languageOptionFlag}>{getLanguageFlag(lang)}</Text>
                  <View>
                    <Text style={[
                      styles.languageOptionText,
                      currentLanguage === lang && styles.selectedLanguageOptionText
                    ]}>
                      {getLanguageName(lang)}
                    </Text>
                    <Text style={styles.languageOptionCode}>{lang.toUpperCase()}</Text>
                  </View>
                </View>
                {currentLanguage === lang && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={24} color="#007bff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Bottom Tabs */}
      <View style={[styles.tabBar, { height: tabBarHeight }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "overview" && styles.activeTab]} 
          onPress={() => setActiveTab("overview")}
        >
          <Ionicons name="home" size={24} color={activeTab === "overview" ? "#007bff" : "#999"} />
          <Text style={[styles.tabText, activeTab === "overview" && styles.activeTabText]}>
            {t('admin.tabs.overview')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === "funds" && styles.activeTab]} 
          onPress={() => setActiveTab("funds")}
        >
          <Ionicons name="wallet" size={24} color={activeTab === "funds" ? "#007bff" : "#999"} />
          <Text style={[styles.tabText, activeTab === "funds" && styles.activeTabText]}>
            {t('participant.myFunds')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === "loans" && styles.activeTab]} 
          onPress={() => setActiveTab("loans")}
        >
          <Ionicons name="cash" size={24} color={activeTab === "loans" ? "#007bff" : "#999"} />
          <Text style={[styles.tabText, activeTab === "loans" && styles.activeTabText]}>
            {t('participant.myLoans')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === "notifications" && styles.activeTab]} 
          onPress={() => setActiveTab("notifications")}
        >
          <Ionicons name="notifications" size={24} color={activeTab === "notifications" ? "#007bff" : "#999"} />
          <Text style={[styles.tabText, activeTab === "notifications" && styles.activeTabText]}>
            {t('admin.tabs.notifications')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8f9fa" 
  },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingHorizontal: width * 0.05,
    paddingTop: 15, 
    paddingBottom: 15,
  },
  greetingContainer: {
    flex: 1,
    marginRight: 10,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    minWidth: 70,
    justifyContent: 'center',
  },
  languageFlag: {
    fontSize: 16,
  },
  languageCode: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  greeting: { fontSize: 14, color: "#666" },
  userName: { 
    fontSize: width < 360 ? 18 : 22, 
    fontWeight: "bold", 
    color: "#333",
    flexWrap: 'wrap',
  },
  logoutButton: { 
    backgroundColor: "#F44336", 
    width: 38, 
    height: 38, 
    borderRadius: 19, 
    justifyContent: "center", 
    alignItems: "center",
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  selectedLanguageOption: {
    backgroundColor: '#f0f7ff',
  },
  languageOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageOptionFlag: {
    fontSize: 28,
  },
  languageOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  selectedLanguageOptionText: {
    color: '#007bff',
    fontWeight: '700',
  },
  languageOptionCode: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  checkmarkContainer: {
    marginLeft: 10,
  },

  overviewContainer: { 
    padding: width * 0.04, 
  },
  summaryCards: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: 20,
    gap: 12,
  },
  desktopSummaryCards: {
    justifyContent: "flex-start",
    gap: 20,
  },
  summaryCard: { 
    flex: 1, 
    padding: width < 360 ? 16 : 20, 
    borderRadius: 20, 
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  desktopSummaryCard: {
    flex: 0,
    width: 200,
    padding: 24,
  },
  paidCard: {
    backgroundColor: "#4CAF50",
  },
  pendingCard: {
    backgroundColor: "#FF9800",
  },
  summaryIconContainer: {
    marginBottom: 8,
  },
  summaryAmount: { fontSize: width < 360 ? 20 : 24, fontWeight: "bold", color: "#fff", marginBottom: 5 },
  summaryLabel: { fontSize: 13, color: "#fff", opacity: 0.95, fontWeight: '500' },
  statsSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 15 },
  statsContainer: { flexDirection: "row", justifyContent: "space-between" },
  desktopStatsContainer: {
    justifyContent: "flex-start",
    gap: 20,
  },
  statItem: { alignItems: "center", flex: 1 },
  statIcon: { width: 54, height: 54, borderRadius: 27, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  statNumber: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 4 },
  statLabel: { fontSize: 11, color: "#666", textAlign: 'center' },
  card: { backgroundColor: "#fff", padding: 20, borderRadius: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  desktopCard: {
    maxWidth: 600,
    padding: 24,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 15 },
  activityItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  activityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#007bff", marginRight: 12, marginTop: 6 },
  activityContent: { flex: 1 },
  activityText: { fontSize: 14, color: "#333", marginBottom: 4 },
  activityTime: { fontSize: 12, color: "#666" },
  noDataText: { textAlign: "center", color: "#999", fontStyle: "italic", marginVertical: 10 },

  // Funds
  fundsContainer: { paddingTop: 16 },
  fundItem: { flexDirection: "row", backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12, marginHorizontal: 16, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  paidItem: { borderLeftWidth: 4, borderLeftColor: "#4CAF50" },
  pendingItem: { borderLeftWidth: 4, borderLeftColor: "#FF9800" },
  overdueItem: { borderLeftWidth: 4, borderLeftColor: "#F44336" },
  fundTitle: { fontWeight: "bold", fontSize: 18, marginBottom: 8, color: "#333" },
  statusContainer: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  statusIndicator: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusPaid: { backgroundColor: "#4CAF50" },
  statusPending: { backgroundColor: "#FF9800" },
  statusOverdue: { backgroundColor: "#F44336" },
  paid: { color: "#4CAF50", fontWeight: "600", fontSize: 12 },
  pending: { color: "#FF9800", fontWeight: "600", fontSize: 12 },
  overdue: { color: "#F44336", fontWeight: "600", fontSize: 12 },
  fundDate: { fontSize: 12, color: "#666" },
  payButton: { backgroundColor: "#007bff", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  payButtonText: { color: "#fff", fontWeight: "600", fontSize: 12 },

  // Loans
  loansContainer: { paddingTop: 16 },
  loanCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loanHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  loanAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  loanDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 14,
    flexShrink: 1,
  },

  // Notifications
  notificationsContainer: { paddingTop: 16 },
  notificationsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  markAllRead: { color: "#007bff", fontWeight: "600", fontSize: 13 },
  notificationItem: { backgroundColor: "#fff", padding: 16, marginHorizontal: 16, marginBottom: 12, borderRadius: 12, flexDirection: "row", alignItems: "flex-start", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  unreadNotification: { backgroundColor: "#f0f7ff", borderLeftWidth: 3, borderLeftColor: "#007bff" },
  notificationContent: { flex: 1, marginLeft: 12 },
  notificationMessage: { fontSize: 14, color: "#333", marginBottom: 4, lineHeight: 20 },
  notificationTime: { fontSize: 12, color: "#666" },
  unreadIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#007bff", marginTop: 6 },

  // Tabs - Updated for better navigation bar compatibility
  tabBar: { 
    flexDirection: "row", 
    borderTopWidth: 1, 
    borderTopColor: "#eee", 
    backgroundColor: "#fff", 
    position: "absolute", 
    bottom: 0, 
    left: 0, 
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? (height > 800 ? 20 : 10) : 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 8,
  },
  tab: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    paddingVertical: 8,
  },
  tabText: { 
    fontSize: 10, 
    color: "#999", 
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: "#007bff",
  },
  activeTabText: { 
    color: "#007bff", 
    fontWeight: "700",
  },

  emptyState: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyStateText: { 
    color: "#999", 
    fontSize: 16, 
    marginTop: 12,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    color: "#999",
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyContainer: { flexGrow: 1, justifyContent: "center" },
});

export default ParticipantDashboard;