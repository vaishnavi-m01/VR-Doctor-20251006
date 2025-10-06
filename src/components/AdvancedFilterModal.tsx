import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Modal,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { DropdownField } from './DropdownField';
import { apiService } from 'src/services';

const GROUP_TYPES = ['Study', 'Controlled'];
const CANCER_STAGES = ['I', 'II', 'III', 'IV'];

interface AdvancedFilters {
  criteriaStatus: string;
  gender: string;
  ageFrom: string;
  ageTo: string;
  groupType: string;
  cancerDiagnosis: string;    
  stageOfCancer: string; 
}

interface OptionRowProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const OptionRow: React.FC<OptionRowProps> = ({
  label,
  selected,
  onPress,
}) => (
  <TouchableOpacity
    className="flex-row justify-between items-center bg-[#f9fafb] rounded-xl border border-gray-300 py-3 px-4 mb-2"
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text className="text-gray-700 font-medium text-base">{label}</Text>
    <MaterialIcons
      name={selected ? 'check-circle' : 'radio-button-unchecked'}
      size={24}
      color={selected ? '#0ea06c' : '#d1d5db'}
    />
  </TouchableOpacity>
);

interface AdvancedFilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: AdvancedFilters;
  onCriteriaStatusChange: (status: string) => void;
  onGenderChange: (gender: string) => void;
  onAgeChange: (field: 'ageFrom' | 'ageTo', value: string) => void;
  onGroupTypeChange: (groupType: string) => void;
  onCancerDiagnosisChange: (value: string) => void;
  onStageOfCancerChange: (value: string) => void;
  onClearFilters: () => Promise<void>;
  onFiltersReset?: () => void;
  
  ageRangeError?: string;
}

const AdvancedFilterModal: React.FC<AdvancedFilterModalProps> = ({
  visible,
  onClose,
  filters,
  onCriteriaStatusChange,
  onGenderChange,
  onAgeChange,
  onGroupTypeChange,
  onCancerDiagnosisChange,
  onStageOfCancerChange,
  onClearFilters,
  ageRangeError,
  onFiltersReset,
}) => {

  const [cancerTypes, setCancerTypes] = useState<Array<{ label: string; value: string }>>([]);
  const [loading, setLoading] = useState(false);

  // Fetch cancer types from API
  useEffect(() => {
    const fetchCancerTypes = async () => {
      try {
        setLoading(true);
        const response = await apiService.post<any>('/GetCancerTypesData');
        
        if (response.data?.ResponseData) {
          const types = response.data.ResponseData.map((item: any) => ({
            label: item.CancerType,
            value: item.CancerTypeId,
          }));
          setCancerTypes(types);
          console.log('Loaded cancer types:', types);
        }
      } catch (error) {
        console.error('Failed to fetch cancer types:', error);
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      fetchCancerTypes();
    }
  }, [visible]);

  const handleCloseAndClear = async () => {
    await onClearFilters();  
    onClose();               
  };

const handleResetAndClose = () => {
  onClearFilters();
  onClose();
  onFiltersReset?.();
};

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCloseAndClear}>
      <View className="flex-1 justify-center items-center p-5">
        <View className="w-full max-w-[27rem] max-h-[80%] bg-green-50 rounded-2xl shadow-lg overflow-hidden border-2 border-green-200">

          {/* Header */}
          <View className="pt-6 px-6 pb-4 border-b border-green-300 flex-row justify-between items-center">
            <Text className="text-lg font-bold text-gray-900 mb-1">Filters</Text>
            {/* ❌ Close button */}
           <TouchableOpacity onPress={handleCloseAndClear}>
              <MaterialIcons name="close" size={26} color="#e03a1d" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="p-6"
            contentContainerStyle={{ paddingBottom: 0 }}
          >
            {/* Criteria Status Filters */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold text-base mb-3">Criteria Status</Text>
              <OptionRow
                label="Included"
                selected={filters.criteriaStatus === 'Included'}
                onPress={() => onCriteriaStatusChange('Included')}
              />
              <OptionRow
                label="Excluded"
                selected={filters.criteriaStatus === 'Excluded'}
                onPress={() => onCriteriaStatusChange('Excluded')}
              />
            </View>

            {/* Group Type */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold text-base mb-3">Group Type</Text>
              <View className="flex-row" style={{ gap: 12 }}>
                {GROUP_TYPES.map(type => {
                  const isActive = filters.groupType === type;
                  return (
                    <Pressable
                      key={type}
                      onPress={() => onGroupTypeChange(isActive ? '' : type)}
                      className={`flex-1 py-3 rounded-xl border ${
                        isActive ? 'border-green-600 bg-green-100' : 'border-gray-300 bg-white'
                      } items-center justify-center`}
                    >
                      <Text className={`${isActive ? 'text-green-600 font-semibold' : 'text-gray-500 font-semibold'}`}>
                        {type}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Gender */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold text-base mb-3">Gender</Text>
              <View className="flex-row" style={{ gap: 12 }}>
                {['Male', 'Female'].map(g => {
                  const isActive = filters.gender === g;
                  return (
                    <Pressable
                      key={g}
                      onPress={() => onGenderChange(isActive ? '' : g)}
                      className={`flex-1 py-3 rounded-xl border ${
                        isActive ? 'border-green-600 bg-green-100' : 'border-gray-300 bg-white'
                      } items-center justify-center`}
                    >
                      <Text className={`${isActive ? 'text-green-600 font-semibold' : 'text-gray-500 font-semibold'}`}>
                        {g}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Age Range */}
        
          <View className="mb-6">
            <Text className="text-gray-700 font-semibold text-base mb-3">Age Range</Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <TextInput
                placeholder="From"
                style={{
                  width: "45%",
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderColor: ageRangeError ? "red" : "#d1d5db",
                  textAlign: "center",
                  fontSize: 14,
                  color: "#374151",
                  backgroundColor: "white",
                }}
                keyboardType="numeric"
                value={filters.ageFrom}
                onChangeText={(val: string) => onAgeChange("ageFrom", val)}
                maxLength={3}
                returnKeyType="done"
                placeholderTextColor="#999"
              />
              <Text style={{ marginHorizontal: 8, color: "#4b5563", fontSize: 14 }}>to</Text>
              <TextInput
                placeholder="To"
                style={{
                  width: "45%",
                  borderWidth: 1,
                  borderColor: ageRangeError ? "red" : "#d1d5db",
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  textAlign: "center",
                  fontSize: 14,
                  color: "#374151",
                  backgroundColor: "white",
                }}
                keyboardType="numeric"
                value={filters.ageTo}
                 onChangeText={(val: string) => onAgeChange("ageTo", val)}
                maxLength={3}
                returnKeyType="done"
                placeholderTextColor="#999"
              />
             
            </View>
             {ageRangeError ? (
                <Text style={{ color: 'red', marginTop: 4, fontSize: 12 }}>
                  {ageRangeError}
                </Text>
              ) : null}
          </View>

          {/* Cancer Diagnosis Dropdown */}
          <View className="mb-6">
            <Text className="text-gray-700 font-semibold text-base mb-3">Cancer Diagnosis</Text>
            <DropdownField
              options={[
                { label: 'None', value: '' },
                ...cancerTypes
              ]}
              value={filters.cancerDiagnosis}
              onValueChange={onCancerDiagnosisChange}
              placeholder="Select cancer type"
            />
          </View>

          {/* Stage Of Cancer Dropdown */}
          <View className="mb-6">
            <Text className="text-gray-700 font-semibold text-base mb-3">Stage Of Cancer</Text>
            <DropdownField
              options={[
                { label: 'None', value: '' },
                ...CANCER_STAGES.map(stage => ({ label: `Stage ${stage}`, value: stage }))
              ]}
              value={filters.stageOfCancer}
              onValueChange={onStageOfCancerChange}
              placeholder="Select stage"
            />
          </View>

          </ScrollView>

          {/* Footer */}
          <View className="flex-row justify-between px-6 py-4 border-t border-green-300">
            <Pressable
              onPress={handleResetAndClose}
              accessibilityLabel="Reset all filters and close modal"
            >
              <Text className="text-red-700 font-bold text-base">Reset</Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              accessibilityLabel="Apply filters and close modal"
            >
              <Text className="text-green-600 font-bold text-base">Done</Text>
            </Pressable>
          </View>

        </View>
      </View>
    </Modal>
  );
};

export default AdvancedFilterModal;
export type { AdvancedFilters };
