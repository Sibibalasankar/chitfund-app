import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from "react-native";
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';

export default function ForgotPasswordScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const { t } = useTranslation();
  const { currentLanguage, setLanguage } = useLanguage();

  const handleResetPassword = async () => {
    if (!phone || !newPassword) {
      Alert.alert(
        t('common.error'),
        t('forgotPassword.errors.emptyFields')
      );
      return;
    }

    setIsResetting(true);
    try {
      const response = await fetch(
        "https://chitfund-app-4b4s.onrender.com/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, newPassword }),
        }
      );

      const data = await response.json();
      if (data.success === false || data.error) {
        Alert.alert(
          t('common.error'),
          data.error || t('forgotPassword.errors.somethingWrong')
        );
      } else {
        Alert.alert(
          t('common.success'),
          t('forgotPassword.success')
        );
        navigation.navigate("Login");
      }
    } catch (err) {
      Alert.alert(
        t('common.error'),
        err.message || t('forgotPassword.errors.somethingWrong')
      );
    } finally {
      setIsResetting(false);
    }
  };

  const formatPhoneInput = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const limited = cleaned.slice(0, 10);
    setPhone(limited);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('forgotPassword.title')}</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('forgotPassword.phonePlaceholder')}
            placeholderTextColor="#888"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={formatPhoneInput}
            maxLength={10}
          />

          <TextInput
            style={styles.input}
            placeholder={t('forgotPassword.newPasswordPlaceholder')}
            placeholderTextColor="#888"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <TouchableOpacity
            style={[styles.button, isResetting && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={isResetting}
          >
            {isResetting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{t('forgotPassword.resetButton')}</Text>
            )}
          </TouchableOpacity>

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
    backgroundColor: '#007bff',
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
  title: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center' },

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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: "#007bff",
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
