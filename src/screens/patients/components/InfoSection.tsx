import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Or a similar icon library

const PatientRegistrationForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<string | null>(null); // 'Male' or 'Female'
  const [patientType, setPatientType] = useState<string | null>(null); // 'In-Patient' or 'Out-Patient'
  const [mobileNumber, setMobileNumber] = useState('');
  const [city, setCity] = useState('');
  const [patientId, setPatientId] = useState('0012-5369-5824'); // Static for now, or generate dynamically

  const GenderOption = ({ label, iconName, selected, onPress }: { label: string; iconName: string; selected: boolean; onPress: () => void }) => (
    <TouchableOpacity
      className={`flex-row items-center bg-gray-100 rounded-lg py-4 px-8 flex-1 mx-1 justify-center ${
        selected ? 'bg-emerald-50 border border-emerald-500' : ''
      }`}
      onPress={onPress}
    >
      <Icon name={iconName} size={24} color={selected ? '#34A853' : '#6B7A77'} />
      <Text
        className={`ml-2 text-base ${
          selected ? 'text-emerald-500 font-bold' : 'text-gray-500'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const PatientTypeOption = ({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) => (
    <TouchableOpacity
      className={`flex-row items-center bg-gray-100 rounded-lg py-4 px-5 flex-1 mx-1 justify-center ${
        selected ? 'bg-emerald-50 border border-emerald-500' : ''
      }`}
      onPress={onPress}
    >
      {selected && (
        <Icon name="check-circle" size={20} color="#34A853" className="mr-1" />
      )}
      <Text
        className={`text-base ${
          selected ? 'text-emerald-500 font-bold' : 'text-gray-500'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 p-5 bg-white">
      {/* Patient ID */}
      <View className="flex-row justify-end mb-5">
        <Text className="text-sm text-gray-700">Particpant ID : </Text>
        <Text className="text-sm font-bold text-emerald-500">{patientId}</Text>
      </View>

      {/* Basic Info */}
      <Text className="text-lg font-bold mb-4">Basic Info</Text>

      {/* Patient Full Name */}
      <Text className="text-base mb-2 text-gray-700">Particpant full name?</Text>
      <View className="bg-gray-100 rounded-xl mb-4 px-4 h-12 justify-center">
        <TextInput
          className="text-base text-gray-700 flex-1"
          placeholder="Samantha ruth"
          placeholderTextColor="#9ca3af" // Tailwind's gray-400
          value={firstName}
          onChangeText={setFirstName}
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: 16,
          }}
        />
      </View>

      {/* Last Name */}
      <View className="bg-gray-100 rounded-xl mb-4 px-4 h-12 justify-center">
        <TextInput
          className="text-base text-gray-700 flex-1"
          placeholder="Last name"
          placeholderTextColor="#9ca3af"
          value={lastName}
          onChangeText={setLastName}
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: 16,
          }}
        />
      </View>

      {/* Patient Age */}
      <Text className="text-base mb-2 text-gray-700">Particpant age?</Text>
      <View className="bg-gray-100 rounded-xl mb-4 px-4 h-12 justify-center">
        <TextInput
          className="text-base text-gray-700 flex-1"
          placeholder="23"
          placeholderTextColor="#9ca3af"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: 16,
          }}
        />
      </View>

      {/* Patient Gender */}
      <Text className="text-base mb-2 text-gray-700">Particpant gender?</Text>
      <View className="flex-row justify-between mb-5">
        <GenderOption
          label="Male"
          iconName="male"
          selected={gender === 'Male'}
          onPress={() => setGender('Male')}
        />
        <GenderOption
          label="Female"
          iconName="female"
          selected={gender === 'Female'}
          onPress={() => setGender('Female')}
        />
      </View>

      {/* Patient Type */}
      <Text className="text-base mb-2 text-gray-700">Particpant type</Text>
      <View className="flex-row justify-between mb-5">
        <PatientTypeOption
          label="In-Patient"
          selected={patientType === 'In-Patient'}
          onPress={() => setPatientType('In-Patient')}
        />
        <PatientTypeOption
          label="Out-Patient"
          selected={patientType === 'Out-Patient'}
          onPress={() => setPatientType('Out-Patient')}
        />
      </View>

      {/* Patient Mobile */}
      <Text className="text-base mb-2 text-gray-700">Particpant mobile</Text>
      <View className="flex-row bg-gray-100 rounded-xl mb-4 px-4 h-12 items-center">
        <Text className="text-base text-gray-700 mr-1">+91</Text>
        <TextInput
          className="text-base text-gray-700 flex-1"
          placeholder="970 333 6108"
          placeholderTextColor="#9ca3af"
          keyboardType="phone-pad"
          value={mobileNumber}
          onChangeText={setMobileNumber}
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: 16,
          }}
        />
      </View>

      {/* Patient Address */}
      <Text className="text-base mb-2 text-gray-700">Particpant address</Text>
      <View className="bg-gray-100 rounded-xl mb-4 px-4 h-12 justify-center">
        <TextInput
          className="text-base text-gray-700 flex-1"
          placeholder="City"
          placeholderTextColor="#9ca3af"
          value={city}
          onChangeText={setCity}
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: 16,
          }}
        />
      </View>
    </ScrollView>
  );
};
 
export default PatientRegistrationForm; 