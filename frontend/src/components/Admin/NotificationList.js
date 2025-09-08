import React from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

const NotificationList = ({ notifications = [], refreshing, onRefresh }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'payment_received': return 'account-balance-wallet';
      case 'payment_reminder': return 'notifications';
      case 'fund_added': return 'attach-money';
      case 'user_added': return 'person-add';
      default: return 'info';
    }
  };

  const getGradientColor = (type) => {
    switch (type) {
      case 'payment_received': return ['#28a745', '#81c784'];
      case 'payment_reminder': return ['#ffc107', '#ffd54f'];
      case 'fund_added': return ['#17a2b8', '#4dd0e1'];
      case 'user_added': return ['#6f42c1', '#9c27b0'];
      default: return ['#6c757d', '#9e9e9e'];
    }
  };

  const renderNotificationItem = ({ item }) => (
    <View style={[styles.notificationItem, !item.isRead && styles.unreadNotification]}>
      <LinearGradient
        colors={getGradientColor(item.type)}
        style={styles.iconContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Icon name={getIcon(item.type)} size={22} color="#fff" />
      </LinearGradient>

      <View style={styles.notificationContent}>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id?.toString()}
        renderItem={renderNotificationItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#007bff']} />}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  unreadNotification: {
    borderLeftWidth: 5,
    borderLeftColor: '#007bff',
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  notificationContent: { flex: 1 },
  notificationMessage: { fontSize: 15, color: '#1a1a1a', fontWeight: '500', marginBottom: 4 },
  notificationTime: { fontSize: 13, color: '#6c757d' },
});

export default NotificationList;
