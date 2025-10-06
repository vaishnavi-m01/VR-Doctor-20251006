import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "../../Navigation/types";
import { WELCOME_MESSAGES, BUTTON_TEXTS } from "../../constants/appConstants";
import { Toast } from "../../components/Toast";
import { useAuth } from "../../hooks/useAuth";

export interface LoginUser {
  UserID: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Address: string;
  token: string;
  Status: number;
  CreatedBy: string;
  CreatedDate: string;
  ModifiedBy?: string | null;
  ModifiedDate?: string | null;
  message: string;
}

export interface LoginResponse {
  loginUser: LoginUser[];
}

type LoginScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList, "Login">;

const Login = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, isLoading, error, clearAuthError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    visible: false,
    message: "",
    type: "info",
  });

  useEffect(() => {
    loadSavedFormData();
  }, []);

  useEffect(() => {
    if (error) {
      setToast({
        visible: true,
        message: error,
        type: "error",
      });
      clearAuthError();
    }
  }, [error, clearAuthError]);

  const loadSavedFormData = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem("login_email");
      const savedPassword = await AsyncStorage.getItem("login_password");
      if (savedEmail) setEmail(savedEmail);
      if (savedPassword) setPassword(savedPassword);
    } catch (error) {
      console.log("Error loading saved form data:", error);
    }
  };

  const validateForm = () => {
    let isValid = true;

    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email");
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      const result = await login({
        Email: email,
        Password: password,
      });

      if (result.type === "auth/loginUser/fulfilled") {
        setToast({
          visible: true,
          message: "Login successful!",
          type: "success",
        });

        setTimeout(() => {
          navigation.navigate("Home");
        }, 1200);
      } else {
        console.log("Login failed:", result.payload);
      }
    } catch (error) {
      console.log("Login error:", error);
      setToast({
        visible: true,
        message: "Something went wrong. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white px-6 pt-[35px] rounded-[24px] overflow-hidden">
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
        />

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center">
            {isLoading && (
              <View className="absolute inset-0 bg-black/50 z-50 items-center justify-center">
                <View className="bg-white rounded-xl p-6 items-center shadow-custom-lg">
                  <ActivityIndicator size="large" color="#0e4336" />
                  <Text className="text-brand-dark-green font-zen-medium mt-3">
                    Logging in...
                  </Text>
                </View>
              </View>
            )}

            <View className="items-center mb-2">
              <Image
                source={require("../../../assets/LoginLogo.png")}
                style={{ width: 264, height: 264 }}
                resizeMode="contain"
              />

              <Text className="font-zen-bold text-2xl text-brand-text-green text-center mt-4">
                {WELCOME_MESSAGES.LOGIN}
              </Text>

              <Text className="font-zen text-sm text-gray-500 text-center m-2 pb-8">
                {WELCOME_MESSAGES.LOGIN_SUBTITLE}
              </Text>
            </View>

            {/* Email input */}
            <TextInput
              placeholder="Email"
              placeholderTextColor="#94a3b8"
              className={`font-zen border rounded-xl p-4 mb-2 w-full max-w-md self-center text-base ${
                emailError
                  ? "border-error"
                  : "border-gray-300 focus:border-brand-accent-green"
              }`}
              keyboardType="email-address"
              value={email}
              onChangeText={(text: any) => {
                setEmail(text);
                if (emailError) setEmailError("");
                if (text.trim() && !/\S+@\S+\.\S+/.test(text)) {
                  setEmailError("Please enter a valid email");
                } else if (text.trim() && /\S+@\S+\.\S+/.test(text)) {
                  setEmailError("");
                }
              }}
              style={{
                backgroundColor: "#f8f9fa",
                borderColor: emailError ? "#ef4444" : "#e5e7eb",
                borderRadius: 16,
              }}
            />
            {emailError ? (
              <Text className="text-error text-xs font-zen mb-3 self-center max-w-md">
                {emailError}
              </Text>
            ) : null}

            {/* Password input */}
            <TextInput
              placeholder="Password"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              className={`font-zen border rounded-xl p-4 mb-2 w-full max-w-md self-center text-base ${
                passwordError
                  ? "border-error"
                  : "border-gray-300 focus:border-brand-accent-green"
              }`}
              value={password}
              onChangeText={(text: any) => {
                setPassword(text);
                if (passwordError) setPasswordError("");
                if (text.trim() && text.length < 6) {
                  setPasswordError("Password must be at least 6 characters");
                } else if (text.trim() && text.length >= 6) {
                  setPasswordError("");
                }
              }}
              style={{
                backgroundColor: "#f8f9fa",
                borderColor: passwordError ? "#ef4444" : "#e5e7eb",
                borderRadius: 16,
              }}
            />
            {passwordError ? (
              <Text className="text-error text-xs font-zen mb-3 self-center max-w-md">
                {passwordError}
              </Text>
            ) : null}

            {/* Login button */}
            <TouchableOpacity
              onPress={handleLogin}
              activeOpacity={0.7}
              disabled={isLoading}
              className="w-full max-w-[300px] h-[60px] self-center mt-8"
            >
              <LinearGradient
                colors={
                  isLoading
                    ? ["#64748b", "#475569"]
                    : ["#2F005A", "#4A1B8A", "#6B2B9A"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 30,
                  paddingHorizontal: 24,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Text
                        style={{
                          fontFamily: "Zen Kaku Gothic Antique-Medium",
                          color: "white",
                          fontSize: 16,
                          flex: 1,
                          textAlign: "center",
                        }}
                      >
                        {BUTTON_TEXTS.LOGIN}
                      </Text>
                      <Text style={{ color: "white", fontSize: 18, marginLeft: 8 }}>
                        ›
                      </Text>
                    </>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Login;
