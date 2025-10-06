import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import FormCard from '@components/FormCard';
import { Field } from '@components/Field';
import DateField from '@components/DateField';
import BottomBar from '@components/BottomBar';
import { Btn } from '@components/Button';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation/types';
import { apiService } from 'src/services';
import Toast from 'react-native-toast-message';
import { UserContext } from 'src/store/context/UserContext';
import { KeyboardAvoidingView } from 'react-native';
import { Platform } from 'react-native';

type Question = {
  PPVRQMID: string;
  StudyId: string;
  QuestionName: string;
  Type: 'Pre' | 'Post';
  SortKey: number;
  Status: number;
  PPPVRId?: string | null;
  ParticipantId?: string | null;
  SessionNo?: string | null;
  ScaleValue?: string | null;
  Notes?: string | null;
};

interface Session {
  SessionNo: string;
  ParticipantId: string;
  StudyId: string;
  Description: string;
  SessionStatus: string;
  Status: number;
  CreatedBy: string;
  CreatedDate: string;
  ModifiedBy: string | null;
  ModifiedDate: string | null;
}

interface GetSessionsResponse {
  ResponseData: Session[];
}

export default function PreVRAssessment() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PreVRAssessment'>>();

  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
  const { patientId, age, studyId, RandomizationId } = route.params as { patientId: number | string; age: number; studyId: number | string, RandomizationId?: string | number };

  // Format participantId and studyId to avoid double prefixing
  const participantIdInput = typeof patientId === 'string' && patientId.startsWith('PID-') ? patientId : `PID-${patientId}`;
  const formatStudyId = (sid: string | number) => {
    const s = sid.toString();
    return s.startsWith('CS-') ? s : `CS-${s.padStart(4, '0')}`;
  };
  const studyIdFormatted = formatStudyId(studyId);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<string, { ScaleValue: string; Notes: string }>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const { userId } = useContext(UserContext);
  const [validationError, setValidationError] = useState('');
  // const [randomizationId, setRandomizationId] = useState("");

  const [availableSessions, setAvailableSessions] = useState<string[]>([]);
  const [sessionNo, setSessionNo] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<string>("No session");
  const [showSessionDropdown, setShowSessionDropdown] = useState(false);

  const fetchAvailableSessions = async () => {
    try {
      const response = await apiService.post<GetSessionsResponse>("/GetParticipantVRSessions", {
        ParticipantId: participantIdInput,
        StudyId: studyIdFormatted,
      });

      const { ResponseData } = response.data;

      if (ResponseData && ResponseData.length > 0) {
        const sessions = ResponseData.map((s: any) =>
          `Session ${s.SessionNo.replace("SessionNo-", "")}`
        );

        setAvailableSessions(sessions);

        if (!selectedSession || selectedSession === "No session") {
          setSelectedSession(sessions[0]);
          setSessionNo(ResponseData[0].SessionNo);
        }
      } else {
        setAvailableSessions(["No session"]);
        setSelectedSession("No session");
        setSessionNo(null);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setAvailableSessions(["No session"]);
      setSelectedSession("No session");
      setSessionNo(null);
    }
  };

  // const fetchRandomizationId = async (participantIdParam: string) => {
  //   try {
  //     const response = await apiService.post('/GetParticipantDetails', {
  //       ParticipantId: participantIdParam,
  //     });

  //     console.log('Randomization ID API response:', response.data);
  //     const data = response.data?.ResponseData;
  //     console.log('Randomization ID data:', data);

  //     if (data && data.GroupTypeNumber) {
  //       console.log('Setting randomization ID:', data.GroupTypeNumber);
  //       setRandomizationId(data.GroupTypeNumber);
  //     } else {
  //       console.log('No GroupTypeNumber found in response');
  //     }
  //   } catch (error) {
  //     console.error('Error fetching randomization ID:', error);
  //   }
  // };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchAvailableSessions();
        // fetchRandomizationId(patientId.toString());

        const questionsRes = await apiService.post<{ ResponseData: Question[] }>("/GetPrePostVRSessionQuestionData");
        const fetchedQuestions = questionsRes.data.ResponseData || [];

        // Filter only Pre questions
        const preQuestions = fetchedQuestions.filter(q => q.Type === 'Pre');

        const responsesRes = await apiService.post<{ ResponseData: Question[] }>("/GetParticipantPrePostVRSessions", {
          ParticipantId: participantIdInput,
          StudyId: studyIdFormatted,
          SessionNo: sessionNo,
        });
        const responseData = responsesRes.data.ResponseData || [];

        const mergedQuestions = preQuestions.map((q) => {
          const resp = responseData.find(r => r.PPVRQMID === q.PPVRQMID);
          return {
            ...q,
            PPPVRId: resp?.PPPVRId ?? null,
            ScaleValue: resp?.ScaleValue ?? '',
            Notes: resp?.Notes ?? '',
          };
        });

        setQuestions(mergedQuestions);

        // Set responses state for form controls
        const initialResponses: Record<string, { ScaleValue: string; Notes: string }> = {};
        responseData.forEach((item) => {
          initialResponses[item.PPVRQMID] = {
            ScaleValue: item.ScaleValue || '',
            Notes: item.Notes || '',
          };
        });
        setResponses(initialResponses);
      } catch (err) {
        console.error('Failed to load questions or responses:', err);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load questions or responses.',
          position: 'top',
          topOffset: 50,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId, studyId, sessionNo]);

  const setAnswer = (questionId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: { ScaleValue: value, Notes: prev[questionId]?.Notes || '' },
    }));

    setValidationErrors((prev) => {
      if (prev[questionId]) {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      }
      return prev;
    });
  };

  const setNote = (questionId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: { ScaleValue: prev[questionId]?.ScaleValue || '', Notes: value },
    }));
  };

  const preQuestions = questions.sort((a, b) => a.SortKey - b.SortKey);

  const validateResponses = (): boolean => {
    const newErrors: Record<string, boolean> = {};

    preQuestions.forEach((q) => {
      const answer = responses[q.PPVRQMID]?.ScaleValue?.trim();
      if (!answer) {
        newErrors[q.PPVRQMID] = true;
      }
    });

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleValidate = () => {
    const passed = validateResponses();

    if (passed) {
      Toast.show({
        type: 'success',
        text1: 'Validation Passed',
        text2: 'All required fields are filled',
        position: 'top',
        topOffset: 50
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill all required fields.',
        position: 'top',
        topOffset: 50
      });
    }
  };

  const handleSave = async () => {
    const passedValidation = validateResponses();

    if (!passedValidation) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'All fields are required',
        position: 'top',
        topOffset: 50
      });
      return;
    }
    setSaving(true);
    try {
      const questionData = preQuestions.map(q => ({
        PPPVRId: q.PPPVRId || null,
        QuestionId: q.PPVRQMID,
        ScaleValue: responses[q.PPVRQMID]?.ScaleValue || '',
        Notes: responses[q.PPVRQMID]?.Notes || '',
      })).filter(item => item.ScaleValue !== '' || item.Notes !== '');

      const payload = {
        ParticipantId: participantIdInput,
        StudyId: studyIdFormatted,
        SessionNo: sessionNo,
        Status: 1,
        CreatedBy: userId,
        ModifiedBy: userId,
        QuestionData: questionData,
      };

      console.log("Saving Pre VR session payload:", payload);
      console.log("Session being saved:", sessionNo);

      const isUpdate = questionData.some((q) => q.PPPVRId);

      const response = await apiService.post('/AddUpdateParticipantPrePostVRSessions', payload);

      if (response.status === 200) {
        // Check if any answer is "Yes"
        const hasYesAnswer = preQuestions.some(q => 
          responses[q.PPVRQMID]?.ScaleValue?.toLowerCase() === 'yes'
        );

        Toast.show({
          type: 'success',
          text1: isUpdate ? 'Updated Successfully' : 'Added Successfully',
          text2: isUpdate
            ? 'Pre VR Questionnaire updated successfully!'
            : 'Pre VR Questionnaire added successfully!',
          position: 'top',
          visibilityTime: 1500,
        });

        // Navigate based on answers
        if (hasYesAnswer) {
          // Show confirmation popup if any answer is "Yes"
          setTimeout(() => {
            Alert.alert(
              'Continue VR Session?',
              'Do you want to still continue the VR Session?',
              [
                {
                  text: 'No',
                  onPress: () => navigation.goBack(),
                  style: 'cancel'
                },
                {
                  text: 'Yes',
                  onPress: () => {
                    navigation.navigate('SessionSetupScreen', {
                      patientId,
                      age,
                      studyId,
                      RandomizationId,
                      sessionNo: sessionNo || undefined
                    });
                  }
                }
              ],
              { cancelable: false }
            );
          }, 1500);
        } else {
          // If all answers are "No", navigate directly to VR Session Setup
          setTimeout(() => {
            navigation.navigate('SessionSetupScreen', {
              patientId,
              age,
              studyId,
              RandomizationId,
              sessionNo: sessionNo || undefined
            });
          }, 1500);
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Something went wrong. Please try again.',
          position: 'top',
          topOffset: 50,
        });
      }
    } catch (error) {
      console.error('Error saving responses:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save responses.',
        position: 'top',
        topOffset: 50,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setResponses({});
    setValidationErrors({});
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#4FC264" />
        <Text style={{ marginTop: 8 }}>Loading questions…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <View style={{
          backgroundColor: 'white',
          borderBottomColor: "rgba(229, 231, 235, 1)",
          borderBottomWidth: 1,
          borderRadius: 12,
          padding: 17,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          shadowColor: "#000000",
          shadowOpacity: 0.35,
          shadowRadius: 1,
          shadowOffset: { width: 0, height: 1 },
        }}>
          <View className="flex-col flex-1 ">
            <Text
              style={{
                color: "rgba(22, 163, 74, 1)",
                fontWeight: "700",
                fontSize: 18,
                lineHeight: 28,
              }}
            >
              Participant ID: {participantIdInput}
            </Text>
            <Text
              style={{
                color: "rgba(22, 163, 74, 1)",
                fontWeight: "600",
                fontSize: 16,
                lineHeight: 24,
                marginTop:4
              }}
            >
              Randomization ID: {RandomizationId || "N/A"}
            </Text>
          </View>


          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#4a5568' }}>
              Age: {age}
            </Text>

            {/* Sessions Dropdown */}
            <View style={{ width: 128 }}>
              <Pressable
                style={{
                  backgroundColor: '#f8f9fa',
                  borderColor: '#e5e7eb',
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onPress={() => setShowSessionDropdown(!showSessionDropdown)}
              >
                <Text style={{ fontSize: 14, color: '#374151' }}>{selectedSession}</Text>
                <Text style={{ color: '#6b7280', fontSize: 12 }}>▼</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {/* Sessions Dropdown Menu */}
      {showSessionDropdown && (
        <>
          {/* Backdrop */}
          <Pressable
            className="absolute top-0 left-0 right-0 bottom-0 z-[9998]"
            onPress={() => setShowSessionDropdown(false)}
          />
          <View
            className="absolute top-20 right-6 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] w-32 max-h-48"
            style={{ elevation: 10, maxHeight: 80, overflow: 'hidden' }}
          >
            <ScrollView style={{ maxHeight: 140 }}>
              {availableSessions.map((session, index) => (
                <Pressable
                  key={session}
                  className={`px-3 py-2 ${index < availableSessions.length - 1 ? 'border-b border-gray-100' : ''}`}
                  onPress={() => {
                    if (session !== "No session") {
                      setSelectedSession(session);
                      const sessionNumber = session.replace("Session ", "SessionNo-");
                      setSessionNo(sessionNumber);
                    }
                    setShowSessionDropdown(false);
                  }}
                >
                  <Text className="text-sm text-gray-700">
                    {session}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </>
      )}

      <ScrollView className="flex-1 px-4 bg-bg pb-[400px]" style={{ paddingTop: 5 }} keyboardShouldPersistTaps="handled">
        <FormCard icon="A" title="Pre VR Questionnaires">
          <View style={{ paddingBottom: 40 }}>
            <View className="flex-row gap-3 mt-2">
              <View className="flex-1">
                <Field label="Participant ID" value={participantIdInput} editable={false} />
              </View>
              <View className="flex-1">
                <DateField label="Date" value={dateInput} onChange={setDateInput} />
              </View>
            </View>
          </View>
        </FormCard>

        {validationError ? (
          <Text className="text-red-600 text-center my-2">{validationError}</Text>
        ) : null}

        {/* Display Pre questions */}
        {preQuestions.length > 0 && (
          <FormCard icon="A" title="Pre Virtual Reality Questionnaires">
            {preQuestions.map((q) => {
              const hasError = validationErrors[q.PPVRQMID];
              return (
                <View key={q.PPVRQMID} className="mb-3 mt-4">
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                      className={`text-md font-medium text-[#2c4a43] mb-2 ${hasError ? 'text-red-600 font-semibold' : 'text-[#2c4a43]'
                        }`}
                    >
                      {q.QuestionName}
                    </Text>
                    <Text style={{ color: 'red', fontSize: 16, fontWeight: '500', marginLeft: 5, marginBottom: 9 }}>
                      *
                    </Text>
                  </View>
                  <View className="flex-row gap-2">
                    {['Yes', 'No'].map((opt) => (
                      <Pressable
                        key={opt}
                        onPress={() => setAnswer(q.PPVRQMID, opt)}
                        className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${responses[q.PPVRQMID]?.ScaleValue === opt ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'}`}
                      >
                        <Text className={`font-medium text-sm ${responses[q.PPVRQMID]?.ScaleValue === opt ? 'text-white' : 'text-[#2c4a43]'}`}>
                          {opt}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  {responses[q.PPVRQMID]?.ScaleValue && (
                    <View className="mt-3">
                      <Field
                        label="Additional Notes (Optional)"
                        placeholder="Please provide details…"
                        value={responses[q.PPVRQMID]?.Notes || ''}
                        onChangeText={(text) => setNote(q.PPVRQMID, text)}
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </FormCard>
        )}

        {/* Show message if no questions */}
        {preQuestions.length === 0 && (
          <FormCard icon="ℹ️" title="No Pre Questionnaires Available">
            <Text className="text-gray-600 text-center py-4">
              No Pre Virtual Reality questionnaires are available at this time.
            </Text>
          </FormCard>
        )}

        {/* Spacer so content not hidden behind BottomBar */}
        <View style={{ height: 150 }} />
      </ScrollView>

      <BottomBar>
        <Btn variant="light" onPress={handleClear}>Clear</Btn>
        <Btn onPress={handleSave} disabled={saving} className="font-bold text-base">
          {saving ? 'Saving…' : 'Save & Close'}
        </Btn>
      </BottomBar>
    </KeyboardAvoidingView>
  );
}
