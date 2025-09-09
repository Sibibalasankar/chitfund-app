import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useData } from "../../contexts/DataContext"; // ✅ get context

const AdminTabs = ({ activeTab, setActiveTab, notifications }) => {
  const { fetchNotifications } = useData(); // ✅ re-fetch notifications after marking read
  const [isFundFormVisible, setFundFormVisible] = useState(false);

  // ✅ Use same API base URL as DataContext
  const API_BASE_URL = "https://chitfund-app-4b4s.onrender.com/api";

  const tabs = [
    { key: "overview", icon: "dashboard", label: "Overview", iconSize: 24 },
    { key: "users", icon: "people", label: "Users", iconSize: 24 },
    { key: "funds", icon: "account-balance", label: "Funds", iconSize: 24 },
    { key: "loans", icon: "attach-money", label: "Loans", iconSize: 24 }, // <-- Added Loans tab
    {
      key: "notifications",
      icon: "notifications",
      label: "Alerts",
      iconSize: 24,
      badge: (notifications || []).filter((n) => !n.isRead).length,
    },
  ];

  const handleAddFund = () => {
    setFundFormVisible(true);
  };

  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.activeTab]}
          onPress={async () => {
            setActiveTab(tab.key);

            // ✅ When opening notifications, mark them as read on backend + refresh state
            if (tab.key === "notifications") {
              try {
                await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
                  method: "PUT",
                });
                await fetchNotifications(); // ✅ update context state
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
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
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
