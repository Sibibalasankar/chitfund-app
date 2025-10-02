import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useTranslation } from '../../hooks/useTranslation';
import { useResponsive } from '../../hooks/useResponsive';
import * as Contacts from 'expo-contacts';

const UserForm = ({
  visible,
  onClose,
  editingUser,
  formData,
  setFormData,
  onSave,
}) => {
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [contactList, setContactList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showContacts, setShowContacts] = useState(false);

  const { t } = useTranslation();
  const { isDesktop, getModalWidth } = useResponsive();

  useEffect(() => {
    setErrors({});
    setLoading(false);
  }, [visible, editingUser]);

  const validate = () => {
    let newErrors = {};
    if (!formData.name?.trim()) {
      newErrors.name = t('admin.validation.validName');
    }
    if (!/^\d{10}$/.test(formData.phone || '')) {
      newErrors.phone = t('admin.validation.validPhone');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      try {
        setLoading(true);
        await onSave();
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert(
        t('admin.alerts.error'),
        t('admin.validation.fillAllFields')
      );
    }
  };

  // 📌 Normalize phone → keep last 10 digits only
  const formatPhoneNumber = (rawNumber) => {
    if (!rawNumber) return '';
    let digits = rawNumber.replace(/\D/g, ''); // remove non-digits
    if (digits.startsWith('91') && digits.length > 10) {
      digits = digits.slice(-10); // last 10 digits
    } else if (digits.length > 10) {
      digits = digits.slice(-10);
    }
    return digits;
  };

  // 📌 Mask last 2 digits
  const maskPhone = (phone) => {
    if (!phone) return '';
    if (phone.length === 10) {
      return phone.slice(0, 8) + 'XX';
    }
    return phone;
  };

  // 📌 Fetch contacts and open modal
  const pickContact = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('contactPicker.permissionDenied'),
        t('contactPicker.permissionMessage')
      );
      return;
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
    });

    if (data.length > 0) {
      setContactList(data);
      setFilteredList(data);
      setShowContacts(true);
    } else {
      Alert.alert(t('contactPicker.noContacts'));
    }
  };

  // 📌 Handle search filter
  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredList(contactList);
    } else {
      const lower = text.toLowerCase();
      const filtered = contactList.filter((c) => {
        const phone = c.phoneNumbers?.[0]?.number || '';
        return (
          c.name?.toLowerCase().includes(lower) ||
          phone.replace(/\D/g, '').includes(lower)
        );
      });
      setFilteredList(filtered);
    }
  };

  // 📌 User selects a contact
  const handleSelectContact = (contact) => {
    const name = contact.name || '';
    const phone =
      contact.phoneNumbers?.[0]?.number || '';
    const normalized = formatPhoneNumber(phone);
    setFormData({ ...formData, name, phone: normalized });
    setShowContacts(false);
  };

  return (
    <>
      {/* Main User Form */}
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { width: getModalWidth() }]}>
            <Text style={styles.modalTitle}>
              {editingUser ? t('userForm.editUser') : t('userForm.addUser')}
            </Text>

            {/* Pick from Contacts Button */}
            <TouchableOpacity
              style={[styles.pickContactButton, isDesktop && styles.desktopPickContactButton]}
              onPress={pickContact}
            >
              <Text style={styles.pickContactButtonText} numberOfLines={1} adjustsFontSizeToFit>
                {t('userForm.pickFromContacts')}
              </Text>
            </TouchableOpacity>

            {/* Name Input */}
            <TextInput
              style={[styles.modalInput, errors.name && styles.inputError]}
              placeholder={t('userForm.namePlaceholder')}
              placeholderTextColor="#888"
              value={formData.name || ''}
              onChangeText={(text) =>
                setFormData({ ...formData, name: text })
              }
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}

            {/* Phone Input */}
            <TextInput
              style={[styles.modalInput, errors.phone && styles.inputError]}
              placeholder={t('userForm.phonePlaceholder')}
              placeholderTextColor="#888"
              value={formData.phone || ''}
              onChangeText={(text) =>
                setFormData({ ...formData, phone: formatPhoneNumber(text) })
              }
              keyboardType="phone-pad"
              maxLength={10}
            />
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}

            {/* Role Selection */}
            <View
              style={[styles.modalRow, isDesktop && styles.desktopModalRow]}
            >
              <Text style={styles.modalLabel}>
                {t('userForm.roleLabel')}:
              </Text>
              <View
                style={[
                  styles.radioGroup,
                  isDesktop && styles.desktopRadioGroup,
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    formData.role === 'participant' &&
                    styles.radioButtonSelected,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, role: 'participant' })
                  }
                >
                  <Text
                    style={[
                      styles.radioText,
                      formData.role === 'participant' &&
                      styles.radioTextSelected,
                    ]}
                  >
                    {t('userForm.roleParticipant')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    formData.role === 'admin' &&
                    styles.radioButtonSelected,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, role: 'admin' })
                  }
                >
                  <Text
                    style={[
                      styles.radioText,
                      formData.role === 'admin' &&
                      styles.radioTextSelected,
                    ]}
                  >
                    {t('userForm.roleAdmin')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Status Selection */}
            <View
              style={[styles.modalRow, isDesktop && styles.desktopModalRow]}
            >
              <Text style={styles.modalLabel}>
                {t('userForm.statusLabel')}:
              </Text>
              <View
                style={[
                  styles.radioGroup,
                  isDesktop && styles.desktopRadioGroup,
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    formData.status === 'active' &&
                    styles.radioButtonSelected,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, status: 'active' })
                  }
                >
                  <Text
                    style={[
                      styles.radioText,
                      formData.status === 'active' &&
                      styles.radioTextSelected,
                    ]}
                  >
                    {t('admin.status.active')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    formData.status === 'inactive' &&
                    styles.radioButtonSelected,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, status: 'inactive' })
                  }
                >
                  <Text
                    style={[
                      styles.radioText,
                      formData.status === 'inactive' &&
                      styles.radioTextSelected,
                    ]}
                  >
                    {t('admin.status.inactive')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Buttons */}
            <View
              style={[
                styles.modalButtonContainer,
                isDesktop && styles.desktopButtonContainer,
              ]}
            >
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.modalButtonText}>
                  {t('admin.buttons.cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.saveButton,
                  loading && { opacity: 0.7 },
                ]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <View
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                  >
                    <ActivityIndicator
                      size="small"
                      color="#fff"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.modalButtonText}>
                      {editingUser
                        ? t('userForm.updatingUser')
                        : t('userForm.addingUser')}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.modalButtonText}>
                    {editingUser
                      ? t('userForm.updateUser')
                      : t('userForm.addUserButton')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 📌 Contact Picker Modal with Search */}
      <Modal visible={showContacts} animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#fff', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            {t('contactPicker.title')}
          </Text>

          {/* Search Bar */}
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              padding: 10,
              marginBottom: 15,
            }}
            placeholder={t('contactPicker.searchPlaceholder')}
            value={searchQuery}
            onChangeText={handleSearch}
          />

          {/* Contact List */}
          <FlatList
            data={filteredList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const rawPhone = item.phoneNumbers?.[0]?.number || '';
              const normalized = formatPhoneNumber(rawPhone);
              return (
                <TouchableOpacity
                  style={{
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#ddd',
                  }}
                  onPress={() => handleSelectContact(item)}
                >
                  <Text style={{ fontSize: 16, fontWeight: '500' }}>
                    {item.name}
                  </Text>
                  {normalized ? (
                    <Text style={{ fontSize: 14, color: '#555' }}>
                      {maskPhone(normalized)}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
                {t('contactPicker.noContacts')}
              </Text>
            }
          />

          {/* Close Button */}
          <TouchableOpacity
            style={{
              marginTop: 20,
              backgroundColor: 'red',
              padding: 15,
              borderRadius: 8,
              alignItems: 'center',
            }}
            onPress={() => setShowContacts(false)}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
              {t('contactPicker.close')}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
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
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    maxWidth: '100%', // Prevent overflow on small screens
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 26,
  },
  // Pick Contact Button Styles - FIXED
  pickContactButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    minHeight: 50,
    width: '100%', // Ensure full width
  },
  desktopPickContactButton: {
    paddingVertical: 15,
  },
  pickContactButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    flexShrink: 1,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    textAlignVertical: 'top',
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
    flexWrap: 'wrap',
  },
  desktopModalRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginRight: 15,
    minWidth: 60,
    flexShrink: 1,
  },
  radioGroup: {
    flexDirection: 'row',
    flex: 1,
  },
  desktopRadioGroup: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 8,
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
    fontSize: 15,
    textAlign: 'center',
  },
  radioTextSelected: {
    color: '#fff',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  desktopButtonContainer: {
    justifyContent: 'flex-end',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
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
    textAlign: 'center',
  },
});

export default UserForm;