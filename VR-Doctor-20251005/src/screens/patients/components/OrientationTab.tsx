import  {useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  ScrollView
} from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../Navigation/types';
import AssessItem from '../../../components/AssessItem';
import { apiService } from 'src/services';
import { UserContext } from 'src/store/context/UserContext';
import Toast from 'react-native-toast-message';
import { Modal } from 'react-native';

// Define the navigation prop type
type OrientationTabNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface OrientationTabProps {
  patientId: number;
  age: number;
  studyId: number;
}

export default function OrientationTab({
  patientId,
  age,
  studyId,
}: OrientationTabProps) {
  const navigation = useNavigation<OrientationTabNavigationProp>();
  const { userId } = useContext(UserContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [orientationCompleted, setOrientationCompleted] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  const selectCompletionStatus = async (status: string): Promise<void> => {
    setIsLoading(true);
    try {
      await apiService.post('/UpdateOrientationStatus', {
        ParticipantId: `${patientId}`,
        OrientationStatus: status,
        ModifiedBy: userId ?? 'UID-1',
      });

      setOrientationCompleted(status);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Orientation status updated to: ${status}`,
      });

      setModalVisible(false);
    } catch (error) {
      console.error('Error updating orientation status:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update orientation status. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function fetchParticipantDetails() {
      try {
        const res = await apiService.post<any>('/GetParticipantDetails', {
          ParticipantId: patientId,
        });
        const data = res.data?.ResponseData;
        if (data) {
          // setParticipantName(data.Signature ?? '');
          setOrientationCompleted(data.OrientationStatus ?? null);
        }
      } catch (err) {
        console.error('Error fetching participant details', err);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load participant data',
        });
      }
    }

    if (patientId) fetchParticipantDetails();
  }, [patientId]);


  return (
   <>
     <ScrollView className="flex-1 p-4">
      {/* Assess Items */}
      <AssessItem
        icon="📊"
        title="Pre VR Assessment"
        subtitle="Evaluate participant readiness and comfort before VR session"
        onPress={() => 
          navigation.navigate('PreVR', { patientId,age,studyId })
        }
        className="bg-[#F6F7F7] border-[#F6F7F7]"
      />
      <AssessItem
        icon="📊"
        title="Post VR Assessment"
        subtitle="Collect feedback and evaluate VR session experience"
        onPress={() => 
          navigation.navigate('PostVR', { patientId,age,studyId })
        }
        className="bg-[#F6F7F7] border-[#F6F7F7]"
      />

      {/* Orientation Status Item */}
      <AssessItem
        icon="✅"
        title="Orientation completed (Yes/No)"
        subtitle="Track orientation completion status for participant"
        onPress={() => {
          setSelectedStatus(orientationCompleted);
          setModalVisible(true);
        }}
        className="bg-[#F6F7F7] border-[#F6F7F7]"
      />
      </ScrollView>

      {/* Non-blocking Modal Overlay */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center p-5">
          <View className="w-full max-w-[23rem] bg-green-50 rounded-2xl shadow-lg overflow-hidden border-2 border-green-200">
            {/* Header */}
            <View className="pt-6 px-6 pb-4 border-b border-green-300 flex-row justify-between items-center">
              <Text className="text-lg font-bold text-gray-900">
                Orientation Completed?
              </Text>
              {/* ❌ Close button */}
              <TouchableOpacity
                onPress={() => {
                  setSelectedStatus(null);
                  setModalVisible(false);
                }}
              >
                <MaterialIcons name="close" size={26} color="#e03a1d" />
              </TouchableOpacity>
            </View>

            {/* Body */}
            <View className="px-6 py-8 space-y-4">
              <Pressable
                onPress={() => !isLoading && setSelectedStatus("Yes")}
                className={`py-3 rounded-xl border items-center ${
                  isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : selectedStatus === "Yes"
                    ? "border-green-600 bg-green-100"
                    : "border-gray-300 bg-white"
                }`}
                disabled={isLoading}
              >
                <Text
                  className={`${
                    isLoading
                      ? "text-gray-400"
                      : selectedStatus === "Yes"
                      ? "text-green-600 font-semibold"
                      : "text-gray-600 font-medium"
                  }`}
                >
                  Yes
                </Text>
              </Pressable>

              <Pressable
                onPress={() => !isLoading && setSelectedStatus("No")}
                className={`py-3 rounded-xl border items-center ${
                  isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : selectedStatus === "No"
                    ? "border-red-600 bg-red-100"
                    : "border-gray-300 bg-white"
                }`}
                disabled={isLoading}
              >
                <Text
                  className={`${
                    isLoading
                      ? "text-gray-400"
                      : selectedStatus === "No"
                      ? "text-red-600 font-semibold"
                      : "text-gray-600 font-medium"
                  }`}
                >
                  No
                </Text>
              </Pressable>
            </View>

            {/* Footer */}
            <View className="flex-row justify-end px-6 py-4 border-t border-green-300">
              <Pressable
                onPress={() => selectedStatus && !isLoading && selectCompletionStatus(selectedStatus)}
                disabled={!selectedStatus || isLoading}
                className={`${!selectedStatus || isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Text className="text-green-600 font-bold text-base">Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
