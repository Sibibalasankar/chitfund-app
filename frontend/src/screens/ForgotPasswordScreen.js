import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import axios from "axios";

const API_BASE_URL = "http://192.168.1.44:5000/api"; // ✅ your backend

export default function ForgotPasswordScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleForgotPassword = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { phone });
      setMessage(res.data.message); // "OTP sent"
      // ✅ Navigate to reset screen with phone param
      navigation.navigate("ResetPassword", { phone });
    } catch (err) {
      console.error("Forgot password error:", err.message);
      setMessage(err.response?.data?.error || "Error sending OTP");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
        <Text style={styles.buttonText}>Send OTP</Text>
      </TouchableOpacity>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 8 },
  button: { backgroundColor: "#007bff", padding: 15, borderRadius: 8 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  message: { marginTop: 10, textAlign: "center", color: "green" },
});
