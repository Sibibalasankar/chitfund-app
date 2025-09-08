import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // 👈 vector icons
import { useAuth } from '../contexts/AuthContext';
import { useForm } from '../hooks/useForm';
import { validatePhone, validatePassword } from '../utils/validation';

const LoginScreen = ({ navigation }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👈 toggle state
  const { login, isLoading } = useAuth();

  const validate = (values) => {
    const errors = {};

    if (!values.phone) {
      errors.phone = 'Mobile number is required';
    } else if (!validatePhone(values.phone)) {
      errors.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (!values.password) {
      errors.password = 'Password is required';
    } else if (!validatePassword(values.password)) {
      errors.password = 'Password must be at least 6 characters';
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
      // AuthContext updates user, AppNavigator switches stack
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const formatPhoneInput = (text) => {
    const cleaned = text.replace(/\D/g, ''); // only numbers
    const limited = cleaned.slice(0, 10); // max 10 digits
    handleChange('phone', limited);
  };

  if (isLoading) {
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
        <View style={styles.header}>
          <Text style={styles.title}>Chit Fund App</Text>
          <Text style={styles.subtitle}>Manage your funds efficiently</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Login with Mobile Number</Text>

          {/* Phone input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                errors.phone && touched.phone && styles.inputError,
              ]}
              placeholder="Mobile Number (10 digits)"
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

          {/* Password input with eye toggle */}
          <View style={styles.inputContainer}>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                value={values.password}
                onChangeText={(value) => handleChange('password', value)}
                onBlur={() => handleBlur('password')}
                secureTextEntry={!showPassword} // 👈 toggle
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

          {/* Login button */}
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
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Forgot password */}
          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Demo accounts */}
        {/* <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>Demo Accounts</Text>
          <View style={styles.demoAccount}>
            <Text style={styles.demoAccountText}>
              Admin: 9876543210 / admin123
            </Text>
          </View>
          <View style={styles.demoAccount}>
            <Text style={styles.demoAccountText}>
              User: 9876543211 / user123
            </Text>
          </View>
        </View> */}

        {/* Register link */}
        <View style={styles.registerSection}>
          <Text style={styles.registerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Sign up now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { flexGrow: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: { marginTop: 10, color: '#666' },
  header: {
    backgroundColor: '#007bff',
    padding: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
  },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 10 },
  subtitle: { fontSize: 16, color: 'rgba(255, 255, 255, 0.8)' },
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
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: { marginBottom: 15 },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },
  inputError: { borderColor: '#dc3545' },
  errorText: { color: '#dc3545', fontSize: 12, marginTop: 5, marginLeft: 5 },
  loginButton: {
    height: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 15,
  },
  loginButtonDisabled: { backgroundColor: '#6c757d' },
  loginButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  forgotPassword: { alignItems: 'center' },
  forgotPasswordText: { color: '#007bff', fontSize: 14 },
  demoSection: { padding: 20, marginTop: 20 },
  demoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  demoAccount: {
    backgroundColor: '#e9ecef',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  demoAccountText: { textAlign: 'center', color: '#666' },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 10,
    marginBottom: 30,
  },
  registerText: { color: '#666', marginRight: 5 },
  registerLink: { color: '#007bff', fontWeight: 'bold' },

  // 👇 Password input wrapper
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
    color: '#333',
  },
});

export default LoginScreen;
