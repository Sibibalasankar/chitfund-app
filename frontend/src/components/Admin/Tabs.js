import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useData } from "../../contexts/DataContext";
import { useTranslation } from "../../hooks/useTranslation"; // ✅ Add translation hook

const AdminTabs = ({ activeTab, setActiveTab, notifications }) => {
  const { fetchNotifications } = useData();
  const [isFundFormVisible, setFundFormVisible] = useState(false);
  const { t } = useTranslation(); // ✅ Initialize translation hook

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
            numberOfLines={1} // ✅ Prevent text overflow
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
    textAlign: "center", // ✅ Center align text
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