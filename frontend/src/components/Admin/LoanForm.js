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
  Platform,
  ActivityIndicator
} from 'react-native';
import { useTranslation } from '../../hooks/useTranslation';

const { width } = Dimensions.get('window');

const LoanForm = ({ visible, onClose, users = [], formData, setFormData, onSave, isEditing, onDelete }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const { t } = useTranslation();

  // Animation effects
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

  // Auto-calculate loan details
  useEffect(() => {
    if (!formData) return;

    const principal = parseFloat(formData.principalAmount || 0);
    const annualRate = parseFloat(formData.interestRate || 0);
    const monthlyRate = annualRate / 12;
    const totalInstallments = parseInt(formData.totalInstallments || 1);
    const paidInstallments = parseInt(formData.paidInstallments || 0);

    let updated = { ...formData };

    if (principal > 0 && totalInstallments > 0) {
      const totalInterest = principal * (monthlyRate / 100) * totalInstallments;
      const totalAmount = principal + totalInterest;
      const installment = totalAmount / totalInstallments;

      updated.totalAmount = parseFloat(totalAmount.toFixed(2));
      updated.installmentAmount = parseFloat(installment.toFixed(2));
      updated.amount = parseFloat(principal.toFixed(2));

      const remainingInstallments = totalInstallments - paidInstallments;
      updated.remainingAmount = parseFloat((installment * remainingInstallments).toFixed(2));
    }

    if (formData.startDate && totalInstallments > 0) {
      const start = new Date(formData.startDate);
      const due = new Date(start);
      due.setMonth(due.getMonth() + totalInstallments);
      updated.dueDate = due.toISOString().split('T')[0];
    }

    // Set status
    if (paidInstallments === 0) {
      updated.status = "pending";
    } else if (paidInstallments >= totalInstallments) {
      updated.status = "paid";
    } else {
      updated.status = "partially_paid";
    }

    setFormData(updated);
  }, [
    formData?.principalAmount,
    formData?.interestRate,
    formData?.totalInstallments,
    formData?.startDate,
    formData?.paidInstallments,
    setFormData
  ]);

  // Helper function to get translated status text
  const getStatusText = (status) => {
    const statusMap = {
      'paid': t('loanList.status.paid'),
      'pending': t('loanList.status.pending'),
      'partially_paid': t('loanList.status.partiallyPaid'),
      'partially paid': t('loanList.status.partiallyPaid')
    };
    return statusMap[status?.toLowerCase()] || status || t('loanList.status.pending');
  };

  const handleDelete = () => {
    if (onDelete) {
      Alert.alert(
        t('common.confirm'),
        t('loanForm.deleteConfirmation'),
        [
          { text: t('loanForm.cancel'), style: "cancel" },
          { text: t('common.delete'), style: "destructive", onPress: onDelete },
        ]
      );
    }
  };

  const handleSave = async () => {
    if (isSaving) return;

    if (!formData.participantId) {
      Alert.alert(t('common.error'), t('loanForm.validation.selectParticipant'));
      return;
    }

    if (!formData.startDate) {
      Alert.alert(t('common.error'), t('loanForm.validation.selectStartDate'));
      return;
    }

    setIsSaving(true);

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
      Alert.alert(t('common.error'), err.message || t('common.error'));
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingUsers) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>{t('login.loading')}</Text>
          </View>
        </View>
      </Modal>
    );
  }

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
              {isEditing ? t('loanForm.editTitle') : t('loanForm.addTitle')}
            </Text>
            <Text style={styles.subtitle}>
              {isEditing ? '✏️ Update loan details' : '💰 Create new loan'}
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
                👤 {t('loanForm.participantLabel')}
              </Text>
              
              {users.length === 0 ? (
                <View style={styles.noUsersContainer}>
                  <Text style={styles.noUsersText}>{t('loanForm.noUsers')}</Text>
                  <Text style={styles.noUsersSubtext}>{t('loanForm.noUsersSubtext')}</Text>
                </View>
              ) : (
                <>
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
                        activeOpacity={0.7}
                      >
                        <View style={styles.pickerOptionContent}>
                          <View style={[
                            styles.radioCircle,
                            formData.participantId === (user._id || user.id) && styles.radioCircleSelected
                          ]}>
                            {formData.participantId === (user._id || user.id) && (
                              <View style={styles.radioCircleInner} />
                            )}
                          </View>
                          <View style={styles.userInfo}>
                            <Text style={[
                              styles.pickerText,
                              formData.participantId === (user._id || user.id) && styles.pickerTextSelected
                            ]}>
                              {user.name}
                            </Text>
                            <Text style={[
                              styles.pickerSubtext,
                              formData.participantId === (user._id || user.id) && styles.pickerSubtextSelected
                            ]}>
                              {user.phone}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {formData.participantId && (
                    <View style={styles.selectedUserContainer}>
                      <Text style={styles.selectedUserLabel}>{t('loanForm.selectedUser')}:</Text>
                      <Text style={styles.selectedUserName}>{formData.participantName}</Text>
                      <Text style={styles.selectedUserPhone}>{formData.participantPhone}</Text>
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Loan Amount Input */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                💰 {t('loanForm.principalAmountLabel')}
              </Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="Enter principal amount"
                  placeholderTextColor="#999"
                  value={formData.principalAmount?.toString() || ""}
                  onChangeText={text => setFormData({ ...formData, principalAmount: parseFloat(text) || 0 })}
                />
              </View>
            </View>

            {/* Interest Rate Input */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                📈 {t('loanForm.interestRateLabel')}
              </Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="Annual interest rate (%)"
                  placeholderTextColor="#999"
                  value={formData.interestRate?.toString() || ""}
                  onChangeText={text => setFormData({ ...formData, interestRate: parseFloat(text) || 0 })}
                />
                <Text style={styles.percentageSymbol}>%</Text>
              </View>
            </View>

            {/* Installments Section */}
            <View style={styles.row}>
              <View style={[styles.fieldGroup, styles.flex1]}>
                <Text style={styles.label}>
                  📦 {t('loanForm.totalInstallmentsLabel')}
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="12"
                    placeholderTextColor="#999"
                    value={formData.totalInstallments?.toString() || ""}
                    onChangeText={text => setFormData({ ...formData, totalInstallments: parseInt(text) || 1 })}
                  />
                </View>
              </View>

              <View style={[styles.fieldGroup, styles.flex1]}>
                <Text style={styles.label}>
                  ✅ {t('loanForm.paidInstallmentsLabel')}
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#999"
                    value={formData.paidInstallments?.toString() || "0"}
                    onChangeText={text => setFormData({ ...formData, paidInstallments: parseInt(text) || 0 })}
                  />
                </View>
              </View>
            </View>

            {/* Start Date Picker */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                📅 {t('loanForm.startDateLabel')}
              </Text>
              <TouchableOpacity 
                style={styles.dateButton} 
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.dateButtonText}>
                  {formData.startDate || t('loanForm.selectDate')}
                </Text>
                <Text style={styles.dateIcon}>📅</Text>
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
            </View>

            {/* Calculated Values */}
            <View style={styles.calculatedSection}>
              <Text style={styles.calculatedTitle}>📊 Loan Summary</Text>
              
              <View style={styles.calculatedRow}>
                <Text style={styles.calculatedLabel}>{t('loanForm.installmentAmountLabel')}:</Text>
                <Text style={styles.calculatedValue}>₹{formData.installmentAmount || 0}</Text>
              </View>
              
              <View style={styles.calculatedRow}>
                <Text style={styles.calculatedLabel}>{t('loanForm.totalAmountLabel')}:</Text>
                <Text style={styles.calculatedValue}>₹{formData.totalAmount || 0}</Text>
              </View>
              
              <View style={styles.calculatedRow}>
                <Text style={styles.calculatedLabel}>{t('loanForm.remainingAmountLabel')}:</Text>
                <Text style={[
                  styles.calculatedValue,
                  styles.remainingAmount
                ]}>₹{formData.remainingAmount || 0}</Text>
              </View>
              
              <View style={styles.calculatedRow}>
                <Text style={styles.calculatedLabel}>{t('loanForm.dueDateLabel')}:</Text>
                <Text style={styles.calculatedValue}>{formData.dueDate || t('loanForm.selectDate')}</Text>
              </View>
              
              <View style={styles.calculatedRow}>
                <Text style={styles.calculatedLabel}>{t('loanForm.statusLabel')}:</Text>
                <View style={[
                  styles.statusBadge,
                  formData.status === 'paid' && styles.statusPaid,
                  formData.status === 'pending' && styles.statusPending,
                  formData.status === 'partially_paid' && styles.statusPartiallyPaid,
                ]}>
                  <Text style={styles.statusBadgeText}>
                    {getStatusText(formData.status)}
                  </Text>
                </View>
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
              <Text style={styles.buttonText}>✕ {t('loanForm.cancel')}</Text>
            </TouchableOpacity>

            {isEditing && (
              <TouchableOpacity 
                style={[styles.button, styles.deleteButton]} 
                onPress={handleDelete}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>🗑️ {t('loanForm.delete')}</Text>
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
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {isSaving 
                  ? '⏳ ' + (isEditing ? t('loanForm.updating') : t('loanForm.saving'))
                  : (isEditing ? '💾 ' + t('loanForm.update') : '✓ ' + t('loanForm.save'))
                }
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
    maxHeight: '90%',
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
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
  userInfo: {
    flex: 1,
  },
  pickerText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  pickerTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  pickerSubtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  pickerSubtextSelected: {
    color: '#e8e8e8',
  },
  selectedUserContainer: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#e7f3ff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  selectedUserLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  selectedUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedUserPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
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
  percentageSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    marginLeft: 8,
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
    fontSize: 18,
  },
  calculatedSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  calculatedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  calculatedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calculatedLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  calculatedValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  remainingAmount: {
    color: '#dc3545',
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#6c757d',
  },
  statusPaid: {
    backgroundColor: '#28a745',
  },
  statusPending: {
    backgroundColor: '#ffc107',
  },
  statusPartiallyPaid: {
    backgroundColor: '#fd7e14',
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  noUsersContainer: {
    padding: 20,
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  noUsersText: {
    color: '#856404',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 15,
  },
  noUsersSubtext: {
    color: '#856404',
    textAlign: 'center',
    marginTop: 6,
    fontSize: 13,
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
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LoanForm;