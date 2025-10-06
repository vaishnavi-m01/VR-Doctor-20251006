import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
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

interface AssessmentQuestion {
  AssessmentId: string;
  AssessmentTitle: string;
  StudyId: string;
  AssignmentQuestion: string;
  Type: string; //Post type
  SortKey: number;
  Status: number;
  CreatedBy: string;
  CreatedDate: string;
  ModifiedBy: string | null;
  ModifiedDate: string;
  PMPVRID: string | null;
  ParticipantId: string | null;
  ScaleValue: string | null;
  Notes: string | null;
  ParticipantResponseDate: string | null;
  ParticipantResponseModifiedDate: string | null;
}

interface ApiResponse {
  ResponseData: AssessmentQuestion[];
}

interface ResponseEntry {
  PMPVRID: string | null;
  ScaleValue: string | null;
  Notes: string | null;
}

type ResponsesState = Record<string /*AssessmentId*/, ResponseEntry[]>;

export default function PostVR() {
  const [participantId, setParticipantId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  const [postQuestions, setPostQuestions] = useState<AssessmentQuestion[]>([]);
  const [responses, setResponses] = useState<ResponsesState>({});
  const [randomizationId, setRandomizationId] = useState("");

  const route = useRoute<RouteProp<RootStackParamList, 'PostVR'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { patientId, age, studyId } = route.params;
  const { userId } = useContext(UserContext);

  const formatStudyId = (sid: string | number) => {
    const s = sid.toString();
    return s.startsWith('CS-') ? s : `CS-${s.padStart(4, '0')}`;
  };

    const fetchRandomizationId = async (participantIdParam: string) => {
      try {
        const response = await apiService.post('/GetParticipantDetails', {
          ParticipantId: participantIdParam,
        });
  
        console.log('Randomization ID API response:', response.data);
        const data = response.data?.ResponseData;
        console.log('Randomization ID data:', data);
        
        if (data && data.GroupTypeNumber) {
          console.log('Setting randomization ID:', data.GroupTypeNumber);
          setRandomizationId(data.GroupTypeNumber);
        } else {
          console.log('No GroupTypeNumber found in response');
        }
      } catch (error) {
        console.error('Error fetching randomization ID:', error);
      }
    };

  useEffect(() => {
    if (patientId && studyId !== undefined && studyId !== null) {
       const pid = patientId.toString();
      const sid = studyId.toString();
      setParticipantId(pid);
      fetchAssessmentQuestions(pid, sid);
      fetchRandomizationId(pid);
    }
  }, [patientId, studyId]);

  const fetchAssessmentQuestions = async (participantIdParam: string, studyIdParam: string) => {
    try {
      setLoading(true);
      setError(null);

      const formattedStudyId = formatStudyId(studyIdParam);

      const response = await apiService.post<ApiResponse>('/GetParticipantMainPrePostVRAssessment', {
        ParticipantId: participantIdParam,
        StudyId: formattedStudyId,
      });

      const { ResponseData } = response.data;

      if (ResponseData && ResponseData.length > 0) {
        // Only keep Post questions
        const postQs = ResponseData.filter((q) => q.Type === 'Post' && q.StudyId === formattedStudyId).sort((a, b) => a.SortKey - b.SortKey);

        setPostQuestions(postQs);

        const groupedResponses: ResponsesState = {};

        ResponseData.forEach((q) => {
          if (q.Type === 'Post') {
            if (!groupedResponses[q.AssessmentId]) {
              groupedResponses[q.AssessmentId] = [];
            }
            groupedResponses[q.AssessmentId].push({
              PMPVRID: q.PMPVRID,
              ScaleValue: q.ScaleValue,
              Notes: q.Notes,
            });
          }
        });

        setResponses(groupedResponses);
      } else {
        setPostQuestions([]);
        setResponses({});
        setError('No post assessment questions found for this participant.');
      }
    } catch (err) {
      console.error('Failed to load assessment questions', err);
      setError('Failed to load assessment questions. Please try again.');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load assessment data',
        position: 'top',
        topOffset: 50,
      });
    } finally {
      setLoading(false);
    }
  };

  const setResponse = (
    questionId: string,
    value: string | null,
    isNotes: boolean = false,
    index: number = 0
  ) => {
    setResponses((prev) => {
      const questionResponses = prev[questionId] ? [...prev[questionId]] : [];
      // ensure index exists
      while (questionResponses.length <= index) {
        questionResponses.push({ PMPVRID: null, ScaleValue: null, Notes: null });
      }
      if (isNotes) {
        questionResponses[index].Notes = value;
      } else {
        questionResponses[index].ScaleValue = value;
      }
      const updated = { ...prev, [questionId]: questionResponses };
      console.log('Updated responses:', updated);
      return updated;
    });
    setValidationErrors((prev) => {
      if (prev[questionId]) {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      }
      return prev;
    });
  };

  const getQuestionType = (question: string): string => {
    const lowerQ = question.toLowerCase();

    if (lowerQ.includes('scale of 1-5') || lowerQ.includes('1 = ') || lowerQ.includes('5 = ')) {
      return 'scale_5';
    }
    if (lowerQ.includes('1-10') || lowerQ.includes('10 = excellent')) {
      return 'scale_10';
    }
    if (
      lowerQ.includes('did you') ||
      lowerQ.includes('were you') ||
      lowerQ.includes('would you') ||
      lowerQ.includes('do you') ||
      lowerQ.includes('has the') ||
      lowerQ.includes('have you')
    ) {
      return 'yes_no';
    }
    if (lowerQ.includes('comfort') && !lowerQ.includes('scale')) {
      return 'comfort_level';
    }
    if (lowerQ.includes('engaging') && !lowerQ.includes('scale')) {
      return 'engagement_level';
    }
    return 'text';
  };

  const renderScale = (questionId: string, max: number, index: number) => {
    const value = responses[questionId]?.[index]?.ScaleValue;
    return (
      <View className="bg-white border border-[#e6eeeb] rounded-xl shadow-sm overflow-hidden">
        <View className="flex-row">
          {Array.from({ length: max }, (_, i) => i + 1).map((v, idx) => (
            <React.Fragment key={v}>
              <Pressable
                onPress={() => setResponse(questionId, v.toString(), false, index)}
                className={`flex-1 py-3 items-center justify-center ${
                  value === v.toString() ? 'bg-[#4FC264]' : 'bg-white'
                }`}
              >
                <Text
                  className={`font-medium text-sm ${
                    value === v.toString() ? 'text-white' : 'text-[#4b5f5a]'
                  }`}
                >
                  {v}
                </Text>
              </Pressable>
              {idx < max - 1 && <View className="w-px bg-[#e6eeeb]" />}
            </React.Fragment>
          ))}
        </View>
      </View>
    );
  };

  const renderYesNo = (questionId: string, index: number) => {
    const value = responses[questionId]?.[index]?.ScaleValue;
    return (
      <View className="flex-row gap-2">
        <Pressable
          onPress={() => setResponse(questionId, 'Yes', false, index)}
          className={`w-1/2 flex-row items-center justify-center rounded-full py-3 px-2 ${
            value === 'Yes' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
          }`}
        >
          <Text className={`text-lg mr-1 ${value === 'Yes' ? 'text-white' : 'text-[#2c4a43]'}`}>✅</Text>
          <Text className={`font-medium text-sm ${value === 'Yes' ? 'text-white' : 'text-[#2c4a43]'}`}>
            Yes
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setResponse(questionId, 'No', false, index)}
          className={`w-1/2 flex-row items-center justify-center rounded-full py-3 px-2 ${
            value === 'No' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
          }`}
        >
          <Text className={`text-lg mr-1 ${value === 'No' ? 'text-white' : 'text-[#2c4a43]'}`}>❌</Text>
          <Text className={`font-medium text-sm ${value === 'No' ? 'text-white' : 'text-[#2c4a43]'}`}>No</Text>
        </Pressable>
      </View>
    );
  };

  const renderMultipleChoice = (questionId: string, options: string[], index: number) => {
    const value = responses[questionId]?.[index]?.ScaleValue;
    return (
      <View className="bg-white border border-[#e6eeeb] rounded-xl shadow-sm overflow-hidden">
        <View className="flex-row">
          {options.map((option, idx) => (
            <React.Fragment key={option}>
              <Pressable
                onPress={() => setResponse(questionId, option, false, index)}
                className={`flex-1 py-3 items-center justify-center ${
                  value === option ? 'bg-[#4FC264]' : 'bg-white'
                }`}
              >
                <Text className={`font-medium text-sm text-center ${value === option ? 'text-white' : 'text-[#4b5f5a]'}`}>
                  {option}
                </Text>
              </Pressable>
              {idx < options.length - 1 && <View className="w-px bg-[#e6eeeb]" />}
            </React.Fragment>
          ))}
        </View>
      </View>
    );
  };

  const renderQuestion = (question: AssessmentQuestion) => {
    const questionType = getQuestionType(question.AssignmentQuestion);
    const questionId = question.AssessmentId;
    const index = 0;

    const hasError = validationErrors[questionId];

    const scaleValue = responses[questionId]?.[index]?.ScaleValue || '';
    const notesValue = responses[questionId]?.[index]?.Notes || '';

    return (
      <View key={questionId} className="mt-3">
         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text  className={`text-md font-medium  mb-2 ${
            hasError ? 'text-red-600 font-semibold' : 'text-[#2c4a43]'
            }`}
          >
            {question.AssessmentTitle}
          </Text>

         <Text style={{ color: 'red', fontSize: 16, fontWeight: '500', marginLeft: 5, marginBottom: 9 }}>
            *
          </Text>
        </View>

        <Text className="text-base text-gray-600 mb-2">{question.AssignmentQuestion}</Text>

        {questionType === 'scale_5' && renderScale(questionId, 5, index)}
        {questionType === 'scale_10' && (
          <Field
            label="Rating (1-10)"
            placeholder="Rate from 1-10"
            value={scaleValue.toString()}
            onChangeText={(value) => setResponse(questionId, value, false, index)}
            keyboardType="number-pad"
          />
        )}
        {questionType === 'yes_no' && renderYesNo(questionId, index)}
        {questionType === 'comfort_level' &&
          renderMultipleChoice(questionId, [
            'Very Comfortable',
            'Somewhat Comfortable',
            'Neutral',
            'Uncomfortable',
            'Very Uncomfortable',
          ], index)}
        {questionType === 'engagement_level' &&
          renderMultipleChoice(questionId, [
            'Very Engaging',
            'Somewhat Engaging',
            'Neutral',
            'Not Very Engaging',
            'Not Engaging at All',
          ], index)}
        {questionType === 'text' && (
          <Field
            label="Response"
            placeholder="Your response..."
            value={notesValue}
            onChangeText={(value) => setResponse(questionId, value, true, index)}
            multiline
            numberOfLines={3}
          />
        )}

        {(scaleValue === 'Yes' || scaleValue === 'No') && questionType === 'yes_no' && (
          <View className="mt-2">
            <Field
              label="Additional notes (optional)"
              placeholder="Please provide details..."
              value={notesValue}
              onChangeText={(value) => setResponse(questionId, value, true, index)}
              multiline
              numberOfLines={2}
            />
          </View>
        )}
      </View>
    );
  };

  const validateResponses = (): boolean => {
    if (postQuestions.length === 0) return false;

    const newErrors: Record<string, boolean> = {};

    postQuestions.forEach((question) => {
      const questionId = question.AssessmentId;
      const entries = responses[questionId] || [];

      const noneFilled = entries.every(
        (entry) =>
          (entry.ScaleValue === null || entry.ScaleValue === '') &&
          (entry.Notes === null || entry.Notes === '')
      );

      if (noneFilled) {
        newErrors[questionId] = true;
      }
    });

    setValidationErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  const handleValidate = () => {
    // if (Object.keys(responses).length === 0) {
    //   Toast.show({
    //     type: 'error',
    //     text1: 'Validation Error',
    //     text2: 'No responses entered. Please fill the form.',
    //     position: 'top',
    //     topOffset: 50,
    //   });
    //   setValidationErrors({});
    //   return;
    // }

    const passed = validateResponses();

    if (passed) {
      Toast.show({
        type: 'success',
        text1: 'Validation Passed',
        text2: 'All required fields are filled',
        position: 'top',
        topOffset: 50,
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill all required fields.',
        position: 'top',
        topOffset: 50,
      });
    }
  };


  const handleSave = async () => {

    const passedValidation = validateResponses();

    if (!passedValidation) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'All fields are required to save.',
        position: 'top',
        topOffset: 50,
      });
      return;
    }

    try {
      setSaving(true);

      const formattedStudyId = formatStudyId(studyId ?? '0001');

      const questionData = Object.entries(responses)
        .flatMap(([questionId, entries]) =>
          entries
            .map((entry) => ({
              PMPVRID: entry.PMPVRID,
              AssessmentQuestionId: questionId,
              ScaleValue: entry.ScaleValue === '' ? null : entry.ScaleValue,
              Notes: entry.Notes === '' ? null : entry.Notes,
              ParticipantId: participantId,
              StudyId: formattedStudyId,
              Status: 1,
              CreatedBy: userId,
              ModifiedBy: userId,
            }))
            .filter((item) => item.ScaleValue !== null || item.Notes !== null)
        );

      const payload = {
        ParticipantId: participantId,
        StudyId: formattedStudyId,
        QuestionData: questionData,
        Status: 1,
        CreatedBy: userId,
        ModifiedBy: userId,
      };

      console.log('Saving Assessment Payload:', payload);

      const isAdd = questionData.some((q) => q.PMPVRID === null);

      const response = await apiService.post('/AddUpdateParticipantMainPrePostVRAssessment', payload);

      if (response.status === 200) {
        Toast.show({
          type: 'success',
           text1: isAdd ? 'Added Successfully' : 'Updated Successfully',
          text2: isAdd ? 'Assessment added successfully!' : 'Assessment updated successfully!',
          position: 'top',
          topOffset: 50,
          visibilityTime: 1000,
          onHide: () => navigation.goBack(),
        });
      
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Something went wrong. Please try again.',
          position: 'top',
          topOffset: 50,
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error saving assessment:', errorMessage);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `Failed to save assessment: ${errorMessage}`,
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
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#4FC264" />
        <Text className="text-gray-600 mt-4">Loading assessment questions...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
      {/* Header */}
      <View
        className="px-4"
        style={{ paddingTop: 8, paddingBottom: '0.25rem' }}
      >
          <View className="bg-white border-b-2 border-gray-300 rounded-xl p-6 flex-row justify-between items-center shadow-sm">
          <Text className="text-lg font-bold text-green-600">Participant ID: {participantId}</Text>
           <Text className="text-base font-semibold text-green-600">
            Randomization ID: {randomizationId || "N/A"}
          </Text>
          <Text className="text-base font-semibold text-gray-700">Age: {age ?? 'Not specified'}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4 bg-bg pb-[400px]" style={{ paddingTop: '0.1rem' }}>
        {/* Main Assessment Card */}
        <FormCard icon="J" title="Post‑VR Assessment & Questionnaires">
          <View className="flex-row gap-3 mt-4">
            <View className="flex-1">
              <Field label="Participant ID" placeholder="e.g., PID-0234" value={participantId} onChangeText={setParticipantId} editable={false} />
            </View>
            <View className="flex-1">
              <DateField label="Date" value={date} onChange={setDate} />
            </View>
          </View>
        </FormCard>

        {/* Error State */}
        {error && (
          <View className="bg-red-50 rounded-lg p-4 shadow-md mb-4">
            <Text className="text-red-600 text-center font-semibold">{error}</Text>
            <Pressable onPress={() => fetchAssessmentQuestions(participantId, studyId ? studyId.toString() : '0001')} className="mt-2">
              <Text className="text-blue-600 text-center font-semibold">Try Again</Text>
            </Pressable>
          </View>
        )}

        {/* Post-VR Questions */}
        {postQuestions.length > 0 && (
          <FormCard icon="B" title="Post-VR Assessment">{postQuestions.map(renderQuestion)}</FormCard>
        )}

        {/* Instructions */}
        {!error && postQuestions.length > 0 && (
          <View className="bg-blue-50 rounded-lg p-4 shadow-md mb-4">
            <Text className="font-semibold text-sm text-blue-800 mb-2">Instructions:</Text>
            <Text className="text-sm text-blue-700">
              • For scale questions (1-5): 1 = Lowest/Worst, 5 = Highest/Best{'\n'}
              • For scale questions (1-10): 1 = Very Bad, 10 = Excellent{'\n'}
              • Answer all applicable questions for complete assessment
            </Text>
          </View>
        )}

        <View style={{ height: 150 }} />
      </ScrollView>

      <BottomBar>
        <Btn variant="light" onPress={handleClear}>Clear</Btn>
        <Btn onPress={handleSave} disabled={saving || loading}>{saving ? 'Saving...' : 'Save & Close'}</Btn>
      </BottomBar>
    </KeyboardAvoidingView>
  );
}
