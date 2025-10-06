// AssessmentTab.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AssessItem from '../../../../components/AssessItem';
import FormCard from '../../../../components/FormCard';
import { Field } from '../../../../components/Field';
import PillGroup from '../../../../components/PillGroup';
import Segmented from '../../../../components/Segmented';
import { RootStackParamList } from '../../../../Navigation/types';
import { apiService } from '../../../../services';

type AssessmentTabNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface AssessmentTabProps {
  patientId: number;
  age: number;
  studyId:number;
  groupType?: string; // "Study" or "Controlled" or null
}

const AssessmentTab = ({ patientId, age, studyId, groupType }: AssessmentTabProps) => {
  const navigation = useNavigation<AssessmentTabNavigationProp>();
  const [hasExistingAssessments, setHasExistingAssessments] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Check if participant has existing assessments
  useEffect(() => {
    const checkExistingAssessments = async () => {
      try {
        setLoading(true);
        
        // Check for existing Distress Thermometer assessments
        const distressResponse = await apiService.post('/GetParticipantDistressWeeklyScore', {
          ParticipantId: patientId.toString(),
        });
        
        const hasDistressAssessments = distressResponse.data?.ResponseData?.length > 0;
        
        // Check for existing FactG assessments
        const factGResponse = await apiService.post('/getParticipantFactGQuestionWeekly', {
          StudyId: studyId.toString(),
          ParticipantId: patientId.toString(),
        });
        
        const hasFactGAssessments = factGResponse.data?.ResponseData?.length > 0;
        
        // If either assessment exists, it's not the first time
        setHasExistingAssessments(hasDistressAssessments || hasFactGAssessments);
      } catch (error) {
        console.error('Error checking existing assessments:', error);
        // Default to false if there's an error
        setHasExistingAssessments(false);
      } finally {
        setLoading(false);
      }
    };

    checkExistingAssessments();
  }, [patientId, studyId]);

  const handleDistressThermometerPress = () => {
    if (!hasExistingAssessments) {
      // First time assessment - route to baseline Distress Thermometer
      navigation.navigate("DistressThermometerScreen", { 
        patientId, 
        age, 
        studyId,
        isBaseline: true 
      });
    } else {
      // Existing assessments - route to regular Distress Thermometer
      navigation.navigate("DistressThermometerScreen", { 
        patientId, 
        age, 
        studyId 
      });
    }
  };

  // State for orientation assessment items
  const [effect, setEffect] = useState<number | undefined>();
  const [clarity, setClarity] = useState<number | undefined>();
  const [confidence, setConfidence] = useState<number | undefined>();
  const [demo, setDemo] = useState('No');
  const [controls, setControls] = useState('No');
  const [guidance, setGuidance] = useState('No');
  const [wear, setWear] = useState('No');
  const [pref, setPref] = useState('No');
  const [qa, setQa] = useState('Yes');

  const ready = (() => {
    const base = (effect && clarity && confidence) ? Math.round(((effect || 0) + (clarity || 0) + (confidence || 0)) / 3) : '—';
    const extras = (demo === 'Yes' ? 1 : 0) + (controls === 'Yes' ? 1 : 0) + (guidance === 'No' ? 1 : 0);
    return base === '—' ? '—' : `${base}${extras ? ` (+${extras})` : ''}`;
  })();

  return (
    <ScrollView className="flex-1 p-4">
      {/* Original Assessment Items */}

      <AssessItem
        icon="🌡️"
        title="Distress Thermometer scoring 0-10"
        subtitle={hasExistingAssessments ? "Assess participant distress levels and identify problem areas" : "First time assessment - Baseline Distress Thermometer"}
        onPress={handleDistressThermometerPress}
        className="bg-[#F6F7F7] border-[#F6F7F7]"
      />
      <AssessItem
        icon="📝"
        title="Fact-G scoring 0-108"
        subtitle="Evaluate quality of life across physical, social, emotional domains"
        // onPress={() => navigation.navigate('FactGAssessmentHistory',{patientId,age})}
        onPress={() => navigation.navigate("EdmontonFactGScreen", { patientId, age,studyId })}
        className="bg-[#F6F7F7] border-[#F6F7F7]"
      />
      {/* Only show Study Observation Form for Study group participants */}
      {groupType === 'Study' && (
        <AssessItem
          icon="📋"
          title="Study Observation Form"
          subtitle="Record session observations and participant responses"
          onPress={() =>
            // navigation.navigate('StudyObservation_List',{patientId,age})
            navigation.navigate("StudyObservation", { patientId, age,studyId })
          }
          className="bg-[#F6F7F7] border-[#F6F7F7]"
        />
      )}
      <AssessItem
        icon="📝"
        title="Exit Interview optional"
        subtitle="Final assessment and feedback collection from participant"
        onPress={() =>
          navigation.navigate('ExitInterview', { patientId, age,studyId })
        }
        className="bg-[#F6F7F7] border-[#F6F7F7]"
      />


    </ScrollView>
  );
};

export default AssessmentTab;