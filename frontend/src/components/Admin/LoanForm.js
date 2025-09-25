import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';

const LoanForm = ({ visible, onClose, users = [], formData, setFormData, onSave, isEditing, onDelete }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Auto-calculate installment, total amount, remaining, due date, and status
  useEffect(() => {
    if (!formData) return;

    const principal = parseFloat(formData.principalAmount || 0);
    const annualRate = parseFloat(formData.interestRate || 0); // <-- Interest entered as % per annum
    const monthlyRate = annualRate / 12; // ✅ Convert to monthly rate
    const totalInstallments = parseInt(formData.totalInstallments || 1);
    const paidInstallments = parseInt(formData.paidInstallments || 0);

    let updated = { ...formData };

    if (principal > 0 && totalInstallments > 0) {
      // ✅ Monthly interest simple calculation
      const totalInterest = principal * (monthlyRate / 100) * totalInstallments;
      const totalAmount = principal + totalInterest;
      const installment = totalAmount / totalInstallments;

      updated.totalAmount = parseFloat(totalAmount.toFixed(2));
      updated.installmentAmount = parseFloat(installment.toFixed(2));
      updated.amount = parseFloat(principal.toFixed(2));

      // Remaining amount
      const remainingInstallments = totalInstallments - paidInstallments;
      updated.remainingAmount = parseFloat((installment * remainingInstallments).toFixed(2));
    }

    // ✅ Due Date Calculation: startDate + totalInstallments months
    if (formData.startDate && totalInstallments > 0) {
      const start = new Date(formData.startDate);
      const due = new Date(start);
      due.setMonth(due.getMonth() + totalInstallments);
      updated.dueDate = due.toISOString().split('T')[0];
    }

    // ✅ Status
    if (paidInstallments === 0) {
      updated.status = "Pending";
    } else if (paidInstallments >= totalInstallments) {
      updated.status = "Paid";
    } else {
      updated.status = "Partially Paid";
    }

    setFormData(updated);
  }, [
    formData.principalAmount,
    formData.interestRate,
    formData.totalInstallments,
    formData.startDate,
    formData.paidInstallments
  ]);


  const handleDelete = () => {
    if (onDelete) {
      Alert.alert(
        "Confirm Delete",
        "Are you sure you want to delete this loan?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: onDelete },
        ]
      );
    }
  };

  const handleSave = async () => {
    if (isSaving) return; // ✅ Prevent double taps

    if (!formData.participantId) {
      Alert.alert("Error", "Please select a participant");
      return;
    }

    if (!formData.startDate) {
      Alert.alert("Error", "Please select a start date");
      return;
    }

    setIsSaving(true); // ✅ lock button

    // Calculate paid and pending amounts before saving
    const paidInstallments = parseInt(formData.paidInstallments || 0);
    const totalInstallments = parseInt(formData.totalInstallments || 1);
    const installmentAmount = parseFloat(formData.installmentAmount || 0);

    const totalPaid = parseFloat((paidInstallments * installmentAmount).toFixed(2));
    const pendingAmount = parseFloat(((totalInstallments - paidInstallments) * installmentAmount).toFixed(2));

    const payload = {
      participantId: formData.participantId,
      principalAmount: parseFloat(formData.principalAmount),
      interestRate: parseFloat(formData.interestRate),
      totalInstallments,
      paidInstallments,
      installmentAmount,
      totalAmount: parseFloat(formData.totalAmount),
      remainingAmount: pendingAmount,
      totalPaid,
      pendingAmount,
      startDate: new Date(formData.startDate),
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      status: formData.status?.toLowerCase() || "pending",
    };

    console.log("Sending loan data:", payload);

    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      console.error("Add Loan Error details:", err);
      Alert.alert("Error", err.message || "Failed to save loan.");
    } finally {
      setIsSaving(false); // ✅ unlock after request completes
    }
  };

  if (loadingUsers) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Loading users...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {isEditing ? "Edit Loan" : "Add Loan"}
          </Text>

          <Text style={styles.label}>Participant:</Text>

          {users.length === 0 ? (
            <View style={styles.noUsersContainer}>
              <Text style={styles.noUsersText}>No users available</Text>
              <Text style={styles.noUsersSubtext}>Please add users first before creating loans</Text>
            </View>
          ) : (
            <>
              <View style={styles.pickerContainer}>
                <ScrollView nestedScrollEnabled>
                  {users.map(user => (
                    <TouchableOpacity
                      key={user._id || user.id}
                      style={[
                        styles.pickerOption,
                        formData.participantId === (user._id || user.id) && styles.pickerSelected
                      ]}
                      onPress={() =>
                        setFormData({
                          ...formData,
                          participantId: user._id || user.id,
                          participantName: user.name,
                          participantPhone: user.phone
                        })
                      }
                    >
                      <Text
                        style={
                          formData.participantId === (user._id || user.id)
                            ? styles.pickerTextSelected
                            : styles.pickerText
                        }
                      >
                        {user.name} - {user.phone}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {formData.participantId && (
                <Text style={styles.selectedUser}>
                  Selected: {formData.participantName} ({formData.participantPhone})
                </Text>
              )}
            </>
          )}

          <Text style={styles.label}>Principal Amount (₹):</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter principal amount"
            placeholderTextColor="#888"
            value={formData.principalAmount?.toString() || ""}
            onChangeText={text => setFormData({ ...formData, principalAmount: parseFloat(text) || 0 })}
          />

          <Text style={styles.label}>Interest Rate (% p.a.):</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter interest rate"
            placeholderTextColor="#888"
            value={formData.interestRate?.toString() || ""}
            onChangeText={text => setFormData({ ...formData, interestRate: parseFloat(text) || 0 })}
          />

          <Text style={styles.label}>Total Installments:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter total installments"
            placeholderTextColor="#888"
            value={formData.totalInstallments?.toString() || ""}
            onChangeText={text => setFormData({ ...formData, totalInstallments: parseInt(text) || 1 })}
          />

          <Text style={styles.label}>Paid Installments:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter paid installments"
            placeholderTextColor="#888"
            value={formData.paidInstallments?.toString() || "0"}
            onChangeText={text => setFormData({ ...formData, paidInstallments: parseInt(text) || 0 })}
          />

          <Text style={styles.label}>Start Date:</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
            <Text>{formData.startDate || "Select date"}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={formData.startDate ? new Date(formData.startDate) : new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setFormData({ ...formData, startDate: date.toISOString().split("T")[0] });
              }}
            />
          )}

          <Text style={styles.label}>Installment Amount: ₹{formData.installmentAmount || 0}</Text>
          <Text style={styles.label}>Total Amount: ₹{formData.totalAmount || 0}</Text>
          <Text style={styles.label}>Remaining Amount: ₹{formData.remainingAmount || 0}</Text>
          <Text style={styles.label}>Due Date: {formData.dueDate || "Not set"}</Text>
          <Text style={styles.label}>Status: {formData.status || "Pending"}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            {isEditing && (
              <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                (isSaving || !formData.participantId || users.length === 0) && styles.buttonDisabled
              ]}
              onPress={handleSave}
              disabled={isSaving || !formData.participantId || users.length === 0}
            >
              <Text style={styles.buttonText}>
                {isSaving ? (isEditing ? "Updating..." : "Saving...") : (isEditing ? "Update" : "Save")}
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)", padding: 20 },
  modalContent: { backgroundColor: "#fff", borderRadius: 12, padding: 20, width: "100%", maxHeight: "90%" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  loadingText: { marginTop: 16, textAlign: "center", color: "#666" },
  noUsersContainer: { padding: 16, backgroundColor: "#f8d7da", borderRadius: 6, marginBottom: 12 },
  noUsersText: { color: "#721c24", fontWeight: "bold", textAlign: "center" },
  noUsersSubtext: { color: "#721c24", textAlign: "center", marginTop: 4 },
  label: { fontSize: 14, marginBottom: 6, fontWeight: "500" },
  pickerContainer: { maxHeight: 150, marginBottom: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 6, padding: 4 },
  pickerOption: { paddingVertical: 6, paddingHorizontal: 8, borderRadius: 6, marginBottom: 4, backgroundColor: "#f8f9fa" },
  pickerSelected: { backgroundColor: "#007bff" },
  pickerText: { color: "#333" },
  pickerTextSelected: { color: "#fff" },
  selectedUser: { marginBottom: 12, padding: 8, backgroundColor: "#e9ecef", borderRadius: 6, fontWeight: "500" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 6, padding: 10, marginBottom: 12, backgroundColor: "#f8f9fa" },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  button: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center", marginHorizontal: 5 },
  buttonDisabled: { backgroundColor: "#ccc" },
  cancelButton: { backgroundColor: "#6c757d" },
  deleteButton: { backgroundColor: "#dc3545" },
  saveButton: { backgroundColor: "#28a745" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});

export default LoanForm;
