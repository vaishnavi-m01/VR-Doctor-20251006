import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../../config/environment";
import { authService } from "../../services/authService";

interface UserContextType {
  userId: string | null;
  setUserId: (id: string) => void;
  clearUserId: () => void;
}

export const UserContext = createContext<UserContextType>({
  userId: null,
  setUserId: () => {},
  clearUserId: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
  console.log("userId", userId);
  
  // Load userId from AsyncStorage when app starts and sync with auth service
  useEffect(() => {
    const loadUserId = async () => {
      try {
        console.log("🔄 UserContext: Starting userId load process...");
        
        // First try to get userId from the old key for backward compatibility
        let storedId = await AsyncStorage.getItem("userId");
        console.log("📦 UserContext: AsyncStorage userId:", storedId);
        
        // If not found, try to get it from the user profile
        if (!storedId) {
          const userProfile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
          console.log("📦 UserContext: AsyncStorage USER_PROFILE exists:", !!userProfile);
          if (userProfile) {
            const user = JSON.parse(userProfile);
            storedId = user.UserID;
            console.log("📦 UserContext: Extracted UserID from profile:", storedId);
          }
        }
        
        // Also check auth service for current user
        const authState = authService.getAuthState();
        console.log("🔐 UserContext: Auth service state:", {
          isAuthenticated: authState.isAuthenticated,
          hasUser: !!authState.user,
          userID: authState.user?.UserID
        });
        
        if (authState.user?.UserID) {
          storedId = authState.user.UserID;
          console.log("🔐 UserContext: Using auth service userId:", storedId);
        }
        
        if (storedId) {
          setUserId(storedId);
          console.log("✅ UserContext: userId loaded and set:", storedId);
        } else {
          console.log("⚠️ UserContext: No userId found from any source");
        }
      } catch (error) {
        console.error("❌ UserContext: Error loading userId:", error);
      }
    };
    
    // Add a small delay for iPad compatibility
    const timeoutId = setTimeout(() => {
      loadUserId();
    }, 100);

    // Subscribe to auth service changes to keep userId in sync
    const unsubscribe = authService.subscribe((authState) => {
      console.log("🔄 UserContext: Auth state changed:", {
        isAuthenticated: authState.isAuthenticated,
        userId: authState.user?.UserID
      });
      
      if (authState.isAuthenticated && authState.user?.UserID) {
        setUserId(authState.user.UserID);
        console.log("✅ UserContext: userId synced from auth service:", authState.user.UserID);
      } else if (!authState.isAuthenticated) {
        setUserId(null);
        console.log("🧹 UserContext: userId cleared due to logout");
      }
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const clearUserId = () => {
    setUserId(null);
    console.log("🧹 UserContext: userId cleared");
  };

  return (
    <UserContext.Provider value={{ userId, setUserId, clearUserId }}>
      {children}
    </UserContext.Provider>
  );
};
