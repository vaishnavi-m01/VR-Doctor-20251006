import { useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator } from 'react-native';
import Header from '../../components/Header';
import Card from '../../components/Card';
import { Ionicons } from '@expo/vector-icons';
import Toast from "react-native-toast-message";
import { apiService } from 'src/services';
import { UserContext } from 'src/store/context/UserContext';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from 'src/Navigation/types';

type FeelIconName =
  | 'happy-outline'
  | 'thumbs-up-outline'
  | 'thumbs-down-outline'
  | 'close-circle-outline';

interface FeelOption {
  label: string;
  icon: FeelIconName;
}

interface SessionFeedback {
  FeedbackId: string;
  ParticipantId: string;   
  SessionNo: string;
  FeedbackLevel: string;
  FeedbackDescription: string;
  SortOrder: number;
  Status: number;
  CreatedBy?: string;
  CreatedDate?: string;
  ModifiedBy?: string | null;
  ModifiedDate?: string | null;
}

interface FeedbackApiResponse {
  ResponseData: SessionFeedback[];
}

// FEELS list for UI
const FEELS: FeelOption[] = [
  { label: 'Drastic Improvement', icon: 'happy-outline' },
  { label: 'Significant Improvement', icon: 'thumbs-up-outline' },
  { label: 'Some Improvement', icon: 'thumbs-down-outline' },
  { label: 'No Improvement', icon: 'close-circle-outline' },
];

// Map API values → UI labels
const feedbackMap: Record<string, string> = {
  DrasticImprovement: 'Drastic Improvement',
  SignificantImprovement: 'Significant Improvement',
  SomeImprovement: 'Some Improvement',
  NoImprovement: 'No Improvement',
};

// Map UI labels → API values
const reverseFeedbackMap: Record<string, string> = {
  'Drastic Improvement': 'DrasticImprovement',
  'Significant Improvement': 'SignificantImprovement',
  'Some Improvement': 'SomeImprovement',
  'No Improvement': 'NoImprovement',
};

export default function SessionCompletedScreen() {
  const [feel, setFeel] = useState<string>('Significant Improvement');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [FeedbackId, setFeedbackId] = useState<string>('');
  const route = useRoute<RouteProp<RootStackParamList, 'SessionCompletedScreen'>>();
  const { patientId, SessionNo } = route.params;

  const { userId } = useContext(UserContext);

useEffect(() => {
  const fetchFeedback = async () => {
    try {
      setLoading(true);

      const response = await apiService.get<FeedbackApiResponse>(
        `/GetParticipantSessionFeedback?ParticipantId=${patientId}&SessionNo=${SessionNo}`
      );

      if (response.data.ResponseData?.length > 0) {
        const feedback = response.data.ResponseData[0];

        // 🔹 Save FeedbackId so we know whether to insert or update
        setFeedbackId(feedback.FeedbackId || '');

        setFeel(feedbackMap[feedback.FeedbackLevel] || 'Significant Improvement');
        setNote(feedback.FeedbackDescription || '');
      } else {
        // no feedback exists → reset state
        setFeedbackId('');
        setFeel('Significant Improvement');
        setNote('');
      }
    } catch (err: any) {
      console.error('Error fetching feedback:', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (patientId && SessionNo) {
    fetchFeedback();
  }
}, [patientId, SessionNo]);

const handleSubmit = async () => {
  try {
    setLoading(true);

    const payload = {
      FeedbackId: FeedbackId || '', // 🔹 Insert if '', update if id exists
      ParticipantId: patientId,
      SessionNo,
      FeedbackLevel: reverseFeedbackMap[feel], // convert label → backend enum
      FeedbackDescription: note || '',
      SortOrder: 1,
      Status: 1,
      CreatedBy: userId,
    };

    console.log('Submitting payload:', payload);

    const response = await apiService.post("/AddUpdateParticipantSessionFeedback", payload);

    if (response.status === 200 || response.status === 201) {
      Toast.show({
        type: 'success',
        text1: FeedbackId ? 'Updated' : 'Success',
        text2: FeedbackId
          ? 'Feedback updated successfully!'
          : 'Feedback submitted successfully!',
        position: 'top',
        topOffset: 50,
        visibilityTime: 2000,
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
  } catch (error: any) {
    console.error('Feedback submit error:', error.message);
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: 'Failed to submit feedback.',
      position: 'top',
      topOffset: 50,
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <View className="flex-1 bg-white">
      <View className="px-4 pt-4"><Header title="Session Completedd" /></View>
      <ScrollView
        className="flex-1 p-4 gap-4"
        contentContainerStyle={{ paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Confirmation Card */}
        <Card className="p-6 items-center">
          <View className="w-16 h-16 rounded-full bg-[#e6f4ed] border-4 border-[#0ea06c] items-center justify-center mb-3">
            <Ionicons name="checkmark" size={32} color="#0ea06c" />
          </View>
          <Text className="text-3xl font-extrabold text-[#2c3e50] mb-2">Session Completed</Text>
          <Text className="text-[#7f938e] text-base mb-1 text-center">Your Virtual Reality Therapy session has ended</Text>
        </Card>

        {/* Feedback Section */}
        <Card className="p-5">
          <Text className="font-bold text-lg text-[#2f5047] mb-3 text-center">How do you feel?</Text>

          <View className="flex flex-row flex-wrap justify-between gap-3 mb-4">
            {FEELS.map((f) => (
              <Pressable
                key={f.label}
                onPress={() => setFeel(f.label)}
                className={`flex-1 min-w-[48%] py-4 rounded-xl border-2 items-center justify-center gap-2 ${
                  feel === f.label ? 'bg-[#e0f7ef] border-[#0ea06c]' : 'bg-[#f8f9fb] border-[#e0eaf3]'
                }`}
                style={{ minHeight: 80 }}
              >
                <Ionicons
                  name={f.icon}
                  size={24}
                  color={feel === f.label ? '#0ea06c' : '#7f938e'}
                />
                <Text
                  className={`text-xs font-semibold text-center leading-tight px-1 ${
                    feel === f.label ? 'text-[#0ea06c]' : 'text-[#4c6b63]'
                  }`}
                >
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text className="text-sm text-[#486a61] mb-3 font-medium">Your feedback (optional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Add any notes about how you're feeling…"
            multiline
            className="min-h-[80px] border border-[#d7ebe3] rounded-xl p-4 text-base text-gray-700 mb-4"
            style={{
              backgroundColor: '#f8f9fa',
              borderColor: '#e5e7eb',
              borderRadius: 16,
            }}
          />

          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            className={`rounded-xl py-4 items-center shadow-sm ${loading ? "bg-gray-400" : "bg-[#0ea06c]"}`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-extrabold text-lg">Submit Feedback</Text>
            )}
          </Pressable>
        </Card>
        <View className="h-16" />
      </ScrollView>
    </View>
  );
}
