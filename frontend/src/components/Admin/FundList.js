import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from '../../hooks/useTranslation';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;
const isVerySmallScreen = screenWidth < 320;

// Format date professionally
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  
  const diffDays = Math.ceil((compareDate - today) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Get urgency tag
const getUrgencyTag = (dueDate) => {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return { text: 'Due Today', color: '#ff9800' };
  if (diffDays > 0 && diffDays <= 3) return { text: `${diffDays}d left`, color: '#ffc107' };
  if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, color: '#f44336' };
  return null;
};

const FundList = ({ funds = [], refreshing, onRefresh, onUpdateStatus, onEditFund }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOption, setSortOption] = useState('recent');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loadingId, setLoadingId] = useState(null);
  const { t } = useTranslation();

  const displayedFunds = useMemo(() => {
    let filtered = (funds || []).filter(Boolean);

    if (filterStatus !== 'all') {
      filtered = filtered.filter(f => f?.status === filterStatus);
    }

    filtered.sort((a, b) => {
      if (sortOption === 'amount') {
        return sortOrder === 'asc' ? (a?.amount || 0) - (b?.amount || 0) : (b?.amount || 0) - (a?.amount || 0);
      } else if (sortOption === 'dueDate') {
        return sortOrder === 'asc'
          ? new Date(a?.dueDate || 0) - new Date(b?.dueDate || 0)
          : new Date(b?.dueDate || 0) - new Date(a?.dueDate || 0);
      } else {
        const dateA = a?.createdAt || a?._id || 0;
        const dateB = b?.createdAt || b?._id || 0;
        return sortOrder === 'asc' ? new Date(dateA) - new Date(dateB) : new Date(dateB) - new Date(dateA);
      }
    });

    return filtered;
  }, [funds, filterStatus, sortOption, sortOrder]);

  // Get shorter text for small screens
  const getFilterText = (status) => {
    if (isVerySmallScreen) {
      return status === 'all' ? t('fundList.all') :
             status === 'paid' ? t('admin.status.paid') :
             t('admin.status.pending');
    }
    
    return status === 'all' ? t('fundList.all') :
           status === 'paid' ? t('admin.status.paid') :
           t('admin.status.pending');
  };

  const getSortText = (option) => {
    if (isVerySmallScreen) {
      return option === 'recent' ? t('fundList.recent') : 
             option === 'dueDate' ? 'Due' : 
             'Amount';
    }
    
    return option === 'recent' ? t('fundList.recent') : 
           option === 'dueDate' ? t('fundList.dueDate') : 
           t('fundList.amount');
  };

  const renderFundItem = ({ item }) => {
    if (!item) return null;

    const participantName = item?.participantId?.name || t('userList.unknown');
    const urgency = item?.status === 'pending' ? getUrgencyTag(item?.dueDate) : null;

    return (
      <View style={styles.listItem}>
        <View style={styles.itemContent}>
          {/* Header */}
          <View style={styles.fundHeader}>
            <View style={styles.nameContainer}>
              <View style={styles.avatarSmall}>
                <Text style={styles.avatarText}>{participantName.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.nameAmountGroup}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {participantName}
                </Text>
                <View style={styles.amountRow}>
                  <Text style={styles.currency}>₹</Text>
                  <Text style={styles.amount}>{item?.amount?.toLocaleString('en-IN') || 0}</Text>
                </View>
              </View>
            </View>
            <View
              style={[
                styles.statusBadge,
                item?.status === "paid" ? styles.paidBadge : styles.pendingBadge,
              ]}
            >
              <Text style={styles.statusText}>
                {item?.status === "paid" ? t('admin.status.paid') : t('admin.status.pending')}
              </Text>
            </View>
          </View>

          {/* Date Details */}
          <View style={styles.dateContainer}>
            <View style={styles.dateRow}>
              <Icon name="event" size={14} color="#666" />
              <Text style={styles.dateLabel}>Due:</Text>
              <Text style={styles.dateValue}>{formatDate(item?.dueDate)}</Text>
              {urgency && (
                <View style={[styles.urgencyTag, { backgroundColor: urgency.color }]}>
                  <Text style={styles.urgencyText}>{urgency.text}</Text>
                </View>
              )}
            </View>

            {item?.paymentDate && (
              <View style={styles.dateRow}>
                <Icon name="check-circle" size={14} color="#4caf50" />
                <Text style={styles.dateLabel}>Paid:</Text>
                <Text style={styles.datePaid}>{formatDate(item.paymentDate)}</Text>
              </View>
            )}

            {item?.adminNote && (
              <View style={styles.noteRow}>
                <Icon name="notes" size={14} color="#999" />
                <Text style={styles.noteText} numberOfLines={2}>
                  {item.adminNote}
                </Text>
              </View>
            )}
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              onPress={() => onEditFund(item)} 
              style={styles.editButton}
              activeOpacity={0.7}
            >
              <Icon name="edit" size={16} color="#667eea" />
              <Text style={styles.editButtonText}>{t('admin.buttons.edit')}</Text>
            </TouchableOpacity>

            {item?.status === 'pending' && (
              <TouchableOpacity
                disabled={loadingId === item?._id}
                onPress={async () => {
                  try {
                    setLoadingId(item?._id);
                    await onUpdateStatus(item?._id || item?.id, 'paid', participantName);
                  } finally {
                    setLoadingId(null);
                  }
                }}
                activeOpacity={0.7}
                style={styles.payButtonWrapper}
              >
                <LinearGradient
                  colors={['#4caf50', '#66bb6a']}
                  style={[styles.payButton, loadingId === item?._id && styles.disabledButton]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loadingId === item?._id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Icon name="check" size={18} color="#fff" />
                      <Text style={styles.payButtonText}>{t('fundList.markPaid')}</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter + Sort bar */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterSortBar}
      >
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>{t('fundList.filter')}:</Text>
          <View style={styles.filterButtonsContainer}>
            {['all', 'paid', 'pending'].map(status => (
              <TouchableOpacity
                key={status}
                style={[styles.filterButton, filterStatus === status && styles.filterSelected]}
                onPress={() => setFilterStatus(status)}
                activeOpacity={0.7}
              >
                <Text 
                  style={filterStatus === status ? styles.filterTextSelected : styles.filterText}
                  numberOfLines={1}
                  adjustsFontSizeToFit={true}
                  minimumFontScale={0.8}
                >
                  {getFilterText(status)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.sortGroup}>
          <Text style={styles.filterLabel}>{t('fundList.sort')}:</Text>
          <View style={styles.sortButtonsContainer}>
            {['recent', 'dueDate', 'amount'].map(option => (
              <TouchableOpacity
                key={option}
                style={[styles.filterButton, sortOption === option && styles.filterSelected]}
                onPress={() => setSortOption(option)}
                activeOpacity={0.7}
              >
                <Text 
                  style={sortOption === option ? styles.filterTextSelected : styles.filterText}
                  numberOfLines={1}
                  adjustsFontSizeToFit={true}
                  minimumFontScale={0.8}
                >
                  {getSortText(option)}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.sortOrderButton}
              onPress={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              activeOpacity={0.7}
            >
              <Icon 
                name={sortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward'} 
                size={18} 
                color="#667eea" 
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Fund list */}
      <FlatList
        data={displayedFunds}
        keyExtractor={(item) => item?._id?.toString() || item?.id?.toString() || Math.random().toString()}
        renderItem={renderFundItem}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#667eea']} 
            tintColor="#667eea"
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="account-balance-wallet" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>
              {t('fundList.noFunds') || 'No funds found'}
            </Text>
          </View>
        }
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
    paddingHorizontal: 12, 
    paddingBottom: 16,
    paddingTop: 8,
  },
  listItem: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 14, 
    marginBottom: 10, 
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  itemContent: {
    flex: 1,
  },
  fundHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  nameAmountGroup: {
    flex: 1,
  },
  itemTitle: { 
    fontSize: isSmallScreen ? 15 : 16, 
    fontWeight: '700', 
    color: '#333',
    marginBottom: 2,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
    marginRight: 2,
  },
  amount: { 
    fontSize: isSmallScreen ? 15 : 16, 
    fontWeight: '700', 
    color: '#333',
  },
  statusBadge: { 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 12,
    borderWidth: 1,
  },
  paidBadge: { 
    backgroundColor: '#e8f5e9',
    borderColor: '#a5d6a7',
  },
  pendingBadge: { 
    backgroundColor: '#fff3e0',
    borderColor: '#ffcc80',
  },
  statusText: { 
    fontSize: isSmallScreen ? 10 : 11, 
    fontWeight: '700', 
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    gap: 6,
  },
  dateRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
    marginRight: 6,
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
    flex: 1,
  },
  datePaid: {
    fontSize: 13,
    color: '#4caf50',
    fontWeight: '600',
    flex: 1,
  },
  urgencyTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  urgencyText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  noteText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#666',
    flex: 1,
    fontStyle: 'italic',
  },
  buttonRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 8,
  },
  editButton: { 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f7ff',
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    borderRadius: 8,
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#667eea',
  },
  editButtonText: { 
    color: '#667eea', 
    fontWeight: '700', 
    marginLeft: 6,
    fontSize: isSmallScreen ? 13 : 14,
  },
  payButtonWrapper: {
    flex: 1,
  },
  payButton: { 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12, 
    paddingVertical: 11, 
    borderRadius: 8,
  },
  payButtonText: { 
    color: '#fff', 
    fontWeight: '700', 
    marginLeft: 6,
    fontSize: isSmallScreen ? 13 : 14,
  },
  disabledButton: {
    opacity: 0.6,
  },
  filterSortBar: { 
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    minHeight: 60,
  },
  filterGroup: { 
    flexDirection: 'row', 
    alignItems: 'center',
    marginRight: 16,
  },
  sortGroup: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: { 
    marginRight: 8, 
    fontWeight: '600', 
    color: '#333',
    fontSize: isVerySmallScreen ? 12 : isSmallScreen ? 13 : 14,
  },
  filterButton: { 
    paddingHorizontal: isVerySmallScreen ? 8 : isSmallScreen ? 10 : 12, 
    paddingVertical: isVerySmallScreen ? 5 : isSmallScreen ? 6 : 7, 
    borderRadius: 16, 
    borderWidth: 1.5, 
    borderColor: '#667eea', 
    marginRight: 6,
    backgroundColor: '#f5f7ff',
    minWidth: isVerySmallScreen ? 50 : 60,
    alignItems: 'center',
  },
  filterSelected: { 
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterText: { 
    color: '#667eea',
    fontSize: isVerySmallScreen ? 11 : isSmallScreen ? 12 : 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  filterTextSelected: { 
    color: '#fff',
    fontSize: isVerySmallScreen ? 11 : isSmallScreen ? 12 : 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  sortOrderButton: { 
    padding: 6,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default FundList;