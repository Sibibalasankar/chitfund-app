import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

// Mock data for demonstration
const mockFunds = [
  { id: 1, amount: 5000, status: 'paid', paymentDate: '2023-10-10', dueDate: '2023-10-05', adminNote: 'Payment received' },
  { id: 2, amount: 3000, status: 'pending', paymentDate: null, dueDate: '2023-10-15', adminNote: 'Awaiting payment' },
  { id: 3, amount: 2000, status: 'overdue', paymentDate: null, dueDate: '2023-10-01', adminNote: 'Please pay immediately' },
];

const mockNotifications = [
  { id: 1, message: 'Payment of ₹5000 received', type: 'payment', createdAt: '2023-10-10 14:30', isRead: true },
  { id: 2, message: 'Reminder: Payment of ₹3000 due on 2023-10-15', type: 'reminder', createdAt: '2023-10-12 10:15', isRead: false },
  { id: 3, message: 'New fund added to your account', type: 'info', createdAt: '2023-10-05 09:45', isRead: true },
];

const ParticipantDashboard = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [funds, setFunds] = useState(mockFunds);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
  logout();   // that's all
};


  const markNotificationAsRead = (notificationId) => {
    setNotifications(notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, isRead: true }
        : notification
    ));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      isRead: true
    })));
  };

  const renderFundItem = ({ item }) => (
    <View style={[styles.listItem, item.status === 'overdue' && styles.overdueItem]}>
      <View>
        <Text style={styles.itemTitle}>Amount: ₹{item.amount}</Text>
        <Text>Status: <Text style={styles[item.status]}>{item.status}</Text></Text>
        <Text>Due Date: {item.dueDate}</Text>
        {item.paymentDate && <Text>Payment Date: {item.paymentDate}</Text>}
        {item.adminNote && <Text>Note: {item.adminNote}</Text>}
      </View>
      {item.status === 'pending' && (
        <TouchableOpacity style={styles.payButton}>
          <Text style={styles.payButtonText}>Pay Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.isRead && styles.unreadNotification]}
      onPress={() => markNotificationAsRead(item.id)}
    >
      <Text style={styles.notificationMessage}>{item.message}</Text>
      <Text style={styles.notificationTime}>{item.createdAt}</Text>
      {!item.isRead && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Participant Dashboard</Text>
      <Text style={styles.welcome}>Welcome, {user?.name}!</Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={styles.tabText}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'funds' && styles.activeTab]}
          onPress={() => setActiveTab('funds')}
        >
          <Text style={styles.tabText}>My Funds</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
          onPress={() => setActiveTab('notifications')}
        >
          <Text style={styles.tabText}>Notifications</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'overview' && (
        <ScrollView>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Account Summary</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {(funds || []).filter(f => f.status === 'paid').length}
                </Text>
                <Text style={styles.statLabel}>Paid</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {(funds || []).filter(f => f.status === 'paid').length}
                </Text>
                <Text style={styles.statLabel}>Paid</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {(funds || []).filter(f => f.status === 'paid').length}
                </Text>
                <Text style={styles.statLabel}>Paid</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recent Activity</Text>
            <Text>• Payment of ₹5000 completed on Oct 10</Text>
            <Text>• New fund of ₹3000 added - Due Oct 15</Text>
            <Text>• Received payment reminder for ₹2000</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Profile Information</Text>
            <Text>Name: {user?.name}</Text>
            <Text>Email: {user?.email}</Text>
            <Text>Phone: {user?.phone}</Text>
            <Text>Member Since: {user?.joinedDate}</Text>
          </View>
        </ScrollView>
      )}

      {activeTab === 'funds' && (
        <FlatList
          data={funds}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderFundItem}
          style={styles.list}
        />
      )}

      {activeTab === 'notifications' && (
        <View style={styles.flexContainer}>
          <View style={styles.notificationsHeader}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <TouchableOpacity onPress={markAllNotificationsAsRead}>
              <Text style={styles.markAllRead}>Mark all as read</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderNotificationItem}
            style={styles.list}
          />
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  flexContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  welcome: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007bff',
  },
  tabText: {
    color: '#333',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
  },
  statLabel: {
    color: '#666',
  },
  list: {
    flex: 1,
  },
  listItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  overdueItem: {
    borderLeftWidth: 4,
    borderLeftColor: 'red',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  paid: {
    color: 'green',
    fontWeight: 'bold',
  },
  pending: {
    color: 'orange',
    fontWeight: 'bold',
  },
  overdue: {
    color: 'red',
    fontWeight: 'bold',
  },
  payButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  payButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  markAllRead: {
    color: '#007bff',
  },
  notificationItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    position: 'relative',
  },
  unreadNotification: {
    backgroundColor: '#e3f2fd',
  },
  notificationMessage: {
    fontSize: 16,
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: '#666',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007bff',
  },
  logoutButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'red',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ParticipantDashboard;