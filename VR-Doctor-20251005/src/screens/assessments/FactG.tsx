import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import FormCard from '@components/FormCard';
import PillGroup from '@components/PillGroup';
import BottomBar from '@components/BottomBar';
import { Btn } from '@components/Button';
import { subscales, computeScores } from '@data/factg';
import { Field } from '@components/Field';
import DateField from '@components/DateField';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../Navigation/types';

export default function FactG(){
  const [answers, setAnswers] = useState<Record<string, number|null>>({});
  const score = useMemo(()=>computeScores(answers), [answers]);

  const route = useRoute<RouteProp<RootStackParamList, 'FactG'>>();
  const { patientId } = route.params as { patientId: number };

  function set(code: string, v: number){ setAnswers(prev=>({...prev, [code]: v})); }

  return (
    <>
    <ScrollView className="flex-1 bg-bg pb-[400px]" style={{ paddingLeft: 8, paddingRight: 16, paddingTop: 16 }}>
      <FormCard icon="FG" title="FACT-G (Version 4)" desc="Considering the past 7 days, choose one number per line. 0=Not at all ... 4=Very much.">
        <View className="flex-row gap-3">
          <View className="flex-1"><Field label="Participant ID" placeholder={`${patientId}`}/></View>
          <View className="flex-1"><DateField label="Assessed On" value="" onChange={() => {}} /></View>
          <View className="flex-1"><Field label="Assessed By" placeholder="Name & role"/></View>
        </View>
      </FormCard>

      {/* Improved UI with side letters in same column */}
      <FormCard icon="📋" title="FACT-G Assessment Questions" desc="Rate each statement from 0 (Not at all) to 4 (Very much)">
        <View className="space-y-4">
          {/* Header row with consistent spacing */}
          <View className="flex-row items-center gap-3 mb-3 pb-2 border-b border-gray-200">
            <View className="w-12 items-center">
              <Text className="text-xs font-bold text-gray-600 uppercase">Code</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs font-bold text-gray-600 uppercase">Question</Text>
            </View>
            <View className="w-40">
              <Text className="text-xs font-bold text-gray-600 uppercase text-center">Rating (0-4)</Text>
            </View>
          </View>

          {subscales.map((sc, scaleIndex) => (
            <View key={sc.key} className="space-y-3">
              {/* Scale header */}
              <View className="flex-row items-center gap-3 py-2 bg-gray-50 rounded-lg px-3">
                <View className="w-12 items-center">
                  <View className="w-8 h-8 bg-[#0ea06c] rounded-full items-center justify-center">
                    <Text className="text-white font-bold text-sm">{sc.key[0]}</Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-[#0ea06c] text-sm">{sc.label}</Text>
                  <Text className="text-xs text-gray-500">Range: {sc.range[0]}-{sc.range[1]}</Text>
                </View>
                <View className="w-40"></View>
              </View>

              {/* Questions for this scale */}
              {sc.items.map((it, itemIndex) => (
                <View key={it.code} className="flex-row items-center gap-3 py-2 px-3 bg-white rounded-lg border border-gray-100">
                  <View className="w-12 items-center">
                    <Text className="text-sm font-bold text-[#0ea06c]">{it.code}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-gray-700 leading-5">{it.text}</Text>
                    {it.optional && (
                      <Text className="text-xs text-orange-500 font-medium mt-1">Optional</Text>
                    )}
                  </View>
                  <View className="w-40">
                    <PillGroup 
                      values={[0,1,2,3,4]} 
                      value={answers[it.code] ?? undefined} 
                      onChange={(v)=>set(it.code, Number(v))} 
                    />
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      </FormCard>
    </ScrollView>

    <BottomBar>
      <View className="flex-row items-center gap-2 flex-wrap">
        {/* Score indicators */}
        <View className="flex-row items-center gap-2">
          <View className="px-3 py-2 rounded-lg bg-[#0ea06c]">
            <Text className="text-white font-bold text-xs">PWB</Text>
            <Text className="text-white font-extrabold text-sm">{score.PWB}</Text>
          </View>
          <View className="px-3 py-2 rounded-lg bg-[#0ea06c]">
            <Text className="text-white font-bold text-xs">SWB</Text>
            <Text className="text-white font-extrabold text-sm">{score.SWB}</Text>
          </View>
          <View className="px-3 py-2 rounded-lg bg-[#0ea06c]">
            <Text className="text-white font-bold text-xs">EWB</Text>
            <Text className="text-white font-extrabold text-sm">{score.EWB}</Text>
          </View>
          <View className="px-3 py-2 rounded-lg bg-[#0ea06c]">
            <Text className="text-white font-bold text-xs">FWB</Text>
            <Text className="text-white font-extrabold text-sm">{score.FWB}</Text>
          </View>
          <View className="px-3 py-2 rounded-lg bg-[#134b3b] border-2 border-[#0ea06c]">
            <Text className="text-white font-bold text-xs">TOTAL</Text>
            <Text className="text-white font-extrabold text-base">{score.TOTAL}</Text>
          </View>
        </View>
        
        {/* Action buttons */}
        <View className="flex-row gap-2">
          <Btn variant="light" onPress={()=>{}}>Clear</Btn>
          <Btn onPress={()=>{}} className="font-bold text-base">Save & Close</Btn>
        </View>
      </View>
    </BottomBar>
    </>
  );
}
