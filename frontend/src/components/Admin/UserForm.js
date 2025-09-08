import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';

const UserForm = ({
  visible,
  onClose,
  editingUser,
  formData,
  setFormData,
  onSave
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editingUser ? 'Edit User' : 'Add New User'}
          </Text>
          
          <TextInput
            style={styles.modalInput}
            placeholder="Full Name"
            value={formData.name || ''}
            onChangeText={(text) => setFormData({...formData, name: text})}
          />
          
          <TextInput
            style={styles.modalInput}
            placeholder="Mobile Number (10 digits)"
            value={formData.phone || ''}
            onChangeText={(text) => setFormData({...formData, phone: text})}
            keyboardType="phone-pad"
            maxLength={10}
          />
          
          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Role:</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity 
                style={[styles.radioButton, formData.role === 'participant' && styles.radioButtonSelected]}
                onPress={() => setFormData({...formData, role: 'participant'})}
              >
                <Text style={[styles.radioText, formData.role === 'participant' && styles.radioTextSelected]}>
                  Participant
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.radioButton, formData.role === 'admin' && styles.radioButtonSelected]}
                onPress={() => setFormData({...formData, role: 'admin'})}
              >
                <Text style={[styles.radioText, formData.role === 'admin' && styles.radioTextSelected]}>
                  Admin
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Status:</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity 
                style={[styles.radioButton, formData.status === 'active' && styles.radioButtonSelected]}
                onPress={() => setFormData({...formData, status: 'active'})}
              >
                <Text style={[styles.radioText, formData.status === 'active' && styles.radioTextSelected]}>
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.radioButton, formData.status === 'inactive' && styles.radioButtonSelected]}
                onPress={() => setFormData({...formData, status: 'inactive'})}
              >
                <Text style={[styles.radioText, formData.status === 'inactive' && styles.radioTextSelected]}>
                  Inactive
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.saveButton]}
              onPress={onSave}
            >
              <Text style={styles.modalButtonText}>
                {editingUser ? 'Update' : 'Add'} User
              </Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginRight: 15,
    minWidth: 60,
  },
  radioGroup: {
    flexDirection: 'row',
    flex: 1,
  },
  radioButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  radioButtonSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  radioText: {
    color: '#666',
    fontWeight: '500',
  },
  radioTextSelected: {
    color: '#fff',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  saveButton: {
    backgroundColor: '#007bff',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default UserForm;
