import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import FormCard from '@components/FormCard';
import Thermometer from '@components/Thermometer';
import { Field } from '@components/Field';
import DateField from '@components/DateField';
import Chip from '@components/Chip';
import BottomBar from '@components/BottomBar';
import { Btn } from '@components/Button';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../Navigation/types';

export default function Screening(){
  const [dt,setDt]=useState(0);
  const [implants,setImplants]=useState('');
  const [prosthetics,setProsthetics]=useState('');
  const [conds,setConds]=useState<string[]>([]);

  const route = useRoute<RouteProp<RootStackParamList, 'Screening'>>();
  const { patientId } = route.params as { patientId: number };

  const handleClear = () => {
    setDt(0);
    setImplants("");
    setProsthetics("");
    setConds([]);
  };

  return (
    <>
    <ScrollView className="flex-1 p-4 bg-bg pb-[400px]">
      <FormCard icon="D" title="Particpant Screening">
        <View className="flex-row gap-3">
          <View className="flex-1"><Field label="Participant ID" placeholder={`Participant ID: ${patientId}`}/></View>
          <View className="flex-1"><DateField label="Date" value="" onChange={() => {}} /></View>
        </View>
      </FormCard>

      <FormCard icon="I" title="Medical Details">
        <Text className="text-xs text-muted mb-2">Distress Thermometer (0–10)</Text>
        <Thermometer value={dt} onChange={setDt} />
        <View className="flex-row gap-3 mt-3">
          <View className="flex-1"><Field label="FACT-G Total Score" keyboardType="number-pad" placeholder="0–108"/></View>
        </View>
        <View className="flex-row gap-3 mt-3">
          <View className="flex-1"><Field label="Pulse Rate (bpm)" placeholder="76"/></View>
          <View className="flex-1"><Field label="Blood Pressure (mmHg)" placeholder="120/80"/></View>
          <View className="flex-1"><Field label="Temperature (°C)" placeholder="36.8"/></View>
          <View className="flex-1"><Field label="BMI" placeholder="22.5"/></View>
        </View>
      </FormCard>

      <FormCard icon="⚙️" title="Devices">
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-xs text-[#4b5f5a] mb-2">Any electronic implants?</Text>
            <View className="flex-row gap-2">
              {/* Yes Button */}
              <Pressable 
                onPress={() => setImplants('Yes')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  implants === 'Yes' 
                    ? 'bg-[#4FC264]' 
                    : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-xs ${
                  implants === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Yes
                </Text>
              </Pressable>

              {/* No Button */}
              <Pressable 
                onPress={() => setImplants('No')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  implants === 'No' 
                    ? 'bg-[#4FC264]' 
                    : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-xs ${
                  implants === 'No' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  No
                </Text>
              </Pressable>
            </View>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-[#4b5f5a] mb-2">Any prosthetics or orthotics device?</Text>
            <View className="flex-row gap-2">
              {/* Yes Button */}
              <Pressable 
                onPress={() => setProsthetics('Yes')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  prosthetics === 'Yes' 
                    ? 'bg-[#4FC264]' 
                    : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-xs ${
                  prosthetics === 'Yes' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  Yes
                </Text>
              </Pressable>

              {/* No Button */}
              <Pressable 
                onPress={() => setProsthetics('No')}
                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${
                  prosthetics === 'No' 
                    ? 'bg-[#4FC264]' 
                    : 'bg-[#EBF6D6]'
                }`}
              >
                <Text className={`font-medium text-xs ${
                  prosthetics === 'No' ? 'text-white' : 'text-[#2c4a43]'
                }`}>
                  No
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </FormCard>

      <FormCard icon="✔︎" title="Clinical Checklist">
        <Chip items={['Vertigo / Dizziness','Tinnitus','Migraine','Diplopia','Blurred Vision','Any discomfort / uneasiness','Brain Tumors','Advanced stage of cancer','Brain Metastasis','Psychiatric illnesses','Surgical complications','Progressive disease on treatment (Not responsive)','Cognitive impairment','Hearing or sight problems']} value={conds} onChange={setConds}/>
        <View className="mt-3"><Field label="Notes (optional)" placeholder="Add any clarifications…"/></View>
      </FormCard>
    </ScrollView>

    <BottomBar>
      <Btn variant="light" onPress={handleClear}>Clear</Btn>
      <Btn onPress={()=>{}} className="font-bold text-base">Save & Close</Btn>
    </BottomBar>
    </>
  );
}
