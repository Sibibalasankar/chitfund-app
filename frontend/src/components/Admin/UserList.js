import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const UserList = ({ 
  users = [],
  loans = [],
  refreshing, 
  onRefresh, 
  onEditUser, 
  onDeleteUser, 
  onToggleStatus 
}) => {
  const renderUserItem = ({ item }) => (
    
    <View style={[styles.listItem, item.status === 'inactive' && styles.inactiveItem]}>
      <View style={styles.itemContent}>
        <View style={styles.userHeader}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <View style={[styles.statusBadge, item.status === 'active' ? styles.activeBadge : styles.inactiveBadge]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.userDetails}>
          <View style={styles.detailRow}>
            <Icon name="phone" size={16} color="#666" />
            <Text style={styles.detailText}>{item.phone}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Icon name="person" size={16} color="#666" />
            <Text style={styles.detailText}>{item.role}</Text>
          </View>
          
          {item.joinedDate && (
            <View style={styles.detailRow}>
              <Icon name="calendar-today" size={16} color="#666" />
              <Text style={styles.detailText}>Joined: {item.joinedDate}</Text>
            </View>
          )}
          
          <View style={styles.financialInfo}>
            <View style={styles.amountContainer}>
              <Icon name="account-balance-wallet" size={16} color="#28a745" />
              <Text style={styles.amountText}>₹{item.totalPaid || 0}</Text>
              <Text style={styles.amountLabel}>Paid</Text>
            </View>
            
            <View style={styles.amountContainer}>
              <Icon name="pending-actions" size={16} color="#dc3545" />
              <Text style={styles.amountText}>₹{item.pendingAmount || 0}</Text>
              <Text style={styles.amountLabel}>Pending</Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.itemActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEditUser(item)}
        >
          <Icon name="edit" size={18} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.statusButton]}
          onPress={() => onToggleStatus(item)}
        >
          <Icon 
            name={item.status === 'active' ? 'pause' : 'play-arrow'} 
            size={18} 
            color="#fff" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDeleteUser(item._id || item.id, item.name)}
        >
          <Icon name="delete" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id?.toString() || item.id?.toString() || Math.random().toString()}
        renderItem={renderUserItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { flex: 1 },
  listItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inactiveItem: { opacity: 0.7, backgroundColor: '#f8f9fa' },
  itemContent: { flex: 1 },
  userHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  activeBadge: { backgroundColor: '#d4edda' },
  inactiveBadge: { backgroundColor: '#f8d7da' },
  statusText: { fontSize: 12, fontWeight: 'bold', textTransform: 'capitalize' },
  activeStatus: { color: '#155724' },
  inactiveStatus: { color: '#721c24' },
  userDetails: { marginTop: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  detailText: { marginLeft: 8, fontSize: 14, color: '#666' },
  financialInfo: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f1f1' },
  amountContainer: { alignItems: 'center' },
  amountText: { fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 2 },
  amountLabel: { fontSize: 12, color: '#666' },
  itemActions: { flexDirection: 'column', marginLeft: 10 },
  actionButton: { padding: 8, borderRadius: 6, marginBottom: 8, alignItems: 'center', justifyContent: 'center', minWidth: 40 },
  editButton: { backgroundColor: '#ffc107' },
  statusButton: { backgroundColor: '#17a2b8' },
  deleteButton: { backgroundColor: '#dc3545' },
});

export default UserList;