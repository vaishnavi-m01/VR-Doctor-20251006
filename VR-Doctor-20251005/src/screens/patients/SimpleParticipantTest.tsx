import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import PatientCard from '../../components/PatientCard';
import { useNavigation } from '@react-navigation/native';

export default function SimpleParticipantTest() {
  const nav = useNavigation();
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Ready to test');
  const [diagnostics, setDiagnostics] = useState<string[]>([]);

  const addDiagnostic = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const fullMessage = `${timestamp}: ${message}`;
    console.log(fullMessage);
    setDiagnostics(prev => [...prev, fullMessage]);
  };

  const loadParticipants = async () => {
    setLoading(true);
    setStatus('Loading...');
    setDiagnostics([]);
    
    try {
      addDiagnostic('🚀 Starting comprehensive test...');
      
      // Test 1: Basic connectivity
      addDiagnostic('🌐 Testing basic internet connectivity...');
      try {
        const testResponse = await fetch('https://httpbin.org/get', { method: 'GET' });
        addDiagnostic(`✅ Internet works: ${testResponse.status}`);
      } catch (netErr: any) {
        addDiagnostic(`❌ Internet test failed: ${netErr.message}`);
      }
      
      // Test 2: Our API endpoint
      addDiagnostic('🎯 Testing our API endpoint...');
      const apiUrl = 'http://103.146.234.88:3007/api/participant-socio-demographics';
      addDiagnostic(`📡 Making request to: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      addDiagnostic(`📡 Response status: ${response.status}`);
      addDiagnostic(`📡 Response ok: ${response.ok}`);
      addDiagnostic(`📡 Response type: ${response.type}`);
      addDiagnostic(`📡 Response url: ${response.url}`);
      
      if (response.ok) {
        const text = await response.text();
        addDiagnostic(`📦 Raw response length: ${text.length} characters`);
        
        try {
          const data = JSON.parse(text);
          addDiagnostic(`✅ JSON parsed successfully: ${data.length} participants`);
          addDiagnostic(`📊 First participant ID: ${data[0]?.ParticipantId || 'None'}`);
          
          setParticipants(data);
          setStatus(`SUCCESS! Loaded ${data.length} participants`);
          
          Alert.alert(
            '🎉 SUCCESS!', 
            `Loaded ${data.length} participants!\n\nFirst: ${data[0]?.ParticipantId}\nAge: ${data[0]?.Age}\nGender: ${data[0]?.Gender}`
          );
        } catch (parseErr: any) {
          addDiagnostic(`❌ JSON parse error: ${parseErr.message}`);
          addDiagnostic(`📄 Raw response preview: ${text.substring(0, 200)}...`);
          setStatus(`Parse Error: ${parseErr.message}`);
          Alert.alert('Parse Error', `Could not parse JSON: ${parseErr.message}`);
        }
      } else {
        const errorText = await response.text();
        addDiagnostic(`❌ HTTP error ${response.status}: ${errorText}`);
        setStatus(`HTTP ${response.status}: ${errorText}`);
        Alert.alert('HTTP Error', `${response.status}: ${errorText}`);
      }
    } catch (error: any) {
      addDiagnostic(`💥 Network error: ${error.message}`);
      addDiagnostic(`💥 Error name: ${error.name}`);
      addDiagnostic(`💥 Error stack: ${error.stack?.substring(0, 200)}`);
      setStatus(`Network Error: ${error.message}`);
      Alert.alert('Network Error', `${error.name}: ${error.message}`);
    } finally {
      setLoading(false);
      addDiagnostic('🏁 Test completed');
    }
  };

  // Auto-load on mount
  useEffect(() => {
    loadParticipants();
  }, []);

  return (
            <View className="flex-1 bg-white p-4">
      <View className="mb-4">
        <Pressable 
          onPress={() => nav.goBack()}
          className="bg-blue-500 px-4 py-2 rounded mb-4"
        >
          <Text className="text-white text-center">← Back</Text>
        </Pressable>
        
        <Text className="text-2xl font-bold mb-2">API Diagnostics Test</Text>
        <Text className="text-gray-600 mb-4">Status: {status}</Text>
        
        <Pressable 
          onPress={loadParticipants}
          className="bg-green-500 px-4 py-2 rounded mb-4"
          disabled={loading}
        >
          <Text className="text-white text-center">
            {loading ? 'Running Test...' : 'Run Full Test'}
          </Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1">
        {/* Diagnostics Section */}
        <View className="bg-blue-50 p-3 rounded mb-4">
          <Text className="font-bold text-blue-800 mb-2">🔍 Test Diagnostics:</Text>
          <ScrollView className="max-h-40">
            {diagnostics.map((diagnostic, index) => (
              <Text key={index} className="text-xs text-blue-700 mb-1">
                {diagnostic}
              </Text>
            ))}
            {diagnostics.length === 0 && (
              <Text className="text-xs text-blue-500">No diagnostics yet - run test to see details...</Text>
            )}
          </ScrollView>
        </View>

        {/* Participants Section */}
        <Text className="font-bold mb-2">
          Participants ({participants.length}):
        </Text>
        
        {participants.length === 0 ? (
          <Text className="text-gray-500 text-center py-8">
            {loading ? 'Loading...' : 'No participants loaded - check diagnostics above'}
          </Text>
        ) : (
          participants.slice(0, 5).map((participant, index) => (
            <PatientCard
              key={participant.ParticipantId || index}
              name={participant.ParticipantId || `Participant ${index + 1}`}
              sub={`${participant.Age || 'N/A'} y • ${participant.Gender || 'N/A'} • ${participant.CriteriaStatus || 'N/A'}`}
              onStart={() => Alert.alert(
                'Participant Details',
                `ID: ${participant.ParticipantId}\nAge: ${participant.Age}\nGender: ${participant.Gender}\nStatus: ${participant.CriteriaStatus}`
              )}
              groupType={participant.GroupType}
            />
          ))
        )}
        
        {participants.length > 5 && (
          <Text className="text-center text-gray-500 py-4">
            Showing 5 of {participants.length} participants (Test successful! ✅)
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
