import { Ionicons } from '@expo/vector-icons';
import axios from "axios";
import { useState } from "react";
import { 
  ActivityIndicator, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View 
} from "react-native";
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { validatePassword } from '../utils/validation';

const API_BASE = "https://chitfund-app-4b4s.onrender.com/api";

export default function ResetPasswordScreen({ route, navigation }) {
  const { phone } = route.params; // Only phone needed
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { currentLanguage, setLanguage } = useLanguage();

  const handleReset = async () => {
    if (!newPassword) {
      return Alert.alert(t('common.error'), t('resetPassword.validation.passwordRequired'));
    }

    if (!validatePassword(newPassword)) {
      return Alert.alert(t('common.error'), t('resetPassword.validation.invalidPassword'));
    }

    if (newPassword !== confirmPassword) {
      return Alert.alert(t('common.error'), t('resetPassword.validation.passwordsNotMatch'));
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/auth/reset-password`, { phone, newPassword });
      Alert.alert(
        t('common.success'), 
        res.data.message, 
        [{ text: t('common.ok'), onPress: () => navigation.navigate("Login") }]
      );
    } catch (err) {
      Alert.alert(
        t('common.error'), 
        err.response?.data?.error || err.message || t('resetPassword.errors.somethingWrong')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('resetPassword.title')}</Text>
          <Text style={styles.subtitle}>{t('resetPassword.subtitle')}</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>{t('resetPassword.formTitle')}</Text>

          {/* New Password */}
          <View style={styles.inputContainer}>
            <View style={styles.passwordWrapper}>
      <TextInput
                style={styles.passwordInput}
                placeholder={t('resetPassword.newPasswordPlaceholder')}
        placeholderTextColor="#888"
                secureTextEntry={!showPassword}
        value={newPassword}
        onChangeText={setNewPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={22}
                  color="#007bff"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                placeholderTextColor="#888"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword((prev) => !prev)}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={22}
                  color="#007bff"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Reset Button */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleReset}
        disabled={loading}
      >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{t('resetPassword.resetButton')}</Text>
            )}
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>{t('common.back')}</Text>
          </TouchableOpacity>
        </View>

        {/* Language Switch */}
        <View style={styles.languageContainer}>
          <TouchableOpacity
            style={[
              styles.languageButton,
              currentLanguage === 'en' && styles.languageButtonActive
            ]}
            onPress={() => setLanguage('en')}
          >
            <Text style={[
              styles.languageText,
              currentLanguage === 'en' && styles.languageTextActive
            ]}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.languageButton,
              currentLanguage === 'ta' && styles.languageButtonActive
            ]}
            onPress={() => setLanguage('ta')}
          >
            <Text style={[
              styles.languageText,
              currentLanguage === 'ta' && styles.languageTextActive
            ]}>தமிழ்</Text>
      </TouchableOpacity>
    </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { flexGrow: 1, paddingVertical: 20, justifyContent: 'flex-start' },
  
  header: {
    backgroundColor: '#dc3545',
    paddingVertical: 60,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    alignItems: 'center',
    marginBottom: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255, 255, 255, 0.85)', textAlign: 'center' },

  formContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: { marginBottom: 15 },
  
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 10,
    height: 50,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },

  button: {
    backgroundColor: "#dc3545",
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonDisabled: { backgroundColor: '#6c757d' },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 16 },

  backButton: { padding: 10, alignItems: 'center' },
  backButtonText: { color: '#007bff', fontSize: 14 },

  languageContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25, marginBottom: 30 },
  languageButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007bff',
    backgroundColor: 'white',
  },
  languageButtonActive: { backgroundColor: '#007bff' },
  languageText: { color: '#007bff', fontSize: 14 },
  languageTextActive: { color: 'white' },
});
