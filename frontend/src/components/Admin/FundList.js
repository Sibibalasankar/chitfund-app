import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const FundList = ({ funds = [], refreshing, onRefresh, onUpdateStatus, onEditFund }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOption, setSortOption] = useState('recent'); // default sort
  const [sortOrder, setSortOrder] = useState('desc'); // recently added first
  const [loadingId, setLoadingId] = useState(null); // 🔥 loader state

  const displayedFunds = useMemo(() => {
    let filtered = [...funds];

    // Filter by status
    if (filterStatus !== 'all') filtered = filtered.filter(f => f.status === filterStatus);

    // Sort
    filtered.sort((a, b) => {
      if (sortOption === 'amount') {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      else if (sortOption === 'dueDate') {
        return sortOrder === 'asc'
          ? new Date(a.dueDate) - new Date(b.dueDate)
          : new Date(b.dueDate) - new Date(a.dueDate);
      }
      else {
        const dateA = a.createdAt || a._id || 0;
        const dateB = b.createdAt || b._id || 0;

        return sortOrder === 'asc'
          ? new Date(dateA) - new Date(dateB)
          : new Date(dateB) - new Date(dateA);
      }
    });

    return filtered;
  }, [funds, filterStatus, sortOption, sortOrder]);

  const renderFundItem = ({ item }) => (
    <View style={styles.listItem}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.fundHeader}>
          <Text style={styles.itemTitle}>{item.participantId?.name || "Unknown"}</Text>
          <View
            style={[
              styles.statusBadge,
              item.status === "paid"
                ? styles.paidBadge
                : item.status === "pending"
                  ? styles.pendingBadge
                  : styles.overdueBadge,
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.fundDetails}>
          <View style={styles.detailRow}>
            <Icon name="attach-money" size={16} color="#333" />
            <Text style={styles.amount}>₹{item.amount}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="event" size={16} color="#666" />
            <Text style={styles.detailText}>Due: {item.dueDate}</Text>
          </View>

          {item.paymentDate && (
            <View style={styles.detailRow}>
              <Icon name="check-circle" size={16} color="#28a745" />
              <Text style={styles.detailText}>Paid: {item.paymentDate}</Text>
            </View>
          )}

          {item.adminNote && (
            <View style={styles.detailRow}>
              <Icon name="notes" size={16} color="#666" />
              <Text style={styles.detailText}>{item.adminNote}</Text>
            </View>
          )}
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={() => onEditFund(item)} style={styles.editButton}>
            <Icon name="edit" size={18} color="#fff" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>

          {item.status === 'pending' && (
            <TouchableOpacity
              disabled={loadingId === item._id}
              onPress={async () => {
                try {
                  setLoadingId(item._id);
                  await onUpdateStatus(item._id || item.id, 'paid', item.participantId?.name || "Unknown");
                } finally {
                  setLoadingId(null);
                }
              }}
            >
              <LinearGradient
                colors={['#28a745', '#81c784']}
                style={[
                  styles.payButton,
                  loadingId === item._id && { opacity: 0.7 }
                ]}
              >
                {loadingId === item._id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Icon name="check" size={20} color="#fff" />
                    <Text style={styles.payButtonText}>Mark Paid</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Filter + Sort bar */}
      <View style={styles.filterSortBar}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Filter:</Text>
          {['all', 'paid', 'pending'].map(status => (
            <TouchableOpacity
              key={status}
              style={[styles.filterButton, filterStatus === status && styles.filterSelected]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={filterStatus === status ? styles.filterTextSelected : styles.filterText}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sortGroup}>
          <Text style={styles.filterLabel}>Sort:</Text>
          {['recent', 'dueDate', 'amount'].map(option => (
            <TouchableOpacity
              key={option}
              style={[styles.filterButton, sortOption === option && styles.filterSelected]}
              onPress={() => setSortOption(option)}
            >
              <Text style={sortOption === option ? styles.filterTextSelected : styles.filterText}>
                {option === 'recent' ? 'Recent' : option === 'dueDate' ? 'Due Date' : 'Amount'}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.sortOrderButton}
            onPress={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          >
            <Icon name={sortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward'} size={20} color="#007bff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Fund list */}
      <FlatList
        data={displayedFunds}
        keyExtractor={(item) => item._id?.toString() || item.id?.toString() || Math.random().toString()}
        renderItem={renderFundItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#007bff']} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  listItem: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  fundHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  paidBadge: { backgroundColor: '#d4edda' },
  pendingBadge: { backgroundColor: '#fff3cd' },
  overdueBadge: { backgroundColor: '#f8d7da' },
  statusText: { fontSize: 12, fontWeight: 'bold', textTransform: 'capitalize' },
  fundDetails: { marginTop: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  amount: { fontSize: 16, fontWeight: 'bold', color: '#333', marginLeft: 8 },
  detailText: { marginLeft: 8, fontSize: 14, color: '#666' },
  buttonRow: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  editButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 6 },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  payButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 6 },
  filterSortBar: { paddingVertical: 8, marginBottom: 8, paddingLeft: 16, paddingRight: 8 },
  filterGroup: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 },
  sortGroup: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  filterLabel: { marginRight: 6, fontWeight: 'bold', color: '#333' },
  filterButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#007bff', marginRight: 6, marginBottom: 4 },
  filterSelected: { backgroundColor: '#007bff' },
  filterText: { color: '#007bff' },
  filterTextSelected: { color: '#fff' },
  sortOrderButton: { padding: 4 },
});

export default FundList;
