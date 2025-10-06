
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, Alert } from 'react-native';
import SearchBar from '../../components/SearchBar';
import KPI from '../../components/KPI';
import PatientCard from '../../components/PatientCard';
import BottomBar from '../../components/BottomBar';
import Card from '../../components/Card';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../Navigation/types';
import { useParticipants } from '../../hooks/useParticipants';
import { Participant } from '../../services/participantService';

export default function PatientDatabaseScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  console.log('🔍 PatientDatabaseScreen: Component rendering at:', new Date().toISOString());
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Use the participants hook without pagination
  const {
    participants,
    loading,
    error,
    total,
    fetchParticipants,
    refreshParticipants,
    clearError,
  } = useParticipants();

  // Handle search with debouncing
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for search
    const timeout = setTimeout(() => {
      // Convert search term to filters and fetch all participants
      let filters = {};
      if (query.trim()) {
        const searchTerm = query.trim();
        const lowerSearch = searchTerm.toLowerCase();
        
        if (['male', 'female', 'other'].includes(lowerSearch)) {
          filters = { gender: lowerSearch.charAt(0).toUpperCase() + lowerSearch.slice(1) };
        } else if (/^PID-\d+$/i.test(searchTerm)) {
          // Exact PID match (e.g., "PID-25")
          filters = { searchString: searchTerm };
        } else if (/^\d+$/i.test(searchTerm)) {
          // Number only - search for PID containing this number (e.g., "25" -> search for PID containing "25")
          filters = { searchString: `PID-${searchTerm}` };
        } else if (!isNaN(Number(searchTerm)) && searchTerm.length > 2) {
          // Age search only for numbers longer than 2 digits
          filters = { ageFrom: Number(searchTerm), ageTo: Number(searchTerm) };
        } else {
          filters = { cancerDiagnosis: searchTerm };
        }
      }
      
      fetchParticipants(Object.keys(filters).length > 0 ? filters : undefined);
    }, 500);
    
    setSearchTimeout(timeout);
  };

  // Filter participants based on search query (client-side filtering for immediate feedback)
  const filteredParticipants = participants.filter(participant => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      participant.ParticipantId?.toLowerCase().includes(query) ||
      participant.MRNumber?.toLowerCase().includes(query) ||
      participant.Gender?.toLowerCase().includes(query) ||
      participant.EducationLevel?.toLowerCase().includes(query)
    );
  });

  // Get included participants count
  const includedCount = participants.filter((p: any) => p.CriteriaStatus === 'Included').length;
  const excludedCount = participants.filter((p: any) => p.CriteriaStatus === 'Excluded').length;

  const handleParticipantSelect = (participant: Participant) => {
    Alert.alert(
      'Participant Details',
      `ID: ${participant.ParticipantId}\nMR Number: ${participant.MRNumber || 'N/A'}\nAge: ${participant.Age || 'N/A'}\nGender: ${participant.Gender || 'N/A'}\nStatus: ${participant.CriteriaStatus || 'N/A'}`,
      [
        { text: 'OK', style: 'default' },
        { text: 'Start Session', style: 'default', onPress: () => nav.navigate('SessionSetupScreen' as any, { patientId: participant.ParticipantId, age: participant.Age || 0, studyId: 1 }) },
      ]
    );
  };

  const handleRefresh = () => {
    clearError();
    refreshParticipants();
  };

  return (
    <View className="flex-1 bg-white">
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xl font-bold text-gray-800">Participant Database</Text>
          <View className="flex-row space-x-2">
            <Pressable 
              onPress={() => nav.navigate('SimpleParticipantTest' as any)}
              className="bg-green-500 px-3 py-1 rounded"
            >
              <Text className="text-white text-xs">🧪 Simple Test</Text>
            </Pressable>
            <Pressable 
              onPress={() => nav.navigate('Profile')}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 items-center justify-center shadow-sm"
            >
              <Text className="text-xl">👤</Text>
            </Pressable>
          </View>
        </View>
        
        <SearchBar 
          placeholder="Search participants..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        
        <View className="flex-row gap-3 mt-3">
          <Pressable className="flex-1 bg-white border border-[#d7ebe3] rounded-xl px-3 py-2">
            <Text className="font-bold text-[#2c4a43]">All Participants ({total})</Text>
          </Pressable>
          <Pressable className="flex-1 bg-white border border-[#d7ebe3] rounded-xl px-3 py-2">
            <Text className="font-bold text-[#2c4a43]">Included ({includedCount})</Text>
          </Pressable>
        </View>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <View className="flex-row items-center justify-between mt-3 p-3 bg-gray-50 rounded-xl">
            <View className="flex-row items-center space-x-2">
              <Text className="text-sm text-gray-600">Page {currentPage} of {totalPages}</Text>
              <Text className="text-sm text-gray-600">•</Text>
              <Text className="text-sm text-gray-600">{pageSize} per page</Text>
            </View>
            
            <View className="flex-row space-x-2">
              <Pressable 
                onPress={() => goToPage(currentPage - 1)}
                disabled={!hasPreviousPage}
                className={`px-3 py-1 rounded ${hasPreviousPage ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <Text className={`text-xs ${hasPreviousPage ? 'text-white' : 'text-gray-500'}`}>Previous</Text>
              </Pressable>
              
              <Pressable 
                onPress={() => goToPage(currentPage + 1)}
                disabled={!hasNextPage}
                className={`px-3 py-1 rounded ${hasNextPage ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <Text className={`text-xs ${hasNextPage ? 'text-white' : 'text-gray-500'}`}>Next</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Page Size Selector */}
        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-sm text-gray-600">Items per page:</Text>
          <View className="flex-row space-x-1">
            {[10, 20, 50].map((size) => (
              <Pressable
                key={size}
                onPress={() => changePageSize(size)}
                className={`px-2 py-1 rounded ${pageSize === size ? 'bg-blue-500' : 'bg-gray-200'}`}
              >
                <Text className={`text-xs ${pageSize === size ? 'text-white' : 'text-gray-700'}`}>{size}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1 p-4 gap-3 pb-[300px]"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
      >
        <View className="gap-3">
          <View className="flex-row gap-3">
            <View className="flex-1"><KPI value={total.toString()} label="Total Participants" icon="🧾" /></View>
            <View className="flex-1"><KPI value={includedCount.toString()} label="Included" icon="✅" /></View>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1"><KPI value={excludedCount.toString()} label="Excluded" icon="❌" /></View>
            <View className="flex-1"><KPI value={participants.length.toString()} label="Current Page" icon="📄" /></View>
          </View>
        </View>

        <Card className="mt-2 p-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-bold">Participants</Text>
            <Pressable><Text className="text-[#0ea06c] font-bold">+ Add participant</Text></Pressable>
          </View>
          
          {loading ? (
            <View className="py-8 items-center">
              <Text className="text-gray-500">Loading participants...</Text>
            </View>
          ) : error ? (
            <View className="py-8 items-center">
              <Text className="text-red-500 mb-4">Error loading participants</Text>
              <Text className="text-red-500 text-sm mb-2">{error}</Text>
              <Pressable onPress={handleRefresh} className="bg-blue-500 px-4 py-2 rounded">
                <Text className="text-white">Retry</Text>
              </Pressable>
            </View>
          ) : participants.length === 0 ? (
            <View className="py-8 items-center">
              <Text className="text-gray-500">No participants found</Text>
              {searchQuery && (
                <Text className="text-gray-400 text-sm mt-2">Try adjusting your search terms</Text>
              )}
            </View>
          ) : (
            <View className="gap-3">
              <Text className="font-bold text-gray-800 mb-2">
                📊 Showing {participants.length} participants
              </Text>
              
              {filteredParticipants.map((participant: any, index: number) => (
                <PatientCard
                  key={participant.ParticipantId || `participant-${index}`}
                  name={participant.ParticipantId || `Participant ${index + 1}`}
                  sub={`${participant.Age || 'N/A'} y • ${participant.Gender || 'N/A'} • ${participant.CriteriaStatus || 'N/A'}`}
                  onStart={() => handleParticipantSelect(participant)}
                  groupType={participant.GroupType}
                  createdDate={participant.CreatedDate}
                />
              ))}
            </View>
          )}
        </Card>
      </ScrollView>

      <BottomBar>
        <Text className="text-white text-sm">
          Total: {total} | Included: {includedCount} | Excluded: {excludedCount}
        </Text>
      </BottomBar>
    </View>
  );
}
