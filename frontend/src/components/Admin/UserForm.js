import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useTranslation } from '../../hooks/useTranslation'; // Add this import

const UserForm = ({
  visible,
  onClose,
  editingUser,
  formData,
  setFormData,
  onSave
}) => {
  const [errors, setErrors] = useState({});
  const { t } = useTranslation(); // Add translation hook

  useEffect(() => {
    setErrors({});
  }, [visible, editingUser]);

  const validate = () => {
    let newErrors = {};
    if (!formData.name?.trim()) {
      newErrors.name = t('admin.validation.validName');
    }
    if (!/^\d{10}$/.test(formData.phone || "")) {
      newErrors.phone = t('admin.validation.validPhone');
    }
    // Remove password validation since we don't have password field
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave();
    } else {
      Alert.alert(t('admin.alerts.error'), t('admin.validation.fillAllFields'));
    }
  };

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
            {editingUser ? t('userForm.editUser') : t('userForm.addUser')}
          </Text>
          
          <TextInput
            style={[styles.modalInput, errors.name && styles.inputError]}
            placeholder={t('userForm.namePlaceholder')}
            value={formData.name || ''}
            onChangeText={(text) => setFormData({...formData, name: text})}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          
          <TextInput
            style={[styles.modalInput, errors.phone && styles.inputError]}
            placeholder={t('userForm.phonePlaceholder')}
            placeholderTextColor="#888"
            value={formData.phone || ''}
            onChangeText={(text) => setFormData({...formData, phone: text})}
            keyboardType="phone-pad"
            maxLength={10}
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

          {/* Remove password input since it's not in your form data */}
          
          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>{t('userForm.roleLabel')}:</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity 
                style={[styles.radioButton, formData.role === 'participant' && styles.radioButtonSelected]}
                onPress={() => setFormData({...formData, role: 'participant'})}
              >
                <Text style={[styles.radioText, formData.role === 'participant' && styles.radioTextSelected]}>
                  {t('userForm.roleParticipant')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.radioButton, formData.role === 'admin' && styles.radioButtonSelected]}
                onPress={() => setFormData({...formData, role: 'admin'})}
              >
                <Text style={[styles.radioText, formData.role === 'admin' && styles.radioTextSelected]}>
                  {t('userForm.roleAdmin')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>{t('userForm.statusLabel')}:</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity 
                style={[styles.radioButton, formData.status === 'active' && styles.radioButtonSelected]}
                onPress={() => setFormData({...formData, status: 'active'})}
              >
                <Text style={[styles.radioText, formData.status === 'active' && styles.radioTextSelected]}>
                  {t('admin.status.active')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.radioButton, formData.status === 'inactive' && styles.radioButtonSelected]}
                onPress={() => setFormData({...formData, status: 'inactive'})}
              >
                <Text style={[styles.radioText, formData.status === 'inactive' && styles.radioTextSelected]}>
                  {t('admin.status.inactive')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.modalButtonText}>{t('admin.buttons.cancel')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.modalButtonText}>
                {editingUser ? t('userForm.updateUser') : t('userForm.addUserButton')}
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
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginBottom: 10,
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