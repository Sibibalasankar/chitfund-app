import { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTranslation } from '../../hooks/useTranslation';

const LoanList = ({
  loans = [],
  onEditLoan,
  onDeleteLoan,
  onUpdateStatus,
  fetchLoans,
  updateLoan
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation();

  const formatCurrency = (amount) => `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDate = (date) => {
    if (!date) return t('userList.notAvailable');
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchLoans?.();
    } catch (err) {
      console.error("Error refreshing loans:", err);
    } finally {
      setRefreshing(false);
    }
  }, [fetchLoans]);

  const handleAddInstallmentPress = async (loan) => {
    if (!loan || !loan._id) return;

    if (loan.paidInstallments < loan.totalInstallments) {
      const newPaidInstallments = loan.paidInstallments + 1;

      try {
        await updateLoan(loan._id, {
          paidInstallments: newPaidInstallments
        });

        await fetchLoans();

        Alert.alert(
          t('common.success'),
          t('loanForm.success.paymentAdded', { name: loan.participantId?.name })
        );
      } catch (err) {
        Alert.alert(t('common.error'), err.message || t('common.error'));
      }
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'paid': t('loanList.status.paid'),
      'pending': t('loanList.status.pending'),
      'partially_paid': t('loanList.status.partiallyPaid'),
      'partially paid': t('loanList.status.partiallyPaid')
    };
    return statusMap[status?.toLowerCase()] || status || t('loanList.status.pending');
  };

  const renderLoanItem = ({ item }) => {
    if (!item) return null;
    const participantName = item.participantId?.name || item.participantName || t('userList.unknown');
    const remainingInstallments = item.totalInstallments - item.paidInstallments;
    const remainingAmount = item.remainingAmount || (item.installmentAmount * remainingInstallments);
    const progress = (item.paidInstallments / item.totalInstallments) * 100;

    const isPaid = item.status?.toLowerCase() === "paid";
    const isPartial = item.status?.toLowerCase() === "partially paid" || item.status?.toLowerCase() === "partially_paid";

    return (
      <View style={styles.loanCard}>
        {/* Top Section - Name & Status */}
        <View style={styles.cardHeader}>
          <View style={styles.nameSection}>
            <Text style={styles.participantName}>{participantName}</Text>
            <Text style={styles.loanReference}>Loan #{item._id?.slice(-8)}</Text>
          </View>
          <View style={[
            styles.statusPill,
            isPaid ? styles.statusPaid : isPartial ? styles.statusPartial : styles.statusPending
          ]}>
            <Text style={styles.statusLabel}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        {/* Financial Overview */}
        <View style={styles.financialSection}>
          <View style={styles.amountRow}>
            <View style={styles.amountBlock}>
              <Text style={styles.amountLabel}>{t('loanList.principal')}</Text>
              <Text style={styles.amountValue}>{formatCurrency(item.principalAmount || item.amount)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.amountBlock}>
              <Text style={styles.amountLabel}>{t('loanList.remaining')}</Text>
              <Text style={[styles.amountValue, styles.outstandingValue]}>{formatCurrency(remainingAmount)}</Text>
            </View>
          </View>
        </View>

        {/* Progress Tracker */}
        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {item.paidInstallments} of {item.totalInstallments} {t('loanList.installments')} {t('userList.paid')}
            </Text>
            <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('loanForm.interestRateLabel')}</Text>
            <Text style={styles.detailValue}>{item.interestRate ?? 0}% p.a.</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t('loanForm.installmentAmountLabel')}</Text>
            <Text style={styles.detailValue}>{formatCurrency(item.installmentAmount)}</Text>
          </View>
          {item.startDate && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t('loanList.startDate')}</Text>
              <Text style={styles.detailValue}>{formatDate(item.startDate)}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsBar}>
          {!isPaid && (
            <>
              <TouchableOpacity
                onPress={() => handleAddInstallmentPress(item)}
                style={styles.primaryAction}
                disabled={item.paidInstallments >= item.totalInstallments}
                activeOpacity={0.8}
              >
                <Icon name="add-circle-outline" size={18} color="#fff" />
                <Text style={styles.primaryActionText}>{t('loanList.addPayment')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onUpdateStatus?.(item?._id, "paid", participantName)}
                style={styles.secondaryAction}
                activeOpacity={0.8}
              >
                <Icon name="check" size={18} color="#007AFF" />
                <Text style={styles.secondaryActionText}>{t('loanList.markPaid')}</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.iconActions}>
            <TouchableOpacity 
              onPress={() => onEditLoan?.(item)} 
              style={styles.iconButton}
              activeOpacity={0.8}
            >
              <Icon name="edit" size={18} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onDeleteLoan?.(item?._id, participantName)}
              style={styles.iconButton}
              activeOpacity={0.8}
            >
              <Icon name="delete-outline" size={18} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={Array.isArray(loans) ? loans : []}
      keyExtractor={(item, index) => item?._id?.toString() || index.toString()}
      renderItem={renderLoanItem}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      contentContainerStyle={styles.listContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Icon name="inventory-2" size={48} color="#ccc" />
          </View>
          <Text style={styles.emptyTitle}>{t('loanList.noLoans')}</Text>
          <Text style={styles.emptySubtitle}>Get started by creating your first loan record</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  listContainer: { 
    padding: 16, 
    paddingBottom: 80,
    backgroundColor: '#fff'
  },
  loanCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  nameSection: {
    flex: 1,
  },
  participantName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  loanReference: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusPaid: {
    backgroundColor: "#d4edda",
  },
  statusPartial: {
    backgroundColor: "#fff3cd",
  },
  statusPending: {
    backgroundColor: "#f8d7da",
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000",
  },
  financialSection: {
    marginBottom: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 12,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  amountBlock: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  outstandingValue: {
    color: "#007AFF",
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: "#ddd",
    marginHorizontal: 12,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  progressPercent: {
    fontSize: 13,
    color: "#000",
    fontWeight: "bold",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 3,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    gap: 12,
  },
  detailItem: {
    flex: 1,
    minWidth: "30%",
  },
  detailLabel: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: "#000",
    fontWeight: "600",
  },
  actionsBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  primaryAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  primaryActionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  secondaryAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e3f2fd",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  secondaryActionText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  iconActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

export default LoanList;