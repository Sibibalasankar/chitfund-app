import React from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

const NotificationList = ({ 
  notifications = [], 
  refreshing, 
  onRefresh, 
  language = 'english',
  onNotificationPress 
}) => {
  const getIcon = (type) => {
    switch (type) {
      case 'payment_received': return 'account-balance-wallet';
      case 'payment_reminder': return 'notifications';
      case 'fund_added': return 'attach-money';
      case 'fund_updated': return 'update';
      case 'fund_deleted': return 'money-off';
      case 'loan_added': return 'credit-card';
      case 'loan_updated': return 'update';
      case 'loan_deleted': return 'credit-card-off';
      case 'user_added': return 'person-add';
      case 'user_updated': return 'person';
      case 'user_deleted': return 'person-remove';
      default: return 'info';
    }
  };

  const getGradientColor = (type) => {
    switch (type) {
      case 'payment_received': return ['#28a745', '#81c784'];
      case 'payment_reminder': return ['#ffc107', '#ffd54f'];
      case 'fund_added': return ['#17a2b8', '#4dd0e1'];
      case 'fund_updated': return ['#17a2b8', '#4dd0e1'];
      case 'fund_deleted': return ['#dc3545', '#e57373'];
      case 'loan_added': return ['#6f42c1', '#9c27b0'];
      case 'loan_updated': return ['#6f42c1', '#9c27b0'];
      case 'loan_deleted': return ['#dc3545', '#e57373'];
      case 'user_added': return ['#28a745', '#81c784'];
      case 'user_updated': return ['#17a2b8', '#4dd0e1'];
      case 'user_deleted': return ['#dc3545', '#e57373'];
      default: return ['#6c757d', '#9e9e9e'];
    }
  };

  const getNotificationMessage = (item) => {
    console.log('🔍 Full Notification Data:', JSON.stringify(item, null, 2));
    
    // Case 1: If message is missing or undefined
    if (!item.message) {
      console.log('❌ Message is missing, using fallback');
      return createFallbackMessage(item, language);
    }
    
    // Case 2: If message is already a string
    if (typeof item.message === 'string') {
      return item.message;
    }
    
    // Case 3: If message is an object with bilingual support
    if (item.message && typeof item.message === 'object') {
      // Check if the object has english/tamil properties
      if (item.message[language]) {
        return item.message[language];
      }
      if (item.message.english) {
        return item.message.english;
      }
      if (item.message.tamil) {
        return item.message.tamil;
      }
    }
    
    // Case 4: Final fallback
    return createFallbackMessage(item, language);
  };

  const createFallbackMessage = (item, lang) => {
    console.log('🔍 Creating fallback message for:', item.type);
    
    // Since we don't have user names in the notification data,
    // we'll create generic messages
    const messages = {
      loan_added: {
        english: `New loan has been assigned`,
        tamil: `புதிய கடன் வழங்கப்பட்டது`
      },
      loan_updated: {
        english: `Loan has been updated`,
        tamil: `கடன் புதுப்பிக்கப்பட்டது`
      },
      loan_deleted: {
        english: `Loan has been deleted`,
        tamil: `கடன் நீக்கப்பட்டது`
      },
      loan: {
        english: `Loan operation completed`,
        tamil: `கடன் செயல்பாடு முடிக்கப்பட்டது`
      },
      fund_added: {
        english: `New fund has been added`,
        tamil: `புதிய நிதி சேர்க்கப்பட்டது`
      },
      fund_updated: {
        english: `Fund has been updated`,
        tamil: `நிதி புதுப்பிக்கப்பட்டது`
      },
      fund_deleted: {
        english: `Fund has been deleted`,
        tamil: `நிதி நீக்கப்பட்டது`
      },
      payment_received: {
        english: `Payment has been received`,
        tamil: `பணம் பெறப்பட்டது`
      },
      user_added: {
        english: `New user has been added`,
        tamil: `புதிய பயனர் சேர்க்கப்பட்டார்`
      },
      user_updated: {
        english: `User details have been updated`,
        tamil: `பயனர் விவரங்கள் புதுப்பிக்கப்பட்டன`
      },
      user_deleted: {
        english: `User has been removed`,
        tamil: `பயனர் நீக்கப்பட்டார்`
      }
    };

    const messageSet = messages[item.type] || {
      english: 'New notification',
      tamil: 'புதிய அறிவிப்பு'
    };

    return messageSet[lang] || messageSet.english;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return language === 'tamil' ? 'சில நிமிடங்களுக்கு முன்பு' : 'Few minutes ago';
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      if (language === 'tamil') {
        return hours === 1 ? '1 மணி நேரத்திற்கு முன்பு' : `${hours} மணி நேரத்திற்கு முன்பு`;
      } else {
        return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
      }
    } else {
      const options = { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      };
      return date.toLocaleDateString(undefined, options);
    }
  };

  const renderNotificationItem = ({ item }) => {
    const message = getNotificationMessage(item);
    const time = formatTime(item.createdAt);

    return (
      <TouchableOpacity 
        style={[styles.notificationItem, !item.isRead && styles.unreadNotification]}
        onPress={() => onNotificationPress && onNotificationPress(item)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={getGradientColor(item.type)}
          style={styles.iconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon name={getIcon(item.type)} size={22} color="#fff" />
        </LinearGradient>

        <View style={styles.notificationContent}>
          <Text style={styles.notificationMessage}>
            {message}
          </Text>
          <View style={styles.notificationFooter}>
            <Text style={styles.notificationTime}>
              {time}
            </Text>
            {!item.isRead && (
              <View style={styles.unreadDot} />
            )}
          </View>
        </View>

        {!item.isRead && (
          <View style={styles.unreadIndicator} />
        )}
      </TouchableOpacity>
    );
  };

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Icon name="notifications-off" size={64} color="#ccc" />
      <Text style={styles.emptyText}>
        {language === 'tamil' ? 'அறிவிப்புகள் இல்லை' : 'No notifications'}
      </Text>
      <Text style={styles.emptySubtext}>
        {language === 'tamil' 
          ? 'புதிய அறிவிப்புகள் இங்கே தோன்றும்' 
          : 'New notifications will appear here'
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
        renderItem={renderNotificationItem}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#007bff']}
            tintColor="#007bff"
          />
        }
        ListEmptyComponent={EmptyComponent}
        contentContainerStyle={notifications.length === 0 ? styles.emptyListContent : styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
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
    position: 'relative',
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
    backgroundColor: '#f8fbff',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007bff',
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  notificationContent: { 
    flex: 1,
  },
  notificationMessage: { 
    fontSize: 15, 
    color: '#1a1a1a', 
    fontWeight: '500', 
    marginBottom: 6,
    lineHeight: 20,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTime: { 
    fontSize: 13, 
    color: '#6c757d',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007bff',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#6c757d',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9e9e9e',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NotificationList;