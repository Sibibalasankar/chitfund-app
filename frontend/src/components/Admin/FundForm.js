import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  ScrollView 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const FundForm = ({
  visible,
  onClose,
  users = [],
  formData,
  setFormData,
  onSave,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Fund / Transaction</Text>

          {/* Participant selection */}
          <Text style={styles.label}>Participant:</Text>
          <ScrollView style={styles.pickerContainer} contentContainerStyle={{ flexGrow: 1 }}>
            {users.map(user => (
              <TouchableOpacity
                key={user._id}
                style={[
                  styles.pickerOption,
                  formData.participantId === user._id && styles.pickerSelected,
                ]}
                onPress={() => setFormData({ ...formData, participantId: user._id })}
              >
                <Text style={formData.participantId === user._id ? styles.pickerTextSelected : styles.pickerText}>
                  {user.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Amount */}
          <Text style={styles.label}>Amount (₹):</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter amount"
            value={formData.amount?.toString() || ''}
            onChangeText={text => setFormData({ ...formData, amount: parseFloat(text) || 0 })}
          />

          {/* Due Date */}
          <Text style={styles.label}>Due Date:</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{formData.dueDate || 'Select date'}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={formData.dueDate ? new Date(formData.dueDate) : new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) {
                  setFormData({ ...formData, dueDate: date.toISOString().split('T')[0] });
                }
              }}
            />
          )}

          {/* Status */}
          <Text style={styles.label}>Status:</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[styles.radioButton, formData.status === 'pending' && styles.radioSelected]}
              onPress={() => setFormData({ ...formData, status: 'pending' })}
            >
              <Text style={formData.status === 'pending' ? styles.radioTextSelected : styles.radioText}>Pending</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.radioButton, formData.status === 'paid' && styles.radioSelected]}
              onPress={() => setFormData({ ...formData, status: 'paid' })}
            >
              <Text style={formData.status === 'paid' ? styles.radioTextSelected : styles.radioText}>Paid</Text>
            </TouchableOpacity>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={onSave}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  pickerContainer: {
    maxHeight: 150,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 4,
  },
  pickerOption: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 4,
    backgroundColor: '#f8f9fa',
  },
  pickerSelected: {
    backgroundColor: '#007bff',
  },
  pickerText: { color: '#333' },
  pickerTextSelected: { color: '#fff' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  radioButton: {
    flex: 1,
    padding: 10,
    marginRight: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  radioSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  radioText: { color: '#333', fontWeight: '500' },
  radioTextSelected: { color: '#fff', fontWeight: '500' },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: { backgroundColor: '#6c757d' },
  saveButton: { backgroundColor: '#28a745' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default FundForm;
