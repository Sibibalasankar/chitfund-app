import DateTimePicker from '@react-native-community/datetimepicker';
import { useState, useEffect } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import { useTranslation } from '../../hooks/useTranslation';

const { width } = Dimensions.get('window');

const FundForm = ({
  visible,
  onClose,
  users = [],
  formData = {},
  setFormData = () => {},
  onSave,
  isEditing,
  onDelete,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const { t } = useTranslation();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      setIsSaving(false);
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [visible]);

  const handleDelete = () => {
    if (onDelete) {
      Alert.alert(
        t('admin.alerts.confirmDelete'),
        t('fundForm.deleteConfirmation'),
        [
          { text: t('admin.buttons.cancel'), style: "cancel" },
          { text: t('admin.buttons.delete'), style: "destructive", onPress: onDelete },
        ]
      );
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const updatedFund = await onSave(formData);
      setFormData(updatedFund);
    } catch (err) {
      console.error(err);
      Alert.alert(t('admin.alerts.error'), t('fundForm.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <Animated.View 
          style={[
            styles.modalContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerAccent} />
            <Text style={styles.modalTitle}>
              {isEditing ? t('fundForm.editTitle') : t('fundForm.addTitle')}
            </Text>
            <Text style={styles.subtitle}>
              {isEditing ? '✏️ Update fund details' : '✨ Create new fund entry'}
            </Text>
          </View>

          <ScrollView 
            style={styles.formContainer}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Participant Selection */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                👤 {t('fundForm.participantLabel')}
              </Text>
              <ScrollView 
                style={styles.pickerContainer} 
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
              >
                {users.map(user => (
                  <TouchableOpacity
                    key={user._id || user.id}
                    style={[
                      styles.pickerOption,
                      formData?.participantId === (user._id || user.id) && styles.pickerSelected
                    ]}
                    onPress={() => setFormData({ ...formData, participantId: user._id || user.id })}
                    activeOpacity={0.7}
                  >
                    <View style={styles.pickerOptionContent}>
                      <View style={[
                        styles.radioCircle,
                        formData?.participantId === (user._id || user.id) && styles.radioCircleSelected
                      ]}>
                        {formData?.participantId === (user._id || user.id) && (
                          <View style={styles.radioCircleInner} />
                        )}
                      </View>
                      <Text style={[
                        styles.pickerText,
                        formData?.participantId === (user._id || user.id) && styles.pickerTextSelected
                      ]}>
                        {user.name || t('userList.unknown')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Amount Input */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                💰 {t('fundForm.amountLabel')}
              </Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder={t('fundForm.amountPlaceholder')}
                  placeholderTextColor="#999"
                  value={formData?.amount?.toString() || ''}
                  onChangeText={text => setFormData({ ...formData, amount: parseFloat(text) || 0 })}
                />
              </View>
            </View>

            {/* Due Date Picker */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                📅 {t('fundForm.dueDateLabel')}
              </Text>
              <TouchableOpacity 
                style={styles.dateButton} 
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.dateButtonText}>
                  {formData?.dueDate || t('fundForm.selectDate')}
                </Text>
                <Text style={styles.dateIcon}>›</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={formData?.dueDate ? new Date(formData.dueDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) setFormData({ ...formData, dueDate: date.toISOString().split('T')[0] });
                  }}
                />
              )}
            </View>

            {/* Status Selection */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                📊 {t('fundForm.statusLabel')}
              </Text>
              <View style={styles.statusContainer}>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    formData?.status === 'pending' && styles.statusButtonPending,
                    formData?.status === 'paid' && styles.disabledStatus
                  ]}
                  onPress={() => formData?.status !== 'paid' && setFormData({ ...formData, status: 'pending' })}
                  disabled={formData?.status === 'paid'}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.statusText,
                    formData?.status === 'pending' && styles.statusTextSelected
                  ]}>
                    ⏳ {t('admin.status.pending')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    formData?.status === 'paid' && styles.statusButtonPaid
                  ]}
                  onPress={() => setFormData({ ...formData, status: 'paid' })}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.statusText,
                    formData?.status === 'paid' && styles.statusTextSelected
                  ]}>
                    ✓ {t('admin.status.paid')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{t('admin.buttons.cancel')}</Text>
            </TouchableOpacity>

            {isEditing && (
              <TouchableOpacity 
                style={[styles.button, styles.deleteButton]} 
                onPress={handleDelete}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>🗑️ {t('admin.buttons.delete')}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[
                styles.button, 
                styles.saveButton,
                isSaving && styles.savingButton
              ]} 
              onPress={handleSave} 
              disabled={isSaving}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {isSaving ? '⏳ ' + t('fundForm.saving') : (isEditing ? '💾 ' + t('fundForm.updateButton') : '✓ ' + t('fundForm.saveButton'))}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: width > 600 ? 500 : width - 40,
    maxHeight: '85%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerAccent: {
    width: 40,
    height: 4,
    backgroundColor: '#667eea',
    borderRadius: 2,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  formContainer: {
    padding: 24,
    paddingTop: 16,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  pickerContainer: {
    maxHeight: 160,
    borderWidth: 2,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    padding: 8,
    backgroundColor: '#fafafa',
  },
  pickerOption: {
    marginBottom: 8,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e8e8e8',
  },
  pickerSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  pickerOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  radioCircleSelected: {
    borderColor: '#fff',
  },
  radioCircleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  pickerText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  pickerTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    backgroundColor: '#fafafa',
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667eea',
    marginRight: 8,
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fafafa',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dateIcon: {
    fontSize: 24,
    color: '#667eea',
    fontWeight: '300',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statusButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e8e8e8',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  statusButtonPending: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
  },
  statusButtonPaid: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
  },
  disabledStatus: {
    opacity: 0.5,
  },
  statusText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  statusTextSelected: {
    color: '#1a1a1a',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  savingButton: {
    backgroundColor: '#5a8f66',
    opacity: 0.8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.3,
  },
});

export default FundForm;