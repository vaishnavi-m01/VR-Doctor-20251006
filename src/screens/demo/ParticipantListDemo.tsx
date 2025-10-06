import React from 'react';
import { View, Text, Alert } from 'react-native';
import { ParticipantList } from '../../components/ParticipantList';
import { Participant } from '../../services/participantService';
import Header from '../../components/Header';

export const ParticipantListDemo: React.FC = () => {
  const handleParticipantSelect = (participant: Participant) => {
    Alert.alert(
      'Participant Selected',
      `Selected: ${participant.ParticipantId}\nMR Number: ${participant.MRNumber || 'N/A'}\nAge: ${participant.Age || 'N/A'}\nGender: ${participant.Gender || 'N/A'}`,
      [
        { text: 'OK', style: 'default' },
        { text: 'View Details', style: 'default' },
      ]
    );
  };

  return (
    <View className="flex-1 bg-white">
      <Header title="Participants List" onBack={() => {}} />
      
      <View className="flex-1 px-4 pt-4">
        <Text className="text-sm text-gray-600 mb-4">
          This demo shows participants fetched from the API endpoint: 
          http://103.146.234.88:3007/api/participant-socio-demographics
        </Text>
        
        <ParticipantList
          onParticipantSelect={handleParticipantSelect}
          showFilters={true}
        />
      </View>
    </View>
  );
};
