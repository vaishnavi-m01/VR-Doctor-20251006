import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useParticipants } from '../hooks/useParticipants';
import { ParticipantFilters } from '../services/participantService';
import { Participant } from '../services/participantService';
import Card from './Card';
import Button from './Button';
import SearchBar from './SearchBar';
import StatusChip from './StatusChip';
import { getParticipantBackgroundColor } from '../utils/participantColors';

interface ParticipantListProps {
  onParticipantSelect?: (participant: Participant) => void;
  showFilters?: boolean;
  initialFilters?: ParticipantFilters;
}

export const ParticipantList: React.FC<ParticipantListProps> = ({
  onParticipantSelect,
  showFilters = true,
  initialFilters,
}) => {
  const {
    participants,
    loading,
    error,
    total,
    fetchParticipants,
    refreshParticipants,
    clearError,
  } = useParticipants(initialFilters);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<ParticipantFilters>(initialFilters || {});

  const filteredParticipants = participants.filter(participant => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      participant.ParticipantId?.toLowerCase().includes(query) ||
      participant.MRNumber?.toLowerCase().includes(query) ||
      participant.Gender?.toLowerCase().includes(query) ||
      participant.EducationLevel?.toLowerCase().includes(query) ||
      participant.CriteriaStatus?.toLowerCase().includes(query)
    );
  });

  const handleFilterChange = (filterType: keyof ParticipantFilters, value: string | number) => {
    const newFilters = { ...activeFilters, [filterType]: value };
    setActiveFilters(newFilters);
    fetchParticipants(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    fetchParticipants();
  };


  const renderParticipantItem = ({ item }: { item: Participant }) => {
    const bgColor = getParticipantBackgroundColor(item.GroupType, item.CreatedDate);
    
    return (
      <Card
        key={item.ParticipantId}
        onPress={() => onParticipantSelect?.(item)}
        className={`mb-3 p-4 ${bgColor}`}
      >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-semibold text-gray-800">
          {item.ParticipantId}
        </Text>
        <StatusChip
          label={item.CriteriaStatus || 'Unknown'}
          variant={item.CriteriaStatus === 'Included' ? 'success' : 'warning'}
        />
      </View>
      
      <View className="space-y-1">
        {item.MRNumber && (
          <Text className="text-sm text-gray-600">
            MR Number: {item.MRNumber}
          </Text>
        )}
        
        <View className="flex-row space-x-4">
          {item.Age && (
            <Text className="text-sm text-gray-600">
              Age: {item.Age}
            </Text>
          )}
          {item.Gender && (
            <Text className="text-sm text-gray-600">
              Gender: {item.Gender}
            </Text>
          )}
        </View>
        
        {item.EducationLevel && (
          <Text className="text-sm text-gray-600">
            Education: {item.EducationLevel}
          </Text>
        )}
        
        {item.EmploymentStatus && (
          <Text className="text-sm text-gray-600">
            Employment: {item.EmploymentStatus}
          </Text>
        )}
        
        {item.GroupType && (
          <View className="mt-2">
            <StatusChip label={item.GroupType} variant="info" />
          </View>
        )}
      </View>
    </Card>
    );
  };

  const renderFilters = () => (
    <View className="mb-4 space-y-3">
      <View className="flex-row space-x-2">
        <Button
          label="All"
          variant={!activeFilters.criteriaStatus ? 'primary' : 'secondary'}
          onPress={() => handleFilterChange('criteriaStatus', '')}
          size="small"
        />
        <Button
          label="Included"
          variant={activeFilters.criteriaStatus === 'Included' ? 'primary' : 'secondary'}
          onPress={() => handleFilterChange('criteriaStatus', 'Included')}
          size="small"
        />
        <Button
          label="Excluded"
          variant={activeFilters.criteriaStatus === 'Excluded' ? 'primary' : 'secondary'}
          onPress={() => handleFilterChange('criteriaStatus', 'Excluded')}
          size="small"
        />
      </View>
      
      <View className="flex-row space-x-2">
        <Button
          label="Clear Filters"
          variant="outline"
          onPress={clearFilters}
          size="small"
        />
      </View>
    </View>
  );

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center mb-4">{error}</Text>
        <Button label="Retry" onPress={refreshParticipants} />
        <Button label="Clear Error" variant="outline" onPress={clearError} className="mt-2" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="mb-4">
        <Text className="text-xl font-bold text-gray-800 mb-2">
          Participants ({total})
        </Text>
        
        <SearchBar
          placeholder="Search participants..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {showFilters && renderFilters()}

      <View className="flex-1">
        {filteredParticipants.map((item) => renderParticipantItem({ item }))}
      </View>
    </View>
  );
};
