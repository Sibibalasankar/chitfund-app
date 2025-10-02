import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useData } from "../../contexts/DataContext";
import { useTranslation } from "../../hooks/useTranslation";
import { useResponsive } from "../../hooks/useResponsive";

const AdminTabs = ({ activeTab, setActiveTab, notifications }) => {
  const { fetchNotifications } = useData();
  const [isFundFormVisible, setFundFormVisible] = useState(false);
  const { t } = useTranslation();
  const { isDesktop, isTablet, getResponsiveFontSize, getResponsiveSpacing } = useResponsive();

  const API_BASE_URL = "https://chitfund-app-4b4s.onrender.com/api";

  const tabs = [
    { 
      key: "overview", 
      icon: "dashboard", 
      label: t('admin.tabs.overview'), // ✅ Translated label
      iconSize: 24 
    },
    { 
      key: "users", 
      icon: "people", 
      label: t('admin.tabs.users'), // ✅ Translated label
      iconSize: 24 
    },
    { 
      key: "funds", 
      icon: "account-balance", 
      label: t('admin.tabs.funds'), // ✅ Translated label
      iconSize: 24 
    },
    { 
      key: "loans", 
      icon: "attach-money", 
      label: t('admin.tabs.loans'), // ✅ Translated label
      iconSize: 24 
    },
    {
      key: "notifications",
      icon: "notifications",
      label: t('admin.tabs.notifications'), // ✅ Translated label
      iconSize: 24,
      badge: (notifications || []).filter((n) => !n.isRead).length,
    },
  ];

  const handleAddFund = () => {
    setFundFormVisible(true);
  };

  return (
    <>
      {isDesktop ? (
        // Desktop Sidebar Navigation
        <View style={styles.desktopSidebar}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>{t("admin.dashboardTitle")}</Text>
          </View>
          
          <ScrollView 
            style={styles.sidebarContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sidebarScrollContent}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.sidebarTab,
                  activeTab === tab.key && styles.sidebarActiveTab
                ]}
                onPress={async () => {
                  setActiveTab(tab.key);

                  if (tab.key === "notifications") {
                    try {
                      await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
                        method: "PUT",
                      });
                      await fetchNotifications();
                    } catch (err) {
                      console.error("Failed to mark notifications read:", err);
                    }
                  }
                }}
              >
                <View style={styles.sidebarTabContent}>
                  <View style={styles.sidebarIconContainer}>
                    <Icon
                      name={tab.icon}
                      size={24}
                      color={activeTab === tab.key ? "#007bff" : "#666"}
                    />
                    {tab.badge > 0 && (
                      <View style={styles.sidebarBadge}>
                        <Text style={styles.sidebarBadgeText}>{tab.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.sidebarTabText,
                      activeTab === tab.key && styles.sidebarActiveTabText,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : (
        // Mobile/Tablet Bottom Tabs
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={async () => {
                setActiveTab(tab.key);

                if (tab.key === "notifications") {
                  try {
                    await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
                      method: "PUT",
                    });
                    await fetchNotifications();
                  } catch (err) {
                    console.error("Failed to mark notifications read:", err);
                  }
                }
              }}
            >
              <View style={styles.tabIconContainer}>
                <Icon
                  name={tab.icon}
                  size={tab.iconSize}
                  color={activeTab === tab.key ? "#007bff" : "#666"}
                />
                {tab.badge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{tab.badge}</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.activeTabText,
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  // Desktop Sidebar Styles
  desktopSidebar: {
    width: 250,
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
    paddingTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  sidebarHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 20,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  sidebarContent: {
    flex: 1,
  },
  sidebarScrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  sidebarTab: {
    marginBottom: 8,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sidebarActiveTab: {
    backgroundColor: "#f0f7ff",
    borderLeftWidth: 4,
    borderLeftColor: "#007bff",
  },
  sidebarTabContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  sidebarIconContainer: {
    position: "relative",
    marginRight: 12,
  },
  sidebarTabText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
    flex: 1,
  },
  sidebarActiveTabText: {
    color: "#007bff",
    fontWeight: "600",
  },
  sidebarBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ff3b30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  sidebarBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  // Mobile/Tablet Bottom Tab Styles
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingVertical: 8,
    paddingHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  activeTab: {},
  tabIconContainer: {
    position: "relative",
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
  },
  activeTabText: {
    color: "#007bff",
    fontWeight: "600",
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ff3b30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default AdminTabs;