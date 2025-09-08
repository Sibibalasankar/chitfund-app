import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import axios from "axios";

const API_BASE = "http://192.168.1.44:5000/api";

export default function ResetPasswordScreen({ route, navigation }) {
  const { phone } = route.params; // Only phone needed
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!newPassword) return Alert.alert("Error", "Enter new password");

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/auth/reset-password`, { phone, newPassword });
      Alert.alert("Success", res.data.message, [{ text: "OK", onPress: () => navigation.navigate("Login") }]);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleReset}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 8 },
  button: { backgroundColor: "#007bff", padding: 15, borderRadius: 8 },
  buttonDisabled: { backgroundColor: "#6c757d" },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
