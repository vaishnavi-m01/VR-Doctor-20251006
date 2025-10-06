import { View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../Navigation/types';
import AssessItem from '../../../components/AssessItem';

interface DashboardProps {
  patientId: number;
  age:number;
  studyId:number;
}

export default function Dashboard({ patientId,age,studyId }: DashboardProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScrollView className="flex-1 p-4">
      <AssessItem
        icon="👨‍⚕️"
        title="Physician Dashboard"
        subtitle="Access physician tools and Participant management"
        onPress={() => navigation.navigate("PhysicianDashboard")}
        className="bg-[#F6F7F7] border-[#F6F7F7]"
      />
      
      <AssessItem
        icon="👤"
        title="Participant Dashboard"
        subtitle="View Participant information and session details"
        onPress={() => navigation.navigate('PatientDashboard', { patientId,age,studyId })}
        className="bg-[#F6F7F7] border-[#F6F7F7]"
      />
    </ScrollView>
  );
}
