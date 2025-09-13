import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const LoanForm = ({
  visible,
  onClose,
  users = [],
  formData,
  setFormData,
  onSave,
  isEditing,
  onDelete,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Auto-calculate installment amount whenever principal, interest, or totalInstallments changes
  useEffect(() => {
    const principal = parseFloat(formData.principalAmount || formData.amount || 0);
    const interestRate = parseFloat(formData.interestRate || 0);
    const totalInstallments = parseInt(formData.totalInstallments || 1);

    if (principal && interestRate && totalInstallments) {
      const totalInterest = principal * (interestRate / 100) * (totalInstallments / 12);
      const totalAmount = principal + totalInterest;
      const installmentAmount = parseFloat((totalAmount / totalInstallments).toFixed(2));
      setFormData({ 
        ...formData, 
        installmentAmount,
        amount: principal // Ensure amount field is set
      });
    }
  }, [formData.principalAmount, formData.amount, formData.interestRate, formData.totalInstallments]);

  const handleDelete = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this loan?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ]
    );
  };

  // Compute loan status
  const computeStatus = () => {
    if (!formData.paidInstallments || formData.paidInstallments === 0) return 'Pending';
    if (formData.paidInstallments >= formData.totalInstallments) return 'Paid';
    return 'Partially Paid';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <ScrollView contentContainerStyle={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{isEditing ? "Edit Loan" : "Add Loan"}</Text>

          {/* Participant */}
          <Text style={styles.label}>Participant:</Text>
          <ScrollView style={styles.pickerContainer} contentContainerStyle={{ flexGrow: 1 }}>
            {users.map(user => (
              <TouchableOpacity
                key={user._id || user.id}
                style={[styles.pickerOption, formData.participantId === (user._id || user.id) && styles.pickerSelected]}
                onPress={() => setFormData({ ...formData, participantId: user._id || user.id })}
              >
                <Text style={formData.participantId === (user._id || user.id) ? styles.pickerTextSelected : styles.pickerText}>{user.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Principal Amount */}
          <Text style={styles.label}>Principal Amount (₹):</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter principal amount"
            placeholderTextColor="#888"
            value={formData.principalAmount?.toString() || formData.amount?.toString() || ''}
            onChangeText={text => setFormData({ 
              ...formData, 
              principalAmount: parseFloat(text) || 0,
              amount: parseFloat(text) || 0 
            })}
          />

          {/* Interest Rate */}
          <Text style={styles.label}>Interest Rate (% p.a.):</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter interest rate"
            placeholderTextColor="#888"
            value={formData.interestRate?.toString() || ''}
            onChangeText={text => setFormData({ ...formData, interestRate: parseFloat(text) || 0 })}
          />

          {/* Total Installments */}
          <Text style={styles.label}>Total Installments:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter total installments"
            placeholderTextColor="#888"
            value={formData.totalInstallments?.toString() || ''}
            onChangeText={text => setFormData({ ...formData, totalInstallments: parseInt(text) || 1 })}
          />

          {/* Start Date */}
          <Text style={styles.label}>Start Date:</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
            <Text>{formData.startDate || 'Select start date'}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={formData.startDate ? new Date(formData.startDate) : new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setFormData({ ...formData, startDate: date.toISOString().split('T')[0] });
              }}
            />
          )}

          {/* Auto-calculated installment */}
          <Text style={styles.label}>Installment Amount (₹): {formData.installmentAmount || 0}</Text>

          {/* Paid Installments */}
          <Text style={styles.label}>Paid Installments:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter paid installments"
            placeholderTextColor="#888"
            value={formData.paidInstallments?.toString() || '0'}
            onChangeText={text => setFormData({ ...formData, paidInstallments: parseInt(text) || 0 })}
          />

          {/* Status */}
          <Text style={styles.label}>Status: {formData.status || computeStatus()}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            {isEditing && (
              <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={() => onSave(formData)}>
              <Text style={styles.buttonText}>{isEditing ? "Update" : "Save"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '100%', maxHeight: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  label: { fontSize: 14, marginBottom: 6, fontWeight: '500' },
  pickerContainer: { maxHeight: 150, marginBottom: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 4 },
  pickerOption: { paddingVertical: 6, paddingHorizontal: 8, borderRadius: 6, marginBottom: 4, backgroundColor: '#f8f9fa' },
  pickerSelected: { backgroundColor: '#007bff' },
  pickerText: { color: '#333' },
  pickerTextSelected: { color: '#fff' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 10, marginBottom: 12, backgroundColor: '#f8f9fa' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  cancelButton: { backgroundColor: '#6c757d' },
  deleteButton: { backgroundColor: '#dc3545' },
  saveButton: { backgroundColor: '#28a745' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default LoanForm;