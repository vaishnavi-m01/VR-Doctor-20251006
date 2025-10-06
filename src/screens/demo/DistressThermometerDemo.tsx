import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import FormCard from '@components/FormCard';
import Thermometer from '@components/Thermometer';

export default function DistressThermometerDemo(){
  const [v,setV]=useState(3);
  return (
    <ScrollView className="flex-1 p-4 bg-bg">
      <FormCard icon="DT" title="Distress Thermometer">
        <Thermometer value={v} onChange={setV} />
      </FormCard>
    </ScrollView>
  );
}
