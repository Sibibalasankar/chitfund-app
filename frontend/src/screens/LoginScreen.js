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
import { useResponsive } from '../hooks/useResponsive';
import { validatePassword, validatePhone } from '../utils/validation';

const LoginScreen = ({ navigation }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const { currentLanguage, setLanguage, isLanguageReady } = useLanguage();
  const { t } = useTranslation();
  const { isDesktop, isTablet, screenWidth, containerWidth } = useResponsive();

  const validate = (values) => {
    const errors = {};

    if (!values.phone) {
      errors.phone = t('login.validation.mobileRequired');
    } else if (!validatePhone(values.phone)) {
      errors.phone = t('login.validation.invalidMobile');
    }

    if (!values.password) {
      errors.password = t('login.validation.passwordRequired');
    } else if (!validatePassword(values.password)) {
      errors.password = t('login.validation.invalidPassword');
    }

    return errors;
  };

  const { values, errors, touched, handleChange, handleBlur, validateForm } =
    useForm({ phone: '', password: '' }, validate);

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoggingIn(true);
    try {
      await login(values.phone, values.password);
    } catch (error) {
      Alert.alert(
        t('login.errors.loginFailed'),
        error.message
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const formatPhoneInput = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const limited = cleaned.slice(0, 10);
    handleChange('phone', limited);
  };

  if (!isLanguageReady || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isDesktop ? (
          // Desktop Layout
          <View style={styles.desktopLayout}>
            <View style={styles.desktopLeft}>
              <View style={styles.header}>
                <Text style={styles.title}>{t('login.title')}</Text>
                <Text style={styles.subtitle}>{t('login.subtitle')}</Text>
              </View>
            </View>
            
            <View style={styles.desktopRight}>
              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>{t('login.formTitle')}</Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      errors.phone && touched.phone && styles.inputError,
                    ]}
                    placeholder={t('login.mobileNumber')}
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

                <View style={styles.inputContainer}>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder={t('login.password')}
                      placeholderTextColor="#888"
                      value={values.password}
                      onChangeText={(value) => handleChange('password', value)}
                      onBlur={() => handleBlur('password')}
                      secureTextEntry={!showPassword}
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
                  {errors.password && touched.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    isLoggingIn && styles.loginButtonDisabled,
                  ]}
                  onPress={handleLogin}
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.loginButtonText}>
                      {t('login.loginButton')}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.forgotPassword}
                  onPress={() => navigation.navigate('ForgotPassword')}
                >
                  <Text style={styles.forgotPasswordText}>
                    {t('login.forgotPassword')}
                  </Text>
                </TouchableOpacity>

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

                <View
                  style={[
                    styles.registerSection,
                    currentLanguage === 'ta' && styles.registerSectionTamil
                  ]}
                >
                  <Text
                    style={[
                      styles.registerText,
                      currentLanguage === 'ta' && { marginRight: 0, marginBottom: 5 }
                    ]}
                  >
                    {t('login.noAccount')}
                  </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.registerLink}>
                      {t('login.signUp')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ) : (
          // Mobile/Tablet Layout
          <>
            <View style={styles.header}>
              <Text style={styles.title}>{t('login.title')}</Text>
              <Text style={styles.subtitle}>{t('login.subtitle')}</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>{t('login.formTitle')}</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    errors.phone && touched.phone && styles.inputError,
                  ]}
                  placeholder={t('login.mobileNumber')}
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

              <View style={styles.inputContainer}>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder={t('login.password')}
                    placeholderTextColor="#888"
                    value={values.password}
                    onChangeText={(value) => handleChange('password', value)}
                    onBlur={() => handleBlur('password')}
                    secureTextEntry={!showPassword}
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
                {errors.password && touched.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isLoggingIn && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.loginButtonText}>
                    {t('login.loginButton')}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={styles.forgotPasswordText}>
                  {t('login.forgotPassword')}
                </Text>
              </TouchableOpacity>
            </View>

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

            <View
              style={[
                styles.registerSection,
                currentLanguage === 'ta' && styles.registerSectionTamil
              ]}
            >
              <Text
                style={[
                  styles.registerText,
                  currentLanguage === 'ta' && { marginRight: 0, marginBottom: 5 }
                ]}
              >
                {t('login.noAccount')}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>
                  {t('login.signUp')}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
    flexGrow: 1 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: { 
    marginTop: 10, 
    color: '#666' 
  },
  
  // Desktop Layout Styles
  desktopLayout: {
    flexDirection: 'row',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  desktopLeft: {
    flex: 1,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  desktopRight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#f5f5f5',
  },
  
  // Mobile/Tablet Header
  header: {
    backgroundColor: '#007bff',
    padding: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: 'white', 
    marginBottom: 10 
  },
  subtitle: { 
    fontSize: 16, 
    color: 'rgba(255, 255, 255, 0.8)' 
  },
  
  // Form Container
  formContainer: {
    padding: 20,
    marginTop: -20,
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 300,
    maxWidth: 400,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: { 
    marginBottom: 15 
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
    color: '#000',
  },
  inputError: { 
    borderColor: '#dc3545' 
  },
  errorText: { 
    color: '#dc3545', 
    fontSize: 12, 
    marginTop: 5, 
    marginLeft: 5 
  },
  loginButton: {
    height: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 15,
  },
  loginButtonDisabled: { 
    backgroundColor: '#6c757d' 
  },
  loginButtonText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  forgotPassword: { 
    alignItems: 'center' 
  },
  forgotPasswordText: { 
    color: '#007bff', 
    fontSize: 14 
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 10,
    marginBottom: 30,
  },
  registerSectionTamil: {
    flexDirection: 'column', // stacked vertically in Tamil
  },
  registerText: {
    color: '#666',
    marginRight: 5,
    textAlign: 'center',
  },
  registerLink: {
    color: '#007bff',
    fontWeight: 'bold',
    textAlign: 'center',
  },

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
  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
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
  languageButtonActive: {
    backgroundColor: '#007bff',
  },
  languageText: {
    color: '#007bff',
    fontSize: 14,
  },
  languageTextActive: {
    color: 'white',
  },
});

export default LoginScreen;