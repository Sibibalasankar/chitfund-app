import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
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
  View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { useForm } from '../hooks/useForm';
import {
  getPasswordStrength,
  validateName,
  validatePassword,
  validatePhone,
} from '../utils/validation';

const RegisterScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const { currentLanguage, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const validate = (values) => {
    const errors = {};

    if (!values.name) {
      errors.name = t('register.validation.nameRequired');
    } else if (!validateName(values.name)) {
      errors.name = t('register.validation.invalidName');
    }

    if (!values.phone) {
      errors.phone = t('register.validation.phoneRequired');
    } else if (!validatePhone(values.phone)) {
      errors.phone = t('register.validation.invalidPhone');
    }

    if (!values.password) {
      errors.password = t('register.validation.passwordRequired');
    } else if (!validatePassword(values.password)) {
      errors.password = t('register.validation.invalidPassword');
    }

    if (!values.confirmPassword) {
      errors.confirmPassword = t('register.validation.confirmPasswordRequired');
    } else if (values.password && values.password !== values.confirmPassword) {
      errors.confirmPassword = t('register.validation.passwordsNotMatch');
    }

    return errors;
  };

  const { values, errors, touched, handleChange, handleBlur, validateForm } =
    useForm(
      {
        name: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'participant',
      },
      validate
    );

  const passwordStrength = getPasswordStrength(values.password);

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await register(values);
      Alert.alert(t('common.success'), t('register.success'), [
        { text: 'OK', onPress: () => navigation.replace('Login') },
      ]);
    } catch (error) {
      Alert.alert(t('register.errors.registrationFailed'), error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneInput = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const limited = cleaned.slice(0, 10);
    handleChange('phone', limited);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.strength === 0) return '#6c757d';
    if (passwordStrength.strength === 1) return '#dc3545';
    if (passwordStrength.strength === 2) return '#fd7e14';
    if (passwordStrength.strength === 3) return '#ffc107';
    if (passwordStrength.strength === 4) return '#28a745';
    return '#007bff';
  };

  const getPasswordStrengthLabel = () => {
    const strengthLabels = {
      0: t('register.passwordStrength.veryWeak'),
      1: t('register.passwordStrength.weak'),
      2: t('register.passwordStrength.fair'),
      3: t('register.passwordStrength.good'),
      4: t('register.passwordStrength.strong'),
      5: t('register.passwordStrength.veryStrong')
    };
    return strengthLabels[passwordStrength.strength] || '';
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('register.title')}</Text>
          <Text style={styles.subtitle}>{t('register.subtitle')}</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Full Name */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.name && touched.name && styles.inputError]}
              placeholder={t('register.namePlaceholder')}
              placeholderTextColor="#888"
              value={values.name}
              onChangeText={(value) => handleChange('name', value)}
              onBlur={() => handleBlur('name')}
              autoCapitalize="words"
            />
            {errors.name && touched.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}
          </View>

          {/* Phone */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.phone && touched.phone && styles.inputError]}
              placeholder={t('register.phonePlaceholder')}
              placeholderTextColor="#888"
              value={values.phone}
              onChangeText={formatPhoneInput}
              onBlur={() => handleBlur('phone')}
              keyboardType="phone-pad"
              maxLength={10}
            />
            {errors.phone && touched.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.passwordInput]}
                placeholder={t('register.passwordPlaceholder')}
                placeholderTextColor="#888"
                value={values.password}
                onChangeText={(value) => handleChange('password', value)}
                onBlur={() => handleBlur('password')}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={22}
                  color="#007bff"
                />
              </TouchableOpacity>
            </View>
            {values.password.length > 0 && (
              <View style={styles.passwordStrengthContainer}>
                <View style={styles.passwordStrengthBar}>
                  <View
                    style={[
                      styles.passwordStrengthFill,
                      {
                        width: `${(passwordStrength.strength / 5) * 100}%`,
                        backgroundColor: getPasswordStrengthColor(),
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.passwordStrengthText,
                    { color: getPasswordStrengthColor() },
                  ]}
                >
                  {getPasswordStrengthLabel()}
                </Text>
              </View>
            )}
            {errors.password && touched.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder={t('register.confirmPasswordPlaceholder')}
                placeholderTextColor="#888"
                value={values.confirmPassword}
                onChangeText={(value) => handleChange('confirmPassword', value)}
                onBlur={() => handleBlur('confirmPassword')}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword((prev) => !prev)}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={22}
                  color="#007bff"
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && touched.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.registerButtonText}>
                {t('register.registerButton')}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              {t('register.terms')}
            </Text>
          </View>
        </View>

        {/* Language Switch Button */}
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
            ]}>
              English
            </Text>
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
            ]}>
              தமிழ்
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.loginSection}>
          <Text style={styles.loginText}>{t('register.haveAccount')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>{t('register.signIn')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  scrollContent: { 
    flexGrow: 1, 
    paddingBottom: 30 
  },

  // ================= HEADER =================
  header: {
    backgroundColor: '#28a745',
    paddingVertical: 60,       // vertical spacing
    paddingHorizontal: 20,     // horizontal padding
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',      // horizontally center title
    justifyContent: 'center',
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: 'white', 
    textAlign: 'center', 
    marginBottom: 8, 
  },
  subtitle: { 
    fontSize: 16, 
    color: 'rgba(255, 255, 255, 0.85)', 
    textAlign: 'center', 
  },

  // ================= FORM =================
  formContainer: {
    padding: 20,
    marginTop: 20,             // space below header
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: { marginBottom: 15 },
  input: {
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    color: '#000',
  },
  inputError: { borderColor: '#dc3545' },
  errorText: { color: '#dc3545', fontSize: 12, marginTop: 5, marginLeft: 5 },

  // ================= PASSWORD =================
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    paddingRight: 10,
    height: 50,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingHorizontal: 10,
  },
  passwordStrengthContainer: { marginTop: 8 },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    overflow: 'hidden',
  },
  passwordStrengthFill: { height: '100%', borderRadius: 2 },
  passwordStrengthText: { fontSize: 12, marginTop: 4, fontWeight: '500' },

  // ================= BUTTONS =================
  registerButton: {
    height: 50,
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 15,
  },
  registerButtonDisabled: { backgroundColor: '#6c757d' },
  registerButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  termsContainer: { marginBottom: 10 },
  termsText: { fontSize: 12, color: '#6c757d', textAlign: 'center' },

  // ================= LOGIN LINK =================
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 10,
    marginBottom: 30,
  },
  loginText: { color: '#666', marginRight: 5 },
  loginLink: { color: '#007bff', fontWeight: 'bold' },

  // ================= LANGUAGE SWITCH =================
  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
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


export default RegisterScreen;