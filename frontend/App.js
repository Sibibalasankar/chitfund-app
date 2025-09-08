import React, { useRef, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { DataProvider } from './src/contexts/DataContext';
import { setNavigator } from './src/services/navigationService';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import AdminDashboard from './src/screens/AdminDashboard';
import ParticipantDashboard from './src/screens/ParticipantDashboard';

const Stack = createStackNavigator();

/* ============================
   AUTH STACK (Login/Register/Forgot/Reset)
============================ */
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      {/* Forgot password & reset */}
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}

/* ============================
   ADMIN STACK
============================ */
function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
    </Stack.Navigator>
  );
}

/* ============================
   PARTICIPANT STACK
============================ */
function ParticipantStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ParticipantDashboard" component={ParticipantDashboard} />
    </Stack.Navigator>
  );
}

/* ============================
   APP NAVIGATOR
============================ */
function AppNavigator() {
  const { user } = useAuth();
  const navigationRef = useRef();

  useEffect(() => {
    if (navigationRef.current) {
      setNavigator(navigationRef.current);
    }
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      {!user ? (
        <AuthStack />
      ) : user.role === 'admin' ? (
        <AdminStack />
      ) : (
        <ParticipantStack />
      )}
    </NavigationContainer>
  );
}

/* ============================
   ROOT APP
============================ */
export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppNavigator />
      </DataProvider>
    </AuthProvider>
  );
}
