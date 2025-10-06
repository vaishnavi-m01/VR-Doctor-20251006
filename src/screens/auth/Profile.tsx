import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Modal,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "../../Navigation/types";
import { apiService } from "src/services";
import { useAuth } from "../../hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { TouchableOpacity } from "react-native";

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Profile"
>;

interface UserProfile {
  name: string;
  email: string;
  role?: string;
  organization?: string;
  phone?: string;
  avatar?: string;
}

export default function Profile() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);

      if (user) {
        setProfile({
          name: `${user.FirstName} ${user.LastName}`,
          email: user.Email,
          phone: user.PhoneNumber,
          role: user.RoleName,
          organization: user.Address,
        });
        setIsLoading(false);
        return;
      }

      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        console.warn("UserId not found in AsyncStorage");
        setIsLoading(false);
        return;
      }

      const response = await apiService.post<any>("/GetUsersMaster", {
        UserID: userId,
      });

      const users = response.data.ResponseData;
      if (users && users.length > 0) {
        const firstUser = users[0];
        setProfile({
          name: `${firstUser.FirstName} ${firstUser.LastName}`,
          email: firstUser.Email,
          phone: firstUser.PhoneNumber,
          role: firstUser.RoleId,
          organization: firstUser.Address,
        });
      }
    } catch (error) {
      console.log("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmLogout = async () => {
    setIsLoading(true);
    try {
      const userId = await AsyncStorage.getItem("userId");

      const response = await apiService.post<any>("/Logout", {
        UserID: userId || "UID-1",
      });

      const message =
        response?.data?.logoutUser?.[0]?.message || "Logout successful";

      Toast.show({
        type: "success",
        text1: message,
      });

      await logout();

      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.log("Error during logout:", error);
      Toast.show({
        type: "error",
        text1: "Failed to logout. Please try again.",
      });
    } finally {
      setIsLoading(false);
      setShowLogoutModal(false);
    }
  };

  const handleEditProfile = () => {
    Toast.show({
      type: "info",
      text1: "Edit Profile feature coming soon!",
    });
  };

  const handleChangePassword = () => {
    Toast.show({
      type: "info",
      text1: "Change Password feature coming soon!",
    });
  };

  if (isLoading && !profile.name) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#0ea06c" />
        <Text className="mt-4 text-gray-600">Loading profile...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-6 shadow-sm">
        <View className="flex-row items-center justify-between mb-6">
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </Pressable>
          <Text className="text-xl font-bold text-gray-800">
            Profile & Settings
          </Text>
          <View className="w-10" />
        </View>

        {/* Profile Avatar */}
        <View className="items-center">
          <View className="relative mb-4">
            <View className="w-28 h-28 rounded-full bg-green-500 items-center justify-center shadow-lg">
              {profile.avatar ? (
                <Image
                  source={{ uri: profile.avatar }}
                  className="w-28 h-28 rounded-full"
                />
              ) : (
                <Text className="text-white text-4xl font-bold">
                  {profile.name.charAt(0) || "U"}
                </Text>
              )}
            </View>
            <Pressable className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border-2 border-green-500 items-center justify-center shadow-sm">
              <Ionicons name="camera" size={16} color="#0ea06c" />
            </Pressable>
          </View>

          <Text className="text-2xl font-bold text-gray-800 mb-1">
            {profile.name || "User"}
          </Text>
          <Text className="text-green-600 font-semibold text-base mb-1">
            {profile.role || "User Role"}
          </Text>
          <Text className="text-gray-500 text-sm text-center">
            {profile.organization || "Organization"}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal Information */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-4">
              <Ionicons name="person" size={20} color="#3b82f6" />
            </View>
            <Text className="text-lg font-bold text-gray-800">
              Personal Information
            </Text>
          </View>

          {[
            { label: "Full Name", value: profile.name, icon: "person-outline" },
            { label: "Email", value: profile.email, icon: "mail-outline" },
            { label: "Phone", value: profile.phone, icon: "call-outline" },
            { label: "Role", value: profile.role, icon: "briefcase-outline" },
            {
              label: "Organization",
              value: profile.organization,
              icon: "business-outline",
            },
          ].map((item, index) => (
            <View
              key={index}
              className={`flex-row items-center justify-between py-4 ${index !== 4 ? "border-b border-gray-100" : ""
                }`}
            >
              <View className="flex-row items-center">
                <Ionicons name={item.icon as any} size={20} color="#6b7280" />
                <Text className="text-gray-600 ml-3">{item.label}</Text>
              </View>
              <Text className="font-semibold text-gray-800 text-right flex-1 ml-4">
                {item.value || "Not provided"}
              </Text>
            </View>
          ))}
        </View>

        {/* Account Settings */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-4">
              <Ionicons name="settings" size={20} color="#8b5cf6" />
            </View>
            <Text className="text-lg font-bold text-gray-800">
              Account Settings
            </Text>
          </View>

          <View className="space-y-2">
            <Pressable
              onPress={handleEditProfile}
              className="flex-row items-center justify-between py-4 px-2 rounded-xl active:bg-gray-50"
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-4">
                  <Ionicons name="create-outline" size={18} color="#3b82f6" />
                </View>
                <Text className="text-gray-700 font-medium text-base">
                  Edit Profile
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>

            <Pressable
              onPress={handleChangePassword}
              className="flex-row items-center justify-between py-4 px-2 rounded-xl active:bg-gray-50"
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center mr-4">
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color="#f97316"
                  />
                </View>
                <Text className="text-gray-700 font-medium text-base">
                  Change Password
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
          </View>
        </View>


        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <View className="flex-row justify-between items-center mb-6">

            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
              <Ionicons name="information-circle" size={20} color="#6b7280" />
            </View>


            <View className="flex-1 flex-row justify-between items-center">
              <Text className="text-lg font-bold text-gray-800">App Information</Text>
              <TouchableOpacity activeOpacity={0.8}    onPress={() => navigation.navigate("AboutUs")}>
                <View className="flex-row items-center bg-green-500 rounded-full px-4 py-2 ">
                  <Text className="text-white text-base  font-semibold">About Us</Text>
                </View>
              </TouchableOpacity>


            </View>
          </View>

          <View className="space-y-4">
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-gray-600">App Version</Text>
              <Text className="font-semibold text-gray-800">1.0.0</Text>
            </View>

            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-gray-600">Build Number</Text>
              <Text className="font-semibold text-gray-800">2024.09.11</Text>
            </View>

            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-gray-600">Last Updated</Text>
              <Text className="font-semibold text-gray-800">September 11, 2024</Text>
            </View>

            <View className="flex-row items-center justify-between py-3">
              <Text className="text-gray-600">Device ID</Text>
              <Text className="font-semibold text-gray-800 text-xs">iPad Pro 11-inch</Text>
            </View>
          </View>
        </View>


        {/* Logout */}
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <Pressable
            onPress={() => setShowLogoutModal(true)}
            disabled={isLoading}
            className="flex-row items-center justify-center py-4 px-6 rounded-xl bg-red-50 border border-red-200 active:bg-red-100"
          >
            <Ionicons name="log-out-outline" size={20} color="#dc2626" />
            <Text className="text-red-600 font-semibold text-base ml-3">
              Logout
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Logout Modal */}
      <Modal transparent visible={showLogoutModal} animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white p-6 rounded-2xl w-80">
            <Text className="text-lg font-bold text-center mb-3">
              Confirm Logout
            </Text>
            <Text className="text-gray-600 text-center mb-6">
              Are you sure you want to logout?
            </Text>

            <View className="flex-row justify-between">
              <Pressable
                onPress={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 flex-1 mr-2"
              >
                <Text className="text-center text-gray-700 font-semibold">
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={confirmLogout}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-red-500 flex-1 ml-2"
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-center text-white font-semibold">
                    Yes, Logout
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>``
      </Modal>
    </View>
  );
}
