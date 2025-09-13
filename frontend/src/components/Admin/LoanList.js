import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const LoanList = ({ loans = [], onEditLoan, onDeleteLoan, onUpdateStatus, fetchLoans }) => {
  const [refreshing, setRefreshing] = useState(false);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchLoans(); // fetch updated loans from server/context
    } catch (err) {
      console.error("Error refreshing loans:", err);
    } finally {
      setRefreshing(false);
    }
  }, [fetchLoans]);

  const renderLoanItem = ({ item }) => (
    <View style={styles.loanCard}>
      <View style={styles.loanHeader}>
        <Text style={styles.userName}>{item.participantId?.name || "Unknown"}</Text>
        <View
          style={[
            styles.statusBadge,
            item.status === "paid"
              ? styles.paidBadge
              : item.status === "partially paid"
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
          <Text style={styles.detailValue}>₹{item.principalAmount || item.amount || 0}</Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="percent" size={16} color="#333" />
          <Text style={styles.detailLabel}>Interest:</Text>
          <Text style={styles.detailValue}>{item.interestRate || 0}%</Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="calendar-today" size={16} color="#333" />
          <Text style={styles.detailLabel}>Installments:</Text>
          <Text style={styles.detailValue}>
            {item.paidInstallments || 0}/{item.totalInstallments || 1}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="payment" size={16} color="#333" />
          <Text style={styles.detailLabel}>Monthly:</Text>
          <Text style={styles.detailValue}>₹{item.installmentAmount || 0}</Text>
        </View>

        {item.startDate && (
          <View style={styles.detailRow}>
            <Icon name="event" size={16} color="#333" />
            <Text style={styles.detailLabel}>Start Date:</Text>
            <Text style={styles.detailValue}>{item.startDate}</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {item.status !== "paid" && (
          <TouchableOpacity
            onPress={() =>
              onUpdateStatus(
                item._id,
                item.status === "pending" ? "paid" : "pending",
                item.participantId?.name
              )
            }
            style={styles.statusButton}
          >
            <LinearGradient colors={["#28a745", "#20c997"]} style={styles.gradientButton}>
              <Icon name="check-circle" size={20} color="#fff" />
              <Text style={styles.buttonText}>Mark Paid</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => onEditLoan(item)} style={styles.editButton}>
          <Icon name="edit" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onDeleteLoan(item._id, item.participantId?.name)} style={styles.deleteButton}>
          <Icon name="delete" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      data={loans}
      keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
      renderItem={renderLoanItem}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      contentContainerStyle={styles.listContainer}
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
  userName: { fontWeight: "bold", fontSize: 18, color: "#333" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  paidBadge: { backgroundColor: "#d4edda" },
  partialBadge: { backgroundColor: "#fff3cd" },
  pendingBadge: { backgroundColor: "#f8d7da" },
  statusText: { fontSize: 12, fontWeight: "bold", textTransform: "capitalize" },
  loanDetails: { marginBottom: 16 },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  detailLabel: { fontSize: 14, color: "#666", marginLeft: 8, marginRight: 4, width: 100 },
  detailValue: { fontSize: 14, fontWeight: "600", color: "#333", flex: 1 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  gradientButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "600", marginLeft: 6 },
  editButton: { backgroundColor: "#ffc107", width: 40, height: 40, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  deleteButton: { backgroundColor: "#dc3545", width: 40, height: 40, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 40 },
  emptyStateText: { marginTop: 12, color: "#999", fontSize: 16 },
});

export default LoanList;
