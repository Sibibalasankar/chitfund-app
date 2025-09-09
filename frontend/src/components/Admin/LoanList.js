import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const LoanList = ({ loans, onEditLoan, onDeleteLoan, onUpdateStatus }) => (
  <FlatList
    data={loans}
    keyExtractor={(item) => item._id}
    renderItem={({ item }) => (
      <View style={styles.loanCard}>
        <Text style={styles.userName}>{item.participantId?.name || "Unknown"}</Text>
        <Text>Principal: ₹{item.principalAmount}</Text>
        <Text>Interest: {item.interestRate}%</Text>
        <Text>Total Installments: {item.totalInstallments}</Text>
        <Text>Installment Amount: ₹{item.installmentAmount}</Text>
        <Text>Paid Installments: {item.paidInstallments || 0}</Text>
        <Text>Status: {item.status || (item.paidInstallments === item.totalInstallments ? "Paid" : "Pending")}</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() =>
              onUpdateStatus(
                item._id,
                item.status === "pending" ? "paid" : "pending",
                item.participantId?.name
              )
            }
          >
            <Icon name="check-circle" size={24} color="#28a745" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onEditLoan(item)}>
            <Icon name="edit" size={24} color="#ffc107" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDeleteLoan(item._id, item.participantId?.name)}>
            <Icon name="delete" size={24} color="#dc3545" />
          </TouchableOpacity>
        </View>
      </View>
    )}
  />
);

const styles = StyleSheet.create({
  loanCard: {
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userName: {
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
});

export default LoanList;
