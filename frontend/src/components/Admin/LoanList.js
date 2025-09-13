import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const LoanList = ({ loans = [], onEditLoan, onDeleteLoan, onUpdateStatus, fetchLoans, onAddInstallment }) => {
  const [refreshing, setRefreshing] = useState(false);

  const formatCurrency = (amount) => `₹${(amount || 0).toFixed(2)}`;
  const formatDate = (date) => {
    if (!date) return "N/A";
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

const handleAddInstallmentPress = (loan) => {
  if (!loan || !loan._id) return;

  if (loan.paidInstallments < loan.totalInstallments) {
    const newPaidInstallments = loan.paidInstallments + 1;
    const remainingAmount = loan.installmentAmount * (loan.totalInstallments - newPaidInstallments);
    
    // Create updated loan object
    const updatedLoan = {
      ...loan,
      paidInstallments: newPaidInstallments,
      remainingAmount: remainingAmount,
      status: newPaidInstallments >= loan.totalInstallments ? "paid" : 
              newPaidInstallments > 0 ? "partially paid" : "pending"
    };

    // Update parent state immediately for optimistic UI
    if (onAddInstallment) {
      onAddInstallment(updatedLoan);
    }
  }
};

  const renderLoanItem = ({ item }) => {
    if (!item) return null;
    const participantName = item.participantId?.name || item.participantName || "Unknown";
    const remainingInstallments = item.totalInstallments - item.paidInstallments;
    const remainingAmount = item.remainingAmount || (item.installmentAmount * remainingInstallments);

    return (
      <View style={styles.loanCard}>
        <View style={styles.loanHeader}>
          <Text style={styles.userName}>{participantName}</Text>
          <View
            style={[
              styles.statusBadge,
              item.status?.toLowerCase() === "paid"
                ? styles.paidBadge
                : item.status?.toLowerCase() === "partially paid"
                  ? styles.partialBadge
                  : styles.pendingBadge,
            ]}
          >
            <Text style={styles.statusText}>{item.status || "Pending"}</Text>
          </View>
        </View>

        <View style={styles.loanDetails}>
          <View style={styles.detailRow}>
            <Icon name="account-balance" size={16} color="#333" />
            <Text style={styles.detailLabel}>Principal:</Text>
            <Text style={styles.detailValue}>{formatCurrency(item.principalAmount || item.amount)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="percent" size={16} color="#333" />
            <Text style={styles.detailLabel}>Interest:</Text>
            <Text style={styles.detailValue}>{`${item.interestRate ?? 0}%`}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="calendar-today" size={16} color="#333" />
            <Text style={styles.detailLabel}>Installments:</Text>
            <Text style={styles.detailValue}>{`${item.paidInstallments || 0}/${item.totalInstallments || 1}`}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="payment" size={16} color="#333" />
            <Text style={styles.detailLabel}>Monthly:</Text>
            <Text style={styles.detailValue}>{formatCurrency(item.installmentAmount)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="account-balance-wallet" size={16} color="#333" />
            <Text style={styles.detailLabel}>Remaining:</Text>
            <Text style={styles.detailValue}>{formatCurrency(remainingAmount)}</Text>
          </View>

          {item.startDate && (
            <View style={styles.detailRow}>
              <Icon name="event" size={16} color="#333" />
              <Text style={styles.detailLabel}>Start Date:</Text>
              <Text style={styles.detailValue}>{formatDate(item.startDate)}</Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          {item.status?.toLowerCase() !== "paid" && (
            <>
              <TouchableOpacity
                onPress={() => handleAddInstallmentPress(item)}
                style={[styles.statusButton, { marginRight: 8 }]}
                disabled={item.paidInstallments >= item.totalInstallments}
              >
                <LinearGradient colors={["#28a745", "#20c997"]} style={styles.gradientButton}>
                  <Icon name="add" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Add Payment</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onUpdateStatus?.(item?._id, "paid", participantName)}
                style={[styles.statusButton, { marginRight: 8 }]}
              >
                <LinearGradient colors={["#007bff", "#0056b3"]} style={styles.gradientButton}>
                  <Icon name="check-circle" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Mark Paid</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity onPress={() => onEditLoan?.(item)} style={[styles.editButton, { marginRight: 8 }]}>
            <Icon name="edit" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onDeleteLoan?.(item?._id, participantName)}
            style={styles.deleteButton}
          >
            <Icon name="delete" size={20} color="#fff" />
          </TouchableOpacity>
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
          <Icon name="account-balance-wallet" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>No loans found</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  listContainer: { padding: 16, paddingBottom: 80 },
  loanCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loanHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  userName: { fontWeight: "bold", fontSize: 18, color: "#333", flexShrink: 1 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  paidBadge: { backgroundColor: "#d4edda" },
  partialBadge: { backgroundColor: "#fff3cd" },
  pendingBadge: { backgroundColor: "#f8d7da" },
  statusText: { fontSize: 12, fontWeight: "bold", textTransform: "capitalize" },
  loanDetails: { marginBottom: 16 },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  detailLabel: { fontSize: 14, color: "#666", marginLeft: 8, marginRight: 4 },
  detailValue: { fontSize: 14, fontWeight: "600", color: "#333", marginLeft: "auto" },
  actions: { flexDirection: "row", justifyContent: "flex-end", flexWrap: "wrap" },
  gradientButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "600", marginLeft: 6, fontSize: 12 },
  editButton: { backgroundColor: "#ffc107", width: 40, height: 40, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  deleteButton: { backgroundColor: "#dc3545", width: 40, height: 40, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 40 },
  emptyStateText: { marginTop: 12, color: "#999", fontSize: 16 },
});

export default LoanList;
