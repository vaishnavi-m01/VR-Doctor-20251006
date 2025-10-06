import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import FormCard from '@components/FormCard';

export default function InvestigatorsBrochure(){
  return (
    <ScrollView className="flex-1 p-4 bg-bg">
      <FormCard icon="IB" title="Investigators’ Brochure — VR/Phone App Guided Imagery" desc="Overview, rationale, feasibility, clinical evidence, safety, risks/benefits, dosing.">
        <View className="flex-row flex-wrap gap-2 mt-1">
                  <Text className="px-3 py-2 rounded-full border border-[#c7ecdf] bg-[#F6F7F7]">AE: &lt;5%</Text>
        <Text className="px-3 py-2 rounded-full border border-[#c7ecdf] bg-[#F6F7F7]">Adherence: 95% VR / 89% App</Text>
          <Text className="px-3 py-2 rounded-full border border-[#bfdbfe] bg-[#eff6ff]">Pilot: 90% completion</Text>
          <Text className="px-3 py-2 rounded-full border border-[#fde68a] bg-[#fffbeb]">VR Contra: vertigo / visual impairment</Text>
        </View>
      </FormCard>

      {['Introduction','Background & Rationale','Preclinical / Feasibility','Clinical Trials','Risks & Benefits','Dosing Guidelines','Summary','References']
        .map((t, i)=> (
        <FormCard key={t} icon={String(i+1)} title={t}>
          <Text className="text-sm text-[#2b4640]">Content placeholder for “{t}”. Replace with your actual brochure text.</Text>
        </FormCard>
      ))}
    </ScrollView>
  );
}
