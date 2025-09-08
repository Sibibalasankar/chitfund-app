import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

const FundList = ({ funds = [], refreshing, onRefresh, onUpdateStatus }) => {
  const [filterStatus, setFilterStatus] = useState('all'); 
  const [sortOption, setSortOption] = useState('dueDate'); 
  const [sortOrder, setSortOrder] = useState('asc'); 

  const displayedFunds = useMemo(() => {
    let filtered = [...funds];
    if (filterStatus !== 'all') filtered = filtered.filter(f => f.status === filterStatus);

    filtered.sort((a, b) => {
      if (sortOption === 'amount') return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      return sortOrder === 'asc'
        ? new Date(a.dueDate) - new Date(b.dueDate)
        : new Date(b.dueDate) - new Date(a.dueDate);
    });

    return filtered;
  }, [funds, filterStatus, sortOption, sortOrder]);

  const renderFundItem = ({ item }) => (
  <View style={styles.listItem}>
    <View style={{ flex: 1 }}>
      <View style={styles.fundHeader}>
        <Text style={styles.itemTitle}>
          {item.participantId?.name || "Unknown"}
        </Text>
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
      </View>

      {item.status === 'pending' && (
        <TouchableOpacity onPress={() => onUpdateStatus(item._id || item.id, 'paid', item.participantName)}>
          <LinearGradient colors={['#28a745', '#81c784']} style={styles.payButton}>
            <Icon name="check" size={20} color="#fff" />
            <Text style={styles.payButtonText}>Mark Paid</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
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
          {['dueDate', 'amount'].map(option => (
            <TouchableOpacity
              key={option}
              style={[styles.filterButton, sortOption === option && styles.filterSelected]}
              onPress={() => setSortOption(option)}
            >
              <Text style={sortOption === option ? styles.filterTextSelected : styles.filterText}>
                {option === 'dueDate' ? 'Due Date' : 'Amount'}
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

      <FlatList
        data={displayedFunds}
        keyExtractor={(item) => item._id?.toString() || item.id?.toString()}
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
    flexDirection: 'row',
    alignItems: 'center',
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
  statusText: { fontSize: 12, fontWeight: 'bold', color: '#155724' },
  fundDetails: { marginTop: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  amount: { fontSize: 16, fontWeight: 'bold', color: '#333', marginLeft: 8 },
  detailText: { marginLeft: 8, fontSize: 14, color: '#666' },
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
