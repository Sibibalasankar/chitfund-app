// src/screens/ResetPasswordScreen.js
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import axios from "axios";

const API_BASE = "http://192.168.1.44:5000/api"; // 🔹 change if running on device

const ResetPasswordScreen = ({ route, navigation }) => {
    const { phone } = route.params || {}; // phone passed from ForgotPassword
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!otp || !newPassword) {
            Alert.alert("Error", "Please enter OTP and new password");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(`${API_BASE}/auth/reset-password`, {
                phone,
                otp,
                newPassword,
            });

            Alert.alert("Success", res.data.message, [
                {
                    text: "OK",
                    onPress: () => navigation.navigate("Login"),
                },
            ]);
        } catch (err) {
            console.error("Reset error:", err.response?.data || err.message);
            Alert.alert("Error", err.response?.data?.error || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.form}>
                    <Text style={styles.title}>Reset Password</Text>
                    <Text style={styles.subtitle}>
                        Enter the OTP sent to your mobile and your new password.
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="OTP"
                        keyboardType="numeric"
                        value={otp}
                        onChangeText={setOtp}
                    />

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
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Reset Password</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f5f5" },
    scroll: { flexGrow: 1, justifyContent: "center", padding: 20 },
    form: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
    subtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 20,
        textAlign: "center",
    },
    input: {
        height: 50,
        borderColor: "#ddd",
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: "#f9f9f9",
    },
    button: {
        height: 50,
        backgroundColor: "#007bff",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
    },
    buttonDisabled: { backgroundColor: "#6c757d" },
    buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});

export default ResetPasswordScreen;
