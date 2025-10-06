import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import FormCard from '@components/FormCard';
import Segmented from '@components/Segmented';
import { Field } from '@components/Field';
import DateField from '@components/DateField';
import BottomBar from '@components/BottomBar';
import { Btn } from '@components/Button';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation/types';
import { apiService } from 'src/services';
import Toast from 'react-native-toast-message';
import { DropdownField } from '@components/DropdownField';
import { formatForDB, formatForUI } from 'src/utils/date';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { TouchableOpacity } from 'react-native';
import SignatureModal from '@components/SignatureModal';
import AsyncStorage from '@react-native-async-storage/async-storage';




type LifeStyleData = {
  HabitID: string;
  StudyId: string;
  Habit: string;
};

interface ParticipantLifestyle {
  Lifestyle: string;
  Level: string;

}


interface ParticipantDetails {
  RandomizationId?: string;
  MRNumber?: string;
  Age?: number;
  PhoneNumber?: number;
  EmergencyContact?: number;
  EmergencyContactNumber?: number;
  EmergencyPhone?: number;
  Gender?: string;
  MaritalStatus?: string;
  NumberOfChildren?: number;
  FaithContributeToWellBeing?: string;
  PracticeAnyReligion?: string;
  ReligionType?: string;
  EducationLevel?: string;
  EmploymentStatus?: string;
  KnowledgeIn?: string;

  CancerDiagnosis?: string;
  StageOfCancer?: string;
  ScoreOfECOG?: string;
  TypeOfTreatment?: string;
  TreatmentStartDate?: string;
  DurationOfTreatmentMonths?: number;
  OtherMedicalConditions?: string;
  CurrentMedications?: string;
  StartDateOfTreatment?: string;

  SmokingHistory?: string;
  AlcoholConsumption?: string;
  PhysicalActivityLevel?: string;
  StressLevels?: string;
  TechnologyExperience?: string;
  Signature?: string;
  SignatureDate?: Date | string;

  LifestyleData?: ParticipantLifestyle[];

  GroupType?: string;
  GroupTypeNumber?: string;
}


interface LanguageData {
  LID?: string;
  Language: string;
  SortKey?: number;
  Status: number | string;
}

interface EducationLevel {
  EID?: string;
  Education: string;
  SortKey?: number;
  Status: number | string;
}

interface CancerTypes {
  CancerTypeId?: string;
  CancerType: string;
  SortKey?: number;
  Status: number | string;
}


type DropdownOption = {
  label: string;
  value: string;
};


export default function SocioDemographic() {
  // Personal Information fields
  const [randomizationId, setRandomizationId] = useState("");
  const [ages, setAge] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  const [gender, setGender] = useState("");
  const [genderOther, setGenderOther] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [numberOfChildren, setNumberOfChildren] = useState("");
  const [faithWellbeing, setFaithWellbeing] = useState("");
  const [practiceReligion, setPracticeReligion] = useState("");
  const [religionSpecify, setReligionSpecify] = useState("");
  const [educationOptions, setEducationOptions] = useState<EducationLevel[]>([]);
  const [educationLevel, setEducationLevel] = useState<string>("");
  const [lifeStyleData, setLifeStyleData] = useState<LifeStyleData[]>([]);
  const [selectedValues, setSelectedValues] = useState<{ [key: string]: string }>({});


  const [employmentStatus, setEmploymentStatus] = useState("");

  const [languages, setLanguages] = useState<LanguageData[]>([]);

  const [KnowledgeIn, setKnowledgeIn] = useState<string>("");

  // Medical History fields
  const [_cancerTypes, setCancerTypes] = useState<CancerTypes[]>([]);
  const [cancerTypeOptions, setCancerTypeOptions] = useState<DropdownOption[]>([]);
  const [cancerDiagnosis, setCancerDiagnosis] = useState("");
  const [cancerStage, setCancerStage] = useState("");
  const [ecogScore, setEcogScore] = useState("");
  const [treatmentType, setTreatmentType] = useState("");
  const [treatmentStartDate, setTreatmentStartDate] = useState("");
  const [treatmentDuration, setTreatmentDuration] = useState("");
  const [otherMedicalConditions, setOtherMedicalConditions] = useState("");
  const [currentMedications, setCurrentMedications] = useState("");



  const [participantSignature, setParticipantSignature] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const [consentDate, setConsentDate] = useState<string>(today);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [habitErrors, setHabitErrors] = useState<{ [habitId: string]: string }>({});

  const [_groupType, setGroupType] = useState("");
  const [groupTypeNumber, setGroupTypeNumber] = useState("");
  const [originalGroupType, setOriginalGroupType] = useState("");
  const [originalCriteriaStatus, setOriginalCriteriaStatus] = useState("");

  const route = useRoute<RouteProp<RootStackParamList, 'SocioDemographic'>>();
  const { patientId, age, studyId } = route.params as { patientId?: number, age?: number, studyId?: number };
  const isEditMode = !!patientId;
  
  
  // Generate a new participant ID if not provided (for new participants)
  const [generatedPatientId] = useState(() => {
    if (patientId) {
      return patientId;
    }
    // Generate a new ID based on timestamp
    const newId = Date.now();
    return newId;
  });
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [consentGiven, setConsentGiven] = useState(false);
  const [consentError, setConsentError] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);




  useEffect(() => {
    apiService
      .post<{ ResponseData: LanguageData[] }>("/GetLanguageData")
      .then((res) => {
        setLanguages(res.data.ResponseData);
      })
      .catch((err) => console.error(err));
  }, []);


  useEffect(() => {
    apiService
      .post<{ ResponseData: EducationLevel[] }>("/GetEducationData")
      .then((res) => {
        setEducationOptions(res.data.ResponseData);
      })
      .catch((err) => console.error(err));
  }, []);



  useEffect(() => {
    apiService
      .post<{ ResponseData: LifeStyleData[] }>("/GetLifeStyleData")
      .then((res) => {
        setLifeStyleData(res.data.ResponseData);
      })
      .catch((err) => console.error(err));
  }, []);




  const habitConfig: {
    [key: string]: { label: string; options: string[] };
  } = {
    "LSHMID-1": {
      label: "Tobacco Use",
      options: ["Never", "Occasionally", "Frequently"],
    },
    "LSHMID-2": {
      label: "Alcohol Consumption",
      options: ["Never", "Occasionally", "Frequently"],
    },
    "LSHMID-3": {
      label: "Smoking History",
      options: ["Never", "Former Smoker", "Current Smoker"],
    },
    "LSHMID-4": {
      label: "Stress Levels",
      options: ["Low", "Moderate", "High"],
    },
    "LSHMID-5": {
      label: "Technology Experience",
      options: ["No Experience", "Some Experience", "Proficient"],
    },
  };



  useEffect(() => {
    apiService
      .post<{ ResponseData: CancerTypes[] }>("/GetCancerTypesData")
      .then((res) => {
        if (res.data?.ResponseData && res.data.ResponseData.length > 0) {
          setCancerTypes(res.data.ResponseData);

          const formatted = res.data.ResponseData.map((item) => ({
            label: item.CancerType,
            value: item.CancerType,
          }));
          setCancerTypeOptions(formatted);
        } else {
          // No fallback - just set empty array if API returns empty data
          setCancerTypeOptions([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load cancer types from API:", err);
        // No fallback - just set empty array if API fails
        setCancerTypeOptions([]);
      });
  }, []);





  useEffect(() => {
    if (isEditMode) {
      (async () => {
        try {
          const res = await apiService.post<{ ResponseData: ParticipantDetails }>(
            "/GetParticipantDetails",
            { ParticipantId: generatedPatientId }
          );

          const data = res.data?.ResponseData;
          // Store original GroupType and CriteriaStatus to preserve them during save
          setOriginalGroupType(data.GroupType ?? "");
          setOriginalCriteriaStatus(data.CriteriaStatus ?? "");
          
          if (data.GroupType === "Study") {
            setGroupType(data.GroupType ?? "");
            setGroupTypeNumber(data.GroupTypeNumber ?? "")
          }

          if (data) {
            // Personal
            // Use GroupTypeNumber as Randomization ID
            setRandomizationId(data.GroupTypeNumber ?? "");
            setAge(String(data.Age ?? ""));
            setEmergencyContact(data.PhoneNumber ? String(data.PhoneNumber) : "");
            
            
            // Emergency Contact is now stored in PhoneNumber field
            setGender(data.Gender ?? "");
            setMaritalStatus(data.MaritalStatus ?? "");
            setNumberOfChildren(String(data.NumberOfChildren ?? ""));
            setKnowledgeIn(data.KnowledgeIn ?? "");

            setFaithWellbeing(data.FaithContributeToWellBeing ?? "");
            setPracticeReligion(data.PracticeAnyReligion ?? "");
            setReligionSpecify(data.ReligionType ?? "");

            setEducationLevel(data.EducationLevel ?? "");
            setEmploymentStatus(data.EmploymentStatus ?? "");

            // Medical
            setCancerDiagnosis(data.CancerDiagnosis ?? "");
            
            // Handle Stage of Cancer - extract number from "Stage X" format
            const stageValue = data.StageOfCancer;
            let extractedStage = "";
            if (stageValue && typeof stageValue === 'string') {
              // Extract number from "Stage II" format
              const match = stageValue.match(/Stage\s*([IVX]+|\d+)/i);
              if (match) {
                extractedStage = match[1];
              }
            }
            setCancerStage(extractedStage);
            
            setEcogScore(data.ScoreOfECOG ? String(data.ScoreOfECOG) : "");
            setTreatmentType(data.TypeOfTreatment ?? "");
            setTreatmentStartDate(data.TreatmentStartDate ?? data.StartDateOfTreatment ?? "");
            setTreatmentDuration(String(data.DurationOfTreatmentMonths ?? ""));
            setOtherMedicalConditions(data.OtherMedicalConditions ? String(data.OtherMedicalConditions) : "");
            setCurrentMedications(data.CurrentMedications ? String(data.CurrentMedications) : "");


            //consent and signature


            // Handle signature data - API returns raw base64, convert to data URI for UI
            if (data.Signature) {
              const signatureData = data.Signature.startsWith('data:image/png;base64,') 
                ? data.Signature 
                : `data:image/png;base64,${data.Signature}`;
              setParticipantSignature(signatureData);
            } else {
              setParticipantSignature("");
            }
            if (data?.SignatureDate) {
              const dbDate = new Date(data.SignatureDate)
                .toISOString()
                .split("T")[0];
              setConsentDate(dbDate);
            } else {
              setConsentDate("");
            }

            // Store participant data for later use
            AsyncStorage.setItem('participantData', JSON.stringify(data));

            // Try multiple lifestyle data endpoints
            let lifestyleRes;
            try {
              lifestyleRes = await apiService.post<{ ResponseData: { HabitID: string; Level: string; ParticipantId: string; StudyId: string }[] }>(
                "/GetParticipantLifestyleData",
                { 
                  ParticipantId: generatedPatientId,
                  StudyId: "CS-0001"
                }
              );
              
              // Check if we got actual participant data (Level not null) or just options
              const hasParticipantData = lifestyleRes.data?.ResponseData?.some(item => item.Level !== null);
              if (!hasParticipantData) {
                // Check if lifestyle data is in the main participant data
                if (data.LifestyleData && Array.isArray(data.LifestyleData)) {
                  lifestyleRes = { data: { ResponseData: data.LifestyleData } };
                } else {
                  lifestyleRes = { data: { ResponseData: [] } };
                }
              }
            } catch (error) {
              // Check if lifestyle data is in the main participant data
              if (data.LifestyleData && Array.isArray(data.LifestyleData)) {
                lifestyleRes = { data: { ResponseData: data.LifestyleData } };
              } else {
                lifestyleRes = { data: { ResponseData: [] } };
              }
            }


            if (lifestyleRes.data?.ResponseData?.length) {
              const lifestyleMap: { [key: string]: string } = {};
              lifestyleRes.data.ResponseData.forEach((item) => {
                lifestyleMap[item.HabitID] = item.Level;
              });
              setSelectedValues(lifestyleMap);
            } else {
            }


          }
        } catch (err) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Failed to load participant details",
            position: "top",
            topOffset: 50,
          });
        }
      })();
    }
  }, [isEditMode, generatedPatientId]);

  // Set cancer diagnosis after options are loaded
  useEffect(() => {
    if (isEditMode && cancerTypeOptions.length > 0) {
      // Try to set cancer diagnosis from stored data
      AsyncStorage.getItem('participantData').then(data => {
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.CancerDiagnosis && cancerTypeOptions.some(opt => opt.value === parsed.CancerDiagnosis)) {
            setCancerDiagnosis(parsed.CancerDiagnosis);
          }
        }
      });
    }
  }, [cancerTypeOptions, isEditMode]);




  const handlePress = (language: string) => {
    setKnowledgeIn(language);
    setErrors((prev) => ({ ...prev, KnowledgeIn: "" }));
  };


  const handleValidate = () => {
    
    let newErrors: Record<string, string> = {};
    let newHabitErrors: Record<string, string> = {};

    if (!ages) {
      newErrors.ages = "Age is required";
    }


    if (!emergencyContact || emergencyContact.trim() === "") {
      newErrors.emergencyContact = "Emergency contact is required";
    } else if (emergencyContact.length !== 10) {
      newErrors.emergencyContact = "Emergency contact must be 10 digits";
    }

    if (!gender) {
      newErrors.gender = "Gender is required";
    }

    if (!maritalStatus) {
      newErrors.maritalStatus = "Marital status is required";
    }
    // numberOfChildren is now optional - no validation needed

    if (!KnowledgeIn || KnowledgeIn.trim() === "") {
      newErrors.KnowledgeIn = "Knowledge field is required";
    }

    if (!faithWellbeing) {
      newErrors.faithWellbeing = "Faith well-being is required";
    }
    if (!practiceReligion) {
      newErrors.practiceReligion = "Religion practice is required";
    }

    // if (!educationLevel) {
    //   newErrors.educationLevel = "Education level is required";
    // }
    // if (!employmentStatus) {
    //   newErrors.employmentStatus = "Employment status is required";
    // }


    if (!cancerDiagnosis || cancerDiagnosis.trim() === "") {
      newErrors.cancerDiagnosis = "Cancer diagnosis is required";
    }
    if (!cancerStage) {
      newErrors.cancerStage = "Cancer stage is required";
    }
    if (!ecogScore) {
      newErrors.ecogScore = "ECOG score is required";
    }
    if (!treatmentType) {
      newErrors.treatmentType = "Treatment type is required";
    }
    if (!treatmentDuration) {
      newErrors.treatmentDuration = "Treatment duration is required";
    }

    // otherMedicalConditions and currentMedications are now optional - no validation needed

    
    // Only validate lifestyle data if it's loaded
    if (lifeStyleData && lifeStyleData.length > 0) {
      lifeStyleData.forEach((habit) => {
        if (!selectedValues[habit.HabitID]) {
          newHabitErrors[habit.HabitID] = `Please select an option for ${habitConfig[habit.HabitID]?.label || habit.Habit}`;
        }
      });
    } else {
    }
    
    // TEMPORARY: Skip lifestyle validation to isolate the issue
    newHabitErrors = {};


    // if (!participantSignature) {
    //   newErrors.participantSignature = "Participant signature is required";
    // }


    if (!consentGiven) {
      newErrors.consentGiven = "Consent is required";
      setConsentError(true);
    } else {
      setConsentError(false);
    }




    setErrors(newErrors);
    setHabitErrors(newHabitErrors);

    

    if (Object.keys(newErrors).length > 0 || Object.keys(newHabitErrors).length > 0) {
      // Show detailed error information
      const errorFields = Object.keys(newErrors);
      const habitErrorFields = Object.keys(newHabitErrors);
      const errorMessage = `Validation failed. Field errors: ${errorFields.join(', ')}. Habit errors: ${habitErrorFields.join(', ')}`;
      
      
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: errorMessage,
        position: "top",
        topOffset: 50,
        visibilityTime: 5000,
      });
      return false;
    }

    Toast.show({
      type: "success",
      text1: "Validation Passed",
      text2: "All required fields are valid",
      position: "top",
      topOffset: 50,
    });

    return true;
  };


  const handleClear = () => {
    // Don't clear Randomization ID as it comes from GroupTypeNumber
    setAge("");
    setEmergencyContact("");
    setGender("");
    setGenderOther("");
    setMaritalStatus("");
    setKnowledgeIn("");
    setNumberOfChildren("");
    setFaithWellbeing("");
    setPracticeReligion("");
    setReligionSpecify("");
    setEducationLevel("");
    setEmploymentStatus("");

    setOtherMedicalConditions("");
    setCurrentMedications("");

    setCancerDiagnosis("");
    setCancerStage("");
    setEcogScore("");
    setTreatmentType("");
    setTreatmentStartDate("");
    setTreatmentDuration("");

    setParticipantSignature("");
    setConsentDate("")

    setSelectedValues({});
    setErrors({});
  };

  const handleSave = async () => {
    
    // Check authentication
    const { authService } = await import('src/services/authService');
    const isAuthenticated = authService.isAuthenticated();
    const token = authService.getToken();
    
    if (!handleValidate()) {
      return;
    }

    try {
      
      const payload = {
        ParticipantId: isEditMode ? generatedPatientId : "",
        StudyId: "CS-0001",
        MRNumber: `H-${String(generatedPatientId).slice(-4)}`,
        Age: Number(ages),
        StageOfCancer: cancerStage ? `Stage ${cancerStage}` : "",
        Gender: gender,
        MaritalStatus: maritalStatus,
        KnowledgeIn: KnowledgeIn || "",
        EducationLevel: educationLevel || "",
        CriteriaStatus: originalCriteriaStatus || "Excluded",
        GroupType: originalGroupType || "None",
        PhoneNumber: emergencyContact, // Store Emergency Contact in PhoneNumber
        OrientationStatus: "No",
        Signature: (() => {
          
          if (participantSignature && participantSignature.startsWith('data:image/png;base64,')) {
            // Extract just the base64 part for API
            const base64Only = participantSignature.replace('data:image/png;base64,', '');
            return base64Only;
          } else if (participantSignature && participantSignature.trim() !== "") {
            return participantSignature;
          } else {
            return ""; // Send empty string instead of placeholder
          }
        })(),
        SignatureDate: consentDate || "",
        FaithContributeToWellBeing: faithWellbeing,
        EmploymentStatus: employmentStatus || "",
        PracticeAnyReligion: practiceReligion,
        ReligionType: practiceReligion === "Yes" ? religionSpecify : "",
        CancerDiagnosis: cancerDiagnosis,
        ScoreOfECOG: ecogScore || "0",
        TypeOfTreatment: treatmentType,
        TreatmentStartDate: treatmentStartDate,
        DurationOfTreatmentMonths: Number(treatmentDuration),
        OtherMedicalConditions: otherMedicalConditions ? otherMedicalConditions : "None",
        CurrentMedications: currentMedications ? currentMedications : "None",
        LifestyleData: (() => {
          const lifestyleData = Object.entries(selectedValues).map(([habitId, level]) => ({
            Lifestyle: habitId, // Use habitId directly as Lifestyle (e.g., "LSHMID-1")
            Level: level,
          }));
          return lifestyleData;
        })(),
      };

      
      // Test API connectivity first
      try {
        const testResponse = await fetch('https://dev.3framesailabs.com:8060/api/Login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ Email: 'test', Password: 'test' })
        });
      } catch (connectivityError) {
        console.error("SocioDemographic - API connectivity test failed:", connectivityError);
      }
      
      const response = await apiService.post("/AddUpdateParticipant", payload);

      if (response.status === 200) {
        
        // Handle the new response format
        const responseData = response.data;
        if (responseData.addParticipant) {
        }
        
        if (responseData.inclusionUpdateResponse) {
        }
        
        // Store newly added participant ID for highlighting
        if (!isEditMode && responseData.addParticipant?.ParticipantId) {
          await AsyncStorage.setItem('newlyAddedParticipantId', String(responseData.addParticipant.ParticipantId));
          
          // Also store a flag to force refresh
          await AsyncStorage.setItem('forceRefreshParticipants', 'true');
        }

        Toast.show({
          type: "success",
          text1: isEditMode ? 'Updated Successfully' : 'Added Successfully',
          text2: isEditMode
            ? "Participant updated successfully!"
            : `Participant added successfully! ID: ${responseData.addParticipant?.ParticipantId || 'N/A'}`,
          position: "top",
          topOffset: 50,
          visibilityTime: 2000,
          onHide: () => {
            navigation.goBack();
          },
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: `Save failed with status: ${response.status}`,
          position: "top",
          topOffset: 50,
        });
      }
    } catch (error: unknown) {
      console.error("SocioDemographic - Save error:", error);
      console.error("SocioDemographic - Error type:", typeof error);
      console.error("SocioDemographic - Error details:", JSON.stringify(error, null, 2));
      
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("SocioDemographic - Error message:", error.message);
        console.error("SocioDemographic - Error stack:", error.stack);
      } else if (typeof error === 'object' && error !== null) {
        console.error("SocioDemographic - Error object:", error);
        if ('message' in error) {
          errorMessage = String(error.message);
        } else if ('status' in error) {
          errorMessage = `API Error: Status ${error.status}`;
        }
      }
      
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `Failed to save participant: ${errorMessage}`,
        position: "top",
        topOffset: 50,
      });
    }
  };






  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      {isEditMode && (
        <View className="px-4 pb-1" style={{ paddingTop: 8 }}>

          <View className="bg-white border-b-2 border-gray-300 rounded-xl p-6 flex-row justify-between items-center shadow-sm">

            <Text className="text-lg font-bold text-green-600">
              Participant ID: {generatedPatientId}
            </Text>

            <Text className="text-base font-semibold text-green-600">
              Study ID: {studyId || "N/A"}
            </Text>

            <Text className="text-base font-semibold text-green-600">
              Randomization Number: {groupTypeNumber || randomizationId || "N/A"}
            </Text>
          </View>
        </View>
      )}

      <ScrollView className="flex-1 px-4 bg-bg pb-[400px]"
        keyboardShouldPersistTaps="handled"
      >

        <FormCard icon="👤" title="Section 1: Personal Information">
          <View className="mt-4">
            <Field
              label="1. Age"
              required
              placeholder="__ years"
              value={ages}
              error={errors.ages}
              keyboardType="numeric"
              maxLength={3}
              onChangeText={(val) => {
                const numericVal = val.replace(/[^0-9]/g, "");
                if (numericVal.length <= 3) {
                  setAge(numericVal);
                  setErrors((prev) => ({ ...prev, age: "" }));
                }
              }}
            />
          </View>

          <View className="mt-4">
            <Field
              label="2. Emergency Contact"
              required
              placeholder="__ emergency contact number"
              value={emergencyContact}
              error={errors.emergencyContact}
              keyboardType="phone-pad"
              maxLength={10}
              onChangeText={(val) => {
                const numericVal = val.replace(/[^0-9]/g, "");
                setEmergencyContact(numericVal);
                setErrors((prev) => ({ ...prev, emergencyContact: "" }));
              }}
            />
          </View>



          <View className="mt-4">
            {/* Gender Label */}
            <Text
              className={`text-base font-medium mb-4 ${errors.gender ? "text-red-500" : "text-[#2c4a43]"
                }`}
            >
              3. Gender <Text className="text-red-600 ml-1 text-sm">*</Text>
            </Text>

            <View className="flex-row gap-3">
              {/* Male Button */}
              <Pressable
                onPress={() => {
                  setGender("Male");
                  setErrors((prev) => ({ ...prev, gender: "" }));
                }}
                className={`flex-1 flex-row items-center justify-center rounded-full py-2 px-4 ${gender === "Male" ? "bg-[#4FC264]" : "bg-gray-200"
                  }`}
              >
                <Image source={require("../../../assets/Man.png")} />
                <Text
                  className={`font-medium text-base pl-2 ${gender === "Male" ? "text-white font-semibold" : "text-[#4b5f5a]"
                    }`}
                >
                  Male
                </Text>
              </Pressable>

              {/* Female Button */}
              <Pressable
                onPress={() => {
                  setGender("Female");
                  setErrors((prev) => ({ ...prev, gender: "" }));
                }}
                className={`flex-1 flex-row items-center justify-center rounded-full py-2 px-4 ${gender === "Female" ? "bg-[#4FC264]" : "bg-[#EBF6D6]"
                  }`}
              >
                <Image source={require("../../../assets/Women.png")} />
                <Text
                  className={`font-medium text-base pl-2 ${gender === "Female" ? "text-white" : "text-[#2c4a43]"
                    }`}
                >
                  Female
                </Text>
              </Pressable>

              {/* Other Button */}
              <Pressable
                onPress={() => {
                  setGender("Other");
                  setErrors((prev) => ({ ...prev, gender: "" }));
                }}
                className={`flex-1 flex-row items-center justify-center rounded-full py-2 px-4 ${gender === "Other" ? "bg-[#4FC264]" : "bg-[#EBF6D6]"
                  }`}
              >
                <Text
                  className={`text-xl mr-2 ${gender === "Other" ? "text-white" : "text-[#2c4a43]"
                    }`}
                >
                  ⚧
                </Text>
                <Text
                  className={`font-medium text-base pl-2 ${gender === "Other" ? "text-white" : "text-[#2c4a43]"
                    }`}
                >
                  Other
                </Text>
              </Pressable>
            </View>


            {/* Conditional Specify Field */}
            {gender === 'Other' && (
              <View className="mt-4">
                <Field
                  label="Specify"
                  placeholder="____________"
                  value={genderOther}
                  onChangeText={setGenderOther}
                />
              </View>
            )}
          </View>

          <View className="mt-4">
            {/* Label with error handling */}
            <Text
              className={`text-base font-medium mb-4 ${errors.maritalStatus ? "text-red-500" : "text-[#2c4a43]"
                }`}
            >
              4. Marital Status <Text className="text-red-600 ml-1 text-sm">*</Text>
            </Text>

            {/* Button Group */}
            <View className="flex-row gap-3">
              {/* Single Button */}
              <Pressable
                onPress={() => {
                  setMaritalStatus("Single");
                  setErrors((prev) => ({ ...prev, maritalStatus: "" }));
                }}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${maritalStatus === "Single" ? "bg-[#4FC264]" : "bg-[#EBF6D6]"
                  }`}
              >
                <Text
                  className={`font-medium text-base ${maritalStatus === "Single" ? "text-white" : "text-[#2c4a43]"
                    }`}
                >
                  Single
                </Text>
              </Pressable>

              {/* Married Button */}
              <Pressable
                onPress={() => {
                  setMaritalStatus("Married");
                  setErrors((prev) => ({ ...prev, maritalStatus: "" }));
                }}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${maritalStatus === "Married" ? "bg-[#4FC264]" : "bg-[#EBF6D6]"
                  }`}
              >
                <Text
                  className={`font-medium text-base ${maritalStatus === "Married" ? "text-white" : "text-[#2c4a43]"
                    }`}
                >
                  Married
                </Text>
              </Pressable>

              {/* Divorced Button */}
              <Pressable
                onPress={() => {
                  setMaritalStatus("Divorced");
                  setErrors((prev) => ({ ...prev, maritalStatus: "" }));
                }}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${maritalStatus === "Divorced" ? "bg-[#4FC264]" : "bg-[#EBF6D6]"
                  }`}
              >
                <Text
                  className={`font-medium text-base ${maritalStatus === "Divorced" ? "text-white" : "text-[#2c4a43]"
                    }`}
                >
                  Divorced
                </Text>
              </Pressable>

              {/* Widowed Button */}
              <Pressable
                onPress={() => {
                  setMaritalStatus("Widowed");
                  setErrors((prev) => ({ ...prev, maritalStatus: "" }));
                }}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${maritalStatus === "Widowed" ? "bg-[#4FC264]" : "bg-[#EBF6D6]"
                  }`}
              >
                <Text
                  className={`font-medium text-base ${maritalStatus === "Widowed" ? "text-white" : "text-[#2c4a43]"
                    }`}
                >
                  Widowed
                </Text>
              </Pressable>
            </View>

            {/* Conditional Number of Children Field */}
            {maritalStatus === "Married" && (
              <View className="mt-4">
                <Field
                  label="If married, number of children (Optional)"
                  placeholder="Number of children"
                  value={numberOfChildren}
                  error={errors.numberOfChildren}
                  onChangeText={setNumberOfChildren}
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>


          <View className="mt-4">
            <Text
              className={`text-base font-medium mb-4 ${errors.KnowledgeIn ? "text-red-500" : "text-[#2c4a43]"
                }`}
            >
              5. Knowledge in <Text className="text-red-600 ml-1 text-sm">*</Text>
            </Text>

            <View className="flex-row flex-wrap gap-3 ">
              {languages.map((lang) => (
                <Pressable
                  key={lang.LID}
                  onPress={() => handlePress(lang.LID ?? "")}
                  className={`flex-1 px-8 py-4 items-center rounded-full ${KnowledgeIn === lang.LID ? "bg-[#4FC264]" : "bg-[#EBF6D6]"
                    }`}
                >
                  <Text
                    className={`font-medium text-base ${KnowledgeIn === lang.LID ? "text-white" : "text-[#2c4a43]"
                      }`}
                  >
                    {lang.Language}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>


          <View className="flex-col gap-4 mt-6">
            {/* Question 5 */}
            <View className="flex-1">
              <View className={"mt-4"}>
                <Text
                  className={`text-base font-medium mb-4 ${errors.faithWellbeing ? "text-red-500" : "text-[#2c4a43]"
                    }`}
                >
                  6. Does faith contribute to well-being? <Text className="text-red-600 ml-1 text-sm">*</Text>
                </Text>
              </View>
              <View className="flex-row gap-3">
                {/* Yes Button */}
                <Pressable
                  onPress={() => {
                    setFaithWellbeing("Yes");
                    setErrors((prev) => ({ ...prev, faithWellbeing: "" }));
                  }}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4  ${faithWellbeing === "Yes" ? "bg-[#4FC264]" : "bg-[#EBF6D6]"
                    }`}
                >
                  <Text
                    className={`font-medium text-base ${faithWellbeing === "Yes" ? "text-white" : "text-[#2c4a43]"
                      }`}
                  >
                    Yes
                  </Text>
                </Pressable>

                {/* No Button */}
                <Pressable
                  onPress={() => {
                    setFaithWellbeing("No");
                    setErrors((prev) => ({ ...prev, faithWellbeing: "" }));
                  }}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${faithWellbeing === "No" ? "bg-[#4FC264]" : "bg-[#EBF6D6]"
                    }`}
                >
                  <Text
                    className={`font-medium text-base ${faithWellbeing === "No" ? "text-white" : "text-[#2c4a43]"
                      }`}
                  >
                    No
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Question 6 */}
            <View className="mt-4">
              <Text
                className={`text-base font-medium mb-4 ${errors.practiceReligion ? "text-red-500" : "text-[#2c4a43]"
                  }`}
              >
                7. Do you practice any religion? <Text className="text-red-600 ml-1 text-sm">*</Text>
              </Text>
            </View>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => {
                  setPracticeReligion("Yes");
                  setErrors((prev) => ({ ...prev, practiceReligion: "" }));
                }}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4  ${practiceReligion === "Yes" ? "bg-[#4FC264]" : "bg-[#EBF6D6]"
                  }`}
              >
                <Text
                  className={`font-medium text-base ${practiceReligion === "Yes" ? "text-white" : "text-[#2c4a43]"
                    }`}
                >
                  Yes
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setPracticeReligion("No");
                  setErrors((prev) => ({ ...prev, practiceReligion: "" }));
                }}
                className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${practiceReligion === "No" ? "bg-[#4FC264]" : "bg-[#EBF6D6]"
                  }`}
              >
                <Text
                  className={`font-medium text-base ${practiceReligion === "No" ? "text-white" : "text-[#2c4a43]"
                    }`}
                >
                  No
                </Text>
              </Pressable>
            </View>

            {/* Optional Input when Yes */}
            {practiceReligion === "Yes" && (
              <View className="mt-4">
                <Field
                  label="Please specify (Optional)"
                  placeholder="__________________"
                  value={religionSpecify}
                  onChangeText={setReligionSpecify}
                />
              </View>
            )}
          </View>



          <View className="mt-4">
            <Text
              className={`text-base font-medium mb-4 ${errors.educationLevel ? "text-red-500" : "text-[#2c4a43]"
                }`}
            >
              8. Education Level (Optional)
            </Text>
            <Segmented
              options={educationOptions.map((edu) => ({
                label: edu.Education,
                value: edu.EID ?? ""
              }))}
              value={educationLevel}
              onChange={(val) => {
                setEducationLevel(val);
                setErrors((prev) => ({ ...prev, educationLevel: "" }));
              }}
            />
          </View>


          <View className="mt-4">
            <Text
              className={`text-base font-medium mb-4 ${errors.employmentStatus ? "text-red-500" : "text-[#2c4a43]"
                }`}
            >
              9. Employment Status (Optional)
            </Text>
            <Segmented
              options={[
                { label: "Employed", value: "Employed" },
                { label: "Self-employed", value: "Self-employed" },
                { label: "Unemployed", value: "Unemployed" },
                { label: "Retired", value: "Retired" },
                { label: "Student", value: "Student" },
              ]}
              value={employmentStatus}
              onChange={(val) => {
                setEmploymentStatus(val);
                setErrors((prev) => ({ ...prev, employmentStatus: "" }));
              }}
            />
          </View>

        </FormCard>

        {/* Section 2: Medical History */}
        <FormCard icon="🏥" title="Section 2: Medical History">
          {/* <View className="mt-6">
            <Field
              label="1. Cancer Diagnosis"
              placeholder="__________________________________________"
              value={cancerDiagnosis}
              onChangeText={setCancerDiagnosis}
            />
            {errors.cancerDiagnosis && (
              <Text className="text-red-500 text-sm mt-2">{errors.cancerDiagnosis}</Text>
            )}
          </View> */}
          <View className="mt-4">
            <DropdownField
              label="1. Cancer Diagnosis"
              required
              value={cancerDiagnosis}
              placeholder="Select cancer type"
              onValueChange={(val) => {
                setCancerDiagnosis(val);
                setErrors((prev) => ({ ...prev, cancerDiagnosis: "" }));
              }}
              options={cancerTypeOptions}
              error={errors.cancerDiagnosis}
            />
          </View>



          <View className="mt-4">
            <Text className={`text-base font-medium mb-4 ${errors.cancerStage ? "text-red-500" : "text-[#2c4a43]"}`}>
              2. Stage of Cancer<Text className="text-red-600 ml-1 text-sm">*</Text>
            </Text>
            <Segmented
              options={[
                { label: 'I', value: 'I' },
                { label: 'II', value: 'II' },
                { label: 'III', value: 'III' },
                { label: 'IV', value: 'IV' }
              ]}
              value={cancerStage}
              onChange={(val) => {
                setCancerStage(val);
                setErrors((prev) => ({ ...prev, cancerStage: "" }));
              }}
            />
          </View>

          <View className="mt-4">
            <Field
              label="3. Grade (ECOG score)"
              required
              placeholder="________"
              value={ecogScore}
              error={errors.ecogScore}
              onChangeText={setEcogScore}
              keyboardType="numeric"
            />
            <Text className="text-sm text-gray-500 mt-2">
              0: Fully active, 1: Restricted but ambulatory, 2: Ambulatory with self-care, 3: Limited self-care, 4: Completely disabled, 5: Death
            </Text>
          </View>

          <View className="mt-4">
            <Text className={`text-base font-medium mb-4 ${errors.treatmentType ? "text-red-500" : "text-[#2c4a43]"}`}>
              4. Type of Treatment <Text className="text-red-600 ml-1 text-sm">*</Text>
            </Text>
            <Segmented
              options={[
                { label: 'Chemotherapy', value: 'Chemotherapy' },
                { label: 'Radiation', value: 'Radiation' },
                { label: 'Both', value: 'Both' }
              ]}
              value={treatmentType}
              onChange={(val) => {
                setTreatmentType(val);
                setErrors((prev) => ({ ...prev, treatmentType: "" }));
              }}
            />
          </View>
          <View className="flex-row gap-4 mt-6">
            <View className="flex-1">
              <DateField
                label="5. Start Date of Treatment"
                value={treatmentStartDate}
                onChange={setTreatmentStartDate}
              />
            </View>
            <View className="flex-1">
              <Field
                label="6. Duration of Treatment (Weeks)"
                required
                placeholder="______________ weeks"
                value={treatmentDuration}
                error={errors?.treatmentDuration}
                onChangeText={setTreatmentDuration}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View className="mt-4">
            <Field
              label="7. Other Medical Conditions (if any) (Optional)"
              placeholder="_________________________"
              value={otherMedicalConditions}
              error={errors?.otherMedicalConditions}
              onChangeText={setOtherMedicalConditions}
              multiline
            />
          </View>

          <View className="mt-4">
            <Field
              label="8. Current Medications (Optional)"
              placeholder="_____________________________________"
              error={errors?.currentMedications}
              value={currentMedications}
              onChangeText={setCurrentMedications}
              multiline
            />
          </View>
        </FormCard>

        {/* Section 3: Lifestyle and Psychological Factors */}
        <FormCard icon="🧠" title="Section 3: Lifestyle and Psychological Factors">
          {lifeStyleData.map((habit, idx) => {
            const config = habitConfig[habit.HabitID];
            if (!config) return null;

            // Check if this habit has an error
            const hasError = habitErrors[habit.HabitID];

            return (
              <View key={habit.HabitID} className="mt-4">
                {/* Title */}
                <Text
                  className={`text-base font-medium  mb-4 ${hasError ? "text-red-500" : "text-[#2c4a43]"}`}
                >
                  {idx + 1}. {config.label} <Text className="text-red-600 ml-1 text-sm">*</Text>
                </Text>

                {/* Options */}
                <View className="flex-row gap-3">
                  {config.options.map((opt: string) => (
                    <Pressable
                      key={opt}
                      onPress={() => {
                        // Update selected value
                        setSelectedValues((prev) => ({
                          ...prev,
                          [habit.HabitID]: opt,
                        }));

                        // Clear error immediately when user selects
                        setHabitErrors((prev) => ({
                          ...prev,
                          [habit.HabitID]: "",
                        }));
                      }}
                      className={`flex-1 flex-row items-center justify-center rounded-full py-4 px-4 ${selectedValues[habit.HabitID] === opt ? "bg-[#4FC264]" : "bg-[#EBF6D6]"
                        }`}
                    >
                      <Text
                        className={`font-medium text-base ${selectedValues[habit.HabitID] === opt ? "text-white" : "text-[#2c4a43]"
                          }`}
                      >
                        {opt}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            );
          })}
        </FormCard>


        <FormCard icon="✍️" title="Section 4: Consent and Signature">
          <View className="mt-4">
            {/* Consent Checkbox */}
            <View className="flex-row items-center mb-2">
              <TouchableOpacity
                onPress={() => {
                  setConsentGiven(!consentGiven);
                  if (!consentGiven) setConsentError(false); // clear error on check
                }}
                className={`w-7 h-7 rounded-md border mr-3 flex items-center justify-center ${consentGiven ? "bg-[#0ea06c] border-[#0ea06c]" : "border-gray-300"
                  }`}
              >
                {consentGiven && <Text className="text-white text-sm">✔</Text>}
              </TouchableOpacity>

              <Text
                className={`text-base flex-1 ${consentError ? "text-red-500" : "text-[#2c4a43]"
                  }`}
              >
                I confirm that the information provided is accurate to the best of my knowledge. <Text className="text-red-600 ml-1 text-sm">*</Text>
              </Text>
            </View>

            {/* Participant Signature */}
            <View className="mt-6">
              <Pressable 
                onPress={() => {
                  setModalVisible(true);
                }}
              >
                <View pointerEvents="none">
                  <Field
                    label="1. Participant Signature"
                    placeholder="Click to add signature"
                    value={participantSignature ? "✓ Signature added" : ""}
                    editable={false}
                    error={errors.participantSignature}
                  />
                </View>
              </Pressable>

              {/* Signature modal */}
              <SignatureModal
                label="Participant Signature"
                visible={modalVisible}
                onClose={() => {
                  setModalVisible(false);
                }}
                signatureData={participantSignature}
                setSignatureData={(newSignature) => {
                  setParticipantSignature(newSignature);
                }}
              />
            </View>

            {/* Date Field */}
            <View className="mt-4">
              <DateField
                label="2. Date"
                value={formatForUI(consentDate)}
                onChange={(val) => setConsentDate(formatForDB(val))}
              />
            </View>

            {/* Extra space so Date field is not hidden by BottomBar */}
            <View style={{ height: 100 }} />
          </View>
        </FormCard>



      </ScrollView>

      <BottomBar>
        <Btn variant="light" onPress={handleClear}>Clear</Btn>
        <Btn onPress={handleSave} className="font-bold text-base">Save & Close</Btn>
      </BottomBar>
    </KeyboardAvoidingView>
  );
}



