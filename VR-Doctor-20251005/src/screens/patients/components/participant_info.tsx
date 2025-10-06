import { ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../Navigation/types';
import AssessItem from '../../../components/AssessItem';
import { View } from 'react-native';
import { TextInput } from 'react-native';
import { TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Text } from 'react-native';
import { apiService } from '../../../services/api';
import { authService } from '../../../services/authService';
import Toast from 'react-native-toast-message';

interface ParticipantInfoProps {
  patientId?: number;
  age?: number;
  studyId?: number;
}

export default function ParticipantInfo({ patientId = 1, age = 0, studyId = 1 }: ParticipantInfoProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  // Load notes function
  const loadNotes = async () => {
    console.log("=== LOADING NOTES FOR PARTICIPANT ===");
    console.log("Patient ID:", patientId);
    
    // Check authentication first
    const isAuth = authService.isAuthenticated();
    const token = authService.getToken();
    
    console.log("Auth status:", isAuth, "Token:", !!token);
    
    if (!isAuth || !token) {
      console.log("❌ Not authenticated, skipping notes load");
      return;
    }
    
    try {
      const response = await fetch('https://dev.3framesailabs.com:8060/api/GetParticipantNotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ParticipantId: patientId
        }),
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        console.log("❌ Response not ok:", response.status);
        setText("");
        return;
      }
      
      const data = await response.json();
      console.log("Response data:", JSON.stringify(data, null, 2));
      
      if (data.ResponseData && data.ResponseData.DoctorNotes) {
        console.log("✅ Found notes for participant:", patientId, "Notes:", data.ResponseData.DoctorNotes);
        setText(data.ResponseData.DoctorNotes);
      } else if (data.DoctorNotes) {
        console.log("✅ Found notes in direct field for participant:", patientId, "Notes:", data.DoctorNotes);
        setText(data.DoctorNotes);
      } else {
        console.log("❌ No notes found for participant:", patientId);
        setText(""); // Keep empty if no notes
      }
    } catch (error) {
      console.error("Error loading notes:", error);
      setText("");
    }
  };

  // Load notes when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log("=== SCREEN FOCUSED ===");
      console.log("Patient ID:", patientId);
      
      // Clear notes first
      setText("");
      console.log("Cleared text field");
      
      // Load notes with delay
      const timer = setTimeout(() => {
        loadNotes();
      }, 300);
      
      return () => clearTimeout(timer);
    }, [patientId])
  );

  const loadParticipantNotes = async () => {
    console.log("=== LOADING PARTICIPANT NOTES FUNCTION CALLED ===");
    console.log("Function started, patientId:", patientId);
    
    setIsLoadingNotes(true);
    try {
      console.log("=== LOADING PARTICIPANT NOTES ===");
      console.log("Patient ID:", patientId);
      console.log("Participant ID for API:", patientId);
      
      // Check authentication status
      const isAuthenticated = authService.isAuthenticated();
      const token = authService.getToken();
      const isTokenValid = authService.isTokenValid();
      
      console.log("=== AUTHENTICATION STATUS ===");
      console.log("Is authenticated:", isAuthenticated);
      console.log("Has token:", !!token);
      console.log("Token valid:", isTokenValid);
      console.log("Token preview:", token ? token.substring(0, 50) + "..." : "No token");
      
      if (!isAuthenticated || !token || !isTokenValid) {
        console.log("❌ Authentication failed - cannot make API call");
        setText("");
        return;
      }
      
      // Get notes for the actual participant ID
      console.log("=== GETTING NOTES FOR PARTICIPANT ===");
      console.log("Fetching notes for:", patientId);
      
      try {
        const response = await fetch('https://dev.3framesailabs.com:8060/api/GetParticipantNotes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authService.getAuthHeader(),
          },
          body: JSON.stringify({
            ParticipantId: patientId
          }),
        });
        
        console.log("Response status:", response.status);
        console.log("Response ok:", response.ok);
        
        if (!response.ok) {
          console.log("❌ Response not ok:", response.status, response.statusText);
          setText("");
          return;
        }
        
        const data = await response.json();
        console.log("Response data:", JSON.stringify(data, null, 2));
        console.log("Response data type:", typeof data);
        console.log("Response data keys:", Object.keys(data));
        
        if (data.ResponseData && data.ResponseData.DoctorNotes) {
          console.log("✅ Found notes for participant:", patientId, "Notes:", data.ResponseData.DoctorNotes);
          setText(data.ResponseData.DoctorNotes);
        } else if (data.DoctorNotes) {
          console.log("✅ Found notes in direct field for participant:", patientId, "Notes:", data.DoctorNotes);
          setText(data.DoctorNotes);
        } else {
          console.log("❌ No notes found for participant:", patientId);
          console.log("Available data:", data);
          setText("");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        console.error("Error message:", error.message);
        setText("");
      }
      
    } catch (error) {
      console.error("❌ Error loading participant notes:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
      setText(""); // Clear the text field on error
    } finally {
      setIsLoadingNotes(false);
      console.log("=== LOADING COMPLETE ===");
    }
  };

  const handleSave = async () => {
    if (!text.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter some notes before updating",
        position: "top",
        topOffset: 50,
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Updating participant notes:", { participantId: patientId, notes: text });
      
      const response = await apiService.updateParticipantNotes(
        patientId, // patientId is already formatted as PID-{id}
        text.trim()
      );

      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Notes updated successfully",
          position: "top",
          topOffset: 50,
        });
        console.log("Notes updated successfully:", response.data);
        
        // Reload notes after successful update to ensure we have the latest data
        await loadParticipantNotes();
      } else {
        throw new Error(response.message || "Failed to update notes");
      }
    } catch (error) {
      console.error("Error updating participant notes:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update notes. Please try again.",
        position: "top",
        topOffset: 50,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 p-4">

      <AssessItem
        icon="📋"
        title="Socio Demographic Form"
        subtitle="Personal Information, education, and contact information"
        onPress={() => navigation.navigate("SocioDemographic", { patientId, age, studyId })}
        className="bg-[#F6F7F7] border-[#F6F7F7]"
      />

      <AssessItem
        icon="❤️"
        title="Participant Screening Form"
        subtitle="Assess eligibility, medical history, and clinical checklist"
        onPress={() => navigation.navigate("PatientScreening", { patientId, age: age || 0, studyId: studyId || 1 })}
        className="bg-[#F6F7F7] border-[#F6F7F7]"
      />

      <AssessItem
        icon="📝"
        title="Informed Consent Form"
        subtitle="Study details, participant information, acknowledgements, and signatures"
        onPress={() => navigation.navigate("InformedConsent", { patientId, age, studyId })}
        className="bg-[#F6F7F7] border-[#F6F7F7]"
      />

      <AssessItem
        icon="📊"
        title="Study and Control Group Assignment"
        subtitle="Assign participants to study groups and track assignments"
        onPress={() =>
          navigation.navigate('StudyGroupAssignment', { patientId, age: age || 0, studyId: studyId || 1 })
        }
        className="bg-[#F6F7F7] border-[#F6F7F7]" />

      <View className="p-4 bg-white">
        {/* TextArea */}
        <TextInput
          className="flex-1 border border-gray-300 rounded-xl p-3 text-gray-700"
          multiline
          placeholder={isLoadingNotes ? "Loading notes..." : "Enter your notes..."}
          value={text}
          onChangeText={setText}
          numberOfLines={5}
          style={{ minHeight: 100, maxHeight: 150 }}
          editable={!isLoadingNotes}
        />

        {/* Buttons */}
        <View className="flex-row items-end justify-end mt-4">

          {/* Update Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={isLoading || isLoadingNotes}
            className={`px-6 py-2.5 rounded-lg border ${
              isLoading || isLoadingNotes
                ? 'bg-gray-100 border-gray-300' 
                : 'bg-green-100 border-green-600'
            }`}
            // style={{ width: 100 }}
          >
            <Text className={`text-center font-bold text-base ${
              isLoading || isLoadingNotes ? 'text-gray-400' : 'text-green-600'
            }`}>
              {isLoading ? 'Updating...' : isLoadingNotes ? 'Loading...' : 'Update'}
            </Text>
          </TouchableOpacity>
        </View>

      </View>


    </ScrollView>
  );
}
