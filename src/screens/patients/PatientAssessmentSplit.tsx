import { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Image } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ListItem from '../../components/ListItem';
import TabPills from '../../components/TabPills';
import ParticipantInfo from './components/participant_info';
import AssessmentTab from './components/assesment/AssessmentTab';
import VRSessionsList from '../vr-sessions/VRSessionsList';
import OrientationTab from './components/OrientationTab';
import Dashboard from './components/Dashboard';
import { RootStackParamList } from '../../Navigation/types';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { apiService } from 'src/services';
import AdvancedFilterModal, { AdvancedFilters } from '@components/AdvancedFilterModal';
import { RefreshControl } from 'react-native';


export interface Patient {
  id: number;
  ParticipantId: number;
  studyId: number;
  age: number;
  status: string;
  gender: string;
  cancerType: string;
  stage: string;
  name?: string;
  weightKg?: number;
  groupType?: string;
  CriteriaStatus?: string;
  GroupTypeNumber?: string;
  PhoneNumber?:string;
}

interface ParticipantRequest {
  CriteriaStatus?: string;
  GroupType?: string;
  Gender?: string;
  ParticipantId?: string;
  StudyId?: string;
  AgeFrom?: number;
  AgeTo?: number;
  SearchString?: string;
  CancerDiagnosis?: string;
  StageOfCancer?: string;
  [key: string]: unknown;
}

interface ParticipantApiResponse {
  ResponseData: Array<{
    ParticipantId: number;
    Age: number;
    StudyId: string;
    GroupType: string;
    GroupTypeNumber: string;
    Gender: string;
    CriteriaStatus: string;
    PhoneNumber: string;
    CreatedDate: string;
    ModifiedDate: string;
    Status: number;
    [key: string]: unknown;
  }>;
}

export default function ParticipantAssessmentSplit() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [participants, setParticipants] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selId, setSelId] = useState<number | null>(null); // holds ParticipantId
  const [tab, setTab] = useState('assessment');
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const hasLoadedDataRef = useRef<boolean>(false);
  const [newlyAddedParticipantId, setNewlyAddedParticipantId] = useState<string | null>(null);

  const [searchText, setSearchText] = useState('');
  const [appliedSearchText, setAppliedSearchText] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('All');

  const [ageRangeError, setAgeRangeError] = useState<string>('');

  // Advanced filter state
  const [advFilters, setAdvFilters] = useState<AdvancedFilters>({
    criteriaStatus: '',
    gender: '',
    ageFrom: '',
    ageTo: '',
    groupType: '',
    cancerDiagnosis: '',     // new
    stageOfCancer: '',
  });

  const SELECTED_PARTICIPANT_KEY = 'selectedParticipantId';
  const SELECTED_TAB_KEY = 'selectedTab';


  // Advanced filter handlers
  const handleCriteriaStatusChange = (status: string) => {
    setAdvFilters(prev => ({ ...prev, criteriaStatus: prev.criteriaStatus === status ? '' : status }));
  };

  const handleGenderChange = (gender: string) => {
    setAdvFilters(prev => ({ ...prev, gender }));
  };

  const handleGroupTypeChange = (groupType: string) => {
    setAdvFilters(prev => ({ ...prev, groupType }));
  };

  const handleAgeChange = (field: 'ageFrom' | 'ageTo', value: string) => {
    if (/^\d{0,3}$/.test(value)) {
      setAdvFilters(prev => ({ ...prev, [field]: value }));
      // Clear age validation error as user types
      if (ageRangeError) {
        setAgeRangeError('');
      }
    }
  };

  const handleCancerDiagnosisChange = (value: string) => {
    setAdvFilters(prev => ({ ...prev, cancerDiagnosis: value }));
  };
  const handleStageOfCancerChange = (value: string) => {
    setAdvFilters(prev => ({ ...prev, stageOfCancer: value }));
  };


  const handleClearFilters = () => {
    setAdvFilters({
      criteriaStatus: '',
      gender: '',
      ageFrom: '',
      ageTo: '',
      groupType: '',
      cancerDiagnosis: '',
      stageOfCancer: '',
    });
    setSearchText('');
    setAppliedSearchText('');
    setSelectedGroupFilter('All');
  };

  const [didResetFilters, setDidResetFilters] = useState(false);


  const onFiltersReset = () => {
    setDidResetFilters(true);
  };

  useEffect(() => {
    if (didResetFilters) {
      fetchParticipants('');
      setDidResetFilters(false);
    }
  }, [didResetFilters]);


  useFocusEffect(
    useCallback(() => {
      const refreshParticipants = async () => {
        // Check if we need to force refresh
        const forceRefresh = await AsyncStorage.getItem('forceRefreshParticipants');
        console.log('🔄 Force refresh flag:', forceRefresh);
        
        const fetchedParticipants = await fetchParticipants(appliedSearchText);
        
        // Check for newly added participant
        const newlyAdded = await AsyncStorage.getItem('newlyAddedParticipantId');
        if (newlyAdded) {
          console.log('🆕 Found newly added participant ID:', newlyAdded);
          setNewlyAddedParticipantId(newlyAdded);
          
          // Convert to number for comparison
          const numericId = parseInt(newlyAdded, 10);
          if (!isNaN(numericId)) {
            // Verify the participant exists in the fetched list
            const participantExists = fetchedParticipants.some(p => p.ParticipantId === numericId);
            console.log('🔍 Participant exists in list:', participantExists);
            
            if (participantExists) {
              setSelId(numericId);
              await saveSelectedParticipant(numericId);
              console.log('✅ Participant selected and saved');
            } else if (forceRefresh) {
              // If participant doesn't exist but we have force refresh, try again after a delay
              console.log('⏳ Participant not found, retrying in 2 seconds...');
              setTimeout(async () => {
                const retryParticipants = await fetchParticipants(appliedSearchText);
                const retryExists = retryParticipants.some(p => p.ParticipantId === numericId);
                if (retryExists) {
                  setSelId(numericId);
                  await saveSelectedParticipant(numericId);
                  console.log('✅ Participant found on retry');
                }
              }, 2000);
            }
          }
          
          // Clear the flags after 5 seconds
          setTimeout(async () => {
            setNewlyAddedParticipantId(null);
            await AsyncStorage.removeItem('newlyAddedParticipantId');
            await AsyncStorage.removeItem('forceRefreshParticipants');
            console.log('🧹 Cleared refresh flags');
          }, 5000);
        }
      };
      refreshParticipants();
    }, [appliedSearchText])
  );

  useEffect(() => {
    const loadData = async () => {
      if (!hasLoadedDataRef.current) {
        hasLoadedDataRef.current = true;

        //  Load saved participant from AsyncStorage
        const savedParticipantId = await loadSelectedParticipant();
        const savedTab = await loadSelectedTab();

        //  Fetch participants
        const fetchedParticipants = await fetchParticipants('');

        //  Restore saved selection if it exists in fetched list
        if (savedParticipantId !== null && fetchedParticipants.some(p => p.ParticipantId === savedParticipantId)) {
          setSelId(savedParticipantId);
        } else if (fetchedParticipants.length > 0) {
          setSelId(fetchedParticipants[0].ParticipantId);
          await saveSelectedParticipant(fetchedParticipants[0].ParticipantId);
        }

        //  Restore tab
        setTab(savedTab);
      }
    };

    loadData();
  }, []);


  // const handleAdvancedDone = async () => {
  //   if (!validateAgeRange()) {
  //     return; 
  //   }
  //   setShowAdvancedSearch(false);
  //   await fetchParticipants(appliedSearchText);
  // };

  const handleAdvancedDone = async () => {
    if (!validateAgeRange()) {
      return;
    }

    setSearchText('');
    setAppliedSearchText('');
    setSelectedGroupFilter('All');
    setShowAdvancedSearch(false);
    await fetchParticipants('');
  };


  // Save selected participant ID to AsyncStorage
  const saveSelectedParticipant = async (participantId: number | null) => {
    try {
      if (participantId !== null) {
        await AsyncStorage.setItem(SELECTED_PARTICIPANT_KEY, participantId.toString());
      } else {
        await AsyncStorage.removeItem(SELECTED_PARTICIPANT_KEY);
      }
    } catch (error) {
      console.error('Error saving selected participant:', error);
    }
  };

  // Load selected participant ID from AsyncStorage
  const loadSelectedParticipant = async () => {
    try {
      const savedParticipantId = await AsyncStorage.getItem(SELECTED_PARTICIPANT_KEY);
      if (savedParticipantId) {
        return parseInt(savedParticipantId, 10);
      }
    } catch (error) {
      console.error('Error loading selected participant:', error);
    }
    return null;
  };

  // Save selected tab to AsyncStorage
  const saveSelectedTab = async (tabName: string) => {
    try {
      await AsyncStorage.setItem(SELECTED_TAB_KEY, tabName);
    } catch (error) {
      console.error('Error saving selected tab:', error);
    }
  };

  // Load selected tab from AsyncStorage
  const loadSelectedTab = async () => {
    try {
      const savedTab = await AsyncStorage.getItem(SELECTED_TAB_KEY);
      return savedTab || 'assessment';
    } catch (error) {
      console.error('Error loading selected tab:', error);
      return 'assessment';
    }
  };

  const CANCER_DIAGNOSES = ['ovarian', 'lungs', 'breast', 'defuse Large B cell Lymphoma',];
  const STAGES = ['i', 'ii', 'iii', 'iv'];


  // Enhanced fetch function with advanced filters updated for CriteriaStatus
  const fetchParticipants = async (search: string = '') => {
    try {
      setLoading(true);
      const trimmedSearch = search.trim().toLowerCase();
      const requestBody: ParticipantRequest = {};

      if (advFilters.criteriaStatus) {
        requestBody.CriteriaStatus = advFilters.criteriaStatus;
      }
      if (advFilters.groupType) {
        requestBody.GroupType = advFilters.groupType;
      }
      if (advFilters.gender) {
        requestBody.Gender = advFilters.gender;
      }
      if (advFilters.cancerDiagnosis?.trim()) {
        requestBody.CancerDiagnosis = advFilters.cancerDiagnosis.trim();
      }
      if (advFilters.stageOfCancer?.trim()) {
        requestBody.StageOfCancer = advFilters.stageOfCancer.trim();
      }
      const ageFromNum = Number(advFilters.ageFrom);
      if (!isNaN(ageFromNum) && advFilters.ageFrom !== '') {
        requestBody.AgeFrom = ageFromNum;
      }
      const ageToNum = Number(advFilters.ageTo);
      if (!isNaN(ageToNum) && advFilters.ageTo !== '') {
        requestBody.AgeTo = ageToNum;
      }
      const searchCap = trimmedSearch.charAt(0).toUpperCase() + trimmedSearch.slice(1);

      if (trimmedSearch !== '') {
        if ((trimmedSearch === 'male' || trimmedSearch === 'female') && !advFilters.gender) {
          requestBody.Gender = trimmedSearch.charAt(0).toUpperCase() + trimmedSearch.slice(1);
        }
        else if ((trimmedSearch === 'included' || trimmedSearch === 'excluded') && !advFilters.criteriaStatus) {
          requestBody.CriteriaStatus = searchCap;
        }
        // GroupType
        else if ((trimmedSearch === 'study' || trimmedSearch === 'controlled') && !advFilters.groupType) {
          requestBody.GroupType = searchCap;
        }
        else if (CANCER_DIAGNOSES.includes(trimmedSearch) && !advFilters.cancerDiagnosis) {
          requestBody.CancerDiagnosis = searchCap;
        }
        else if (STAGES.includes(trimmedSearch.toLowerCase()) && !advFilters.stageOfCancer) {
          requestBody.StageOfCancer = trimmedSearch.toUpperCase();
        }

        else if (/^pid-\d+$/i.test(trimmedSearch)) {
          requestBody.SearchString = trimmedSearch.toUpperCase();
        }
        else if (/^\d+$/i.test(trimmedSearch)) {
          requestBody.SearchString = `PID-${trimmedSearch}`;
        }
        else if (
          !isNaN(Number(trimmedSearch)) &&
          Number(trimmedSearch) >= 1 &&
          Number(trimmedSearch) <= 120 &&
          !advFilters.ageFrom &&
          !advFilters.ageTo
        ) {
          requestBody.AgeFrom = Number(trimmedSearch);
          requestBody.AgeTo = Number(trimmedSearch);
        }
        else {
          requestBody.SearchString = trimmedSearch;
        }
      }

      Object.keys(requestBody).forEach(key => {
        const val = requestBody[key];
        if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) {
          delete requestBody[key];
        }
      });
      const response = await apiService.post<ParticipantApiResponse>(
        "/GetParticipantsPaginationFilterSearch",
        requestBody
      );
      if (response.data?.ResponseData) {
        const parsed: Patient[] = response.data.ResponseData.map((item) => {
          const patient = {
            id: item.ParticipantId,
            ParticipantId: item.ParticipantId,
            studyId: item.StudyId,
            age: Number(item.Age) || 0,
            status: item.CriteriaStatus?.toLowerCase() || "pending",
            gender: ["Male", "Female", "Other"].includes(item.Gender) ? item.Gender : "Unknown",
            cancerType: item.CancerDiagnosis || "N/A",
            stage: item.StageOfCancer || "N/A",
            name: item.Name ?? undefined,
            groupType: item.GroupType || null,
            CriteriaStatus: item.CriteriaStatus || null,
            GroupTypeNumber:item.GroupTypeNumber || null,
            PhoneNumber:item.PhoneNumber || null
          };
          
          // Debug logging for specific participants
          if (item.ParticipantId === 231) {
            console.log("ParticipantAssessmentSplit - PID-231 data:", {
              ParticipantId: item.ParticipantId,
              GroupType: item.GroupType,
              GroupTypeType: typeof item.GroupType,
              GroupTypeLength: item.GroupType?.length,
              GroupTypeTrimmed: item.GroupType?.trim(),
              CriteriaStatus: item.CriteriaStatus,
              mappedGroupType: patient.groupType,
              mappedGroupTypeType: typeof patient.groupType
            });
          }
          
          return patient;
        });
        setParticipants(parsed);
        // if (selId === null && parsed.length > 0) {
        //   setSelId(parsed[0].ParticipantId);
        //   await saveSelectedParticipant(parsed[0].ParticipantId);
        // } else if (selId !== null) {
        //   const existsSelected = parsed.some(p => p.ParticipantId === selId);
        //   if (!existsSelected && parsed.length > 0) {
        //     setSelId(parsed[0].ParticipantId);
        //     await saveSelectedParticipant(parsed[0].ParticipantId);
        //   }
        // }
        return parsed;
      }
      setParticipants([]);
      setSelId(null);
      return [];
    } catch (error) {
      console.error("Failed to fetch participants:", error);
      setParticipants([]);
      setSelId(null);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const validateAgeRange = (): boolean => {
    const fromFilled = advFilters.ageFrom.trim() !== '';
    const toFilled = advFilters.ageTo.trim() !== '';

    if ((fromFilled && !toFilled) || (!fromFilled && toFilled)) {
      setAgeRangeError('Both "From" and "To" age fields are required');
      return false;
    }

    // Optional: additional validation like from <= to
    if (fromFilled && toFilled) {
      const fromNum = Number(advFilters.ageFrom);
      const toNum = Number(advFilters.ageTo);
      if (fromNum > toNum) {
        setAgeRangeError('"From" age must be less than or equal to "To" age.');
        return false;
      }
    }

    setAgeRangeError('');
    return true;
  };


  // Client-side filter function
  const filterParticipants = (list: Patient[], query: string, groupFilter: string = 'All') => {
    let filtered = list;

    // Apply group filter first
    if (groupFilter !== 'All') {
      filtered = list.filter(p => {
        if (groupFilter === 'Study') return p.groupType === 'Study';
        if (groupFilter === 'Controlled') return p.groupType === 'Controlled';
        if (groupFilter === 'Unassign') return p.groupType === null || p.groupType === undefined || p.groupType === '' || p.groupType === 'None';

        return true;
      });
    }

    // Then apply search query
    const q = query.trim().toLowerCase();
    if (!q) return filtered;
    return filtered.filter(p => {
      const pidStr = p.ParticipantId.toString().toLowerCase();
      const genderStr = p.gender.toLowerCase();
      const cancerTypeStr = p.cancerType.toLowerCase();
      const nameStr = p.name?.toLowerCase() || '';
      const criteriaStatusStr = (p.CriteriaStatus || '').toLowerCase();
      const groupTypeStr = (p.groupType || '').toLowerCase();
      const cancerDiagnosisStr = p.cancerType?.toLowerCase() || '';
      const stageOfCancerStr = p.stage?.toLowerCase() || '';

      return (
        pidStr.includes(q) ||
        genderStr.includes(q) ||
        cancerTypeStr.includes(q) ||
        nameStr.includes(q) ||
        criteriaStatusStr.includes(q) ||
        cancerDiagnosisStr.includes(q) ||
        stageOfCancerStr.includes(q) ||
        groupTypeStr.includes(q)

      );
    });
  };

  // Load data once on mount
  useEffect(() => {
    const loadData = async () => {
      if (!hasLoadedDataRef.current) {
        const fetchedParticipants = await fetchParticipants('');
        hasLoadedDataRef.current = true;
        const savedParticipantId = await loadSelectedParticipant();
        const savedTab = await loadSelectedTab();
        if (savedParticipantId !== null && fetchedParticipants.length > 0) {
          const participantExists = fetchedParticipants.some(p => p.ParticipantId === savedParticipantId);
          if (participantExists) {
            setSelId(savedParticipantId);
          } else {
            setSelId(fetchedParticipants[0].ParticipantId);
            await saveSelectedParticipant(fetchedParticipants[0].ParticipantId);
          }
        } else if (fetchedParticipants.length > 0) {
          setSelId(fetchedParticipants[0].ParticipantId);
          await saveSelectedParticipant(fetchedParticipants[0].ParticipantId);
        }
        setTab(savedTab);
      }
    };
    loadData();
  }, []);

  // Restore selection when screen comes into focus (but don't reload data)
  useFocusEffect(
    useCallback(() => {
      const restoreTab = async () => {
        const savedTab = await loadSelectedTab();
        setTab(savedTab);
      };
      restoreTab();
    }, [])
  );

  const sel = participants.find((p) => p.ParticipantId === selId);


  // Save selected participant when it changes
  useEffect(() => {
    if (selId !== null) {
      saveSelectedParticipant(selId);

      if ((tab === ' VR' || tab === 'orie') && sel?.groupType !== 'Study') {
        setTab('assessment');
      }

      if (tab === 'assessment' && sel?.groupType === null) {
        setTab('dash');
      }
    }
  }, [selId, sel?.groupType, tab]);

  // Manual refresh function for pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchParticipants(searchText);
      setLastRefreshTime(new Date());
    } finally {
      setRefreshing(false);
    }
  }, [searchText]);

  // Save selected tab when it changes
  useEffect(() => {
    saveSelectedTab(tab);
  }, [tab]);

  // Function to apply search filter when user clicks search or submits input
  const handleApplySearch = () => {
    setAppliedSearchText(searchText.trim());
    fetchParticipants(searchText.trim());
  };

  // Effect to clear filters when search is cleared by user typing empty string
  useEffect(() => {
    if (searchText === '') {
      handleClearFilters();
      setAppliedSearchText('');
    }
  }, [searchText]);

  const filteredParticipants = filterParticipants(participants, appliedSearchText, selectedGroupFilter);

  // Calculate group counts
  const groupCounts = {
    All: participants.length,
    Study: participants.filter(p => p.groupType === 'Study').length,
    Controlled: participants.filter(p => p.groupType === 'Controlled').length,
    Unassign: participants.filter(p => p.groupType === null || p.groupType === undefined || p.groupType === '' || p.groupType === 'None').length,
  };

  // Debug logging for GroupType
  if (sel) {
  }

  const renderTabContent = () => {
    const patientId = sel?.ParticipantId || 0;
    const studyId = sel?.studyId || 0
    const age = sel?.age ?? 0;
    const RandomizationId = sel?.GroupTypeNumber;
    const Gender = sel?.gender;
    const PhoneNumber= sel?.PhoneNumber

    switch (tab) {
      case 'dash':
        return <Dashboard patientId={patientId} age={age} studyId={studyId} />;
      case 'info':
        return <ParticipantInfo patientId={patientId} age={age} studyId={studyId} />;
      case 'orie':
        return <OrientationTab patientId={patientId} age={age} studyId={studyId} />;
      case 'assessment':
        return <AssessmentTab patientId={patientId} age={age} studyId={studyId} groupType={sel?.groupType} />;
      case 'vr':
        return <VRSessionsList patientId={patientId} age={age} studyId={studyId} RandomizationId ={RandomizationId} Gender={Gender} phoneNumber={PhoneNumber}/>;
      case 'notification':
        return null;
      default:
        return <AssessmentTab patientId={patientId} age={age} studyId={studyId} groupType={sel?.groupType} />;
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row flex-1">
        {/* Left Pane - Participant List */}
        <View className="w-80 border-r border-[#e6eeeb] bg-[#F6F7F7]">
          <View className="px-4 pt-4 pb-2">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2">
                <Text className="font-extrabold">Participant List</Text>

                <Image source={require("../../../assets/patientList.png")} />
              </View>

              <TouchableOpacity
                onPress={onRefresh}
                className="p-2 rounded-lg bg-gray-100"
                disabled={refreshing}
              >
                <MaterialCommunityIcons
                  name="refresh"
                  size={20}
                  color={refreshing ? "#999" : "#0ea06c"}
                />
              </TouchableOpacity>

            </View>
            <Text className="text-sm text-[#6b7a77]">
              List of Participants ({participants.length})
              {lastRefreshTime && (
                <Text className="text-[#999]">
                  {' • Last updated: ' + lastRefreshTime.toLocaleTimeString()}
                </Text>
              )}
            </Text>
            <View className="flex-row items-center space-x-2 mt-3">
              {/* Search Bar */}
              <View className="flex-row items-center bg-white border border-[#e6eeeb] rounded-2xl px-4 py-3 flex-1">
                <TextInput
                  placeholder="Search by Patient ID,Cancer type,Gender,Group,status,stage"
                  value={searchText}
                  onChangeText={(val: any) => {
                    setSearchText(val);
                    // Clearing handled by useEffect on searchText above
                  }}
                  onSubmitEditing={handleApplySearch}
                  className="flex-1 text-base text-gray-700"
                  placeholderTextColor="#999"
                  style={{
                    fontSize: 16,
                    backgroundColor: '#f8f9fa',
                    borderRadius: 16,
                  }}
                />
                <Pressable onPress={handleApplySearch}>
                  <EvilIcons name="search" size={24} color="#21c57e" />
                </Pressable>
              </View>
              {/* Filter Icon */}
              <TouchableOpacity onPress={() => setShowAdvancedSearch(true)}>
                <MaterialCommunityIcons name="tune" size={24} color="black" />
              </TouchableOpacity>
            </View>

            {/* Group Filter Buttons - 2x2 Grid */}
            <View className="mt-3">
              <View className="flex-row justify-between mb-2">
                <Pressable
                  onPress={() => setSelectedGroupFilter('All')}
                  className={`flex-1 mx-1 py-1.5 px-3 rounded-lg border ${selectedGroupFilter === 'All'
                      ? 'bg-green-600 border-green-600'
                      : 'bg-white border-gray-300'
                    }`}
                >
                  <Text
                    className={`text-center text-sm font-medium ${selectedGroupFilter === 'All'
                        ? 'text-white'
                        : 'text-gray-700'
                      }`}
                  >
                    All ({groupCounts.All})
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setSelectedGroupFilter('Study')}
                  className={`flex-1 mx-1 py-1.5 px-3 rounded-lg border ${selectedGroupFilter === 'Study'
                      ? 'bg-green-600 border-green-600'
                      : 'bg-[#EBF6D6] border-[#EBF6D6]'
                    }`}
                >
                  <Text
                    className={`text-center text-sm font-medium ${selectedGroupFilter === 'Study'
                        ? 'text-white'
                        : 'text-gray-700'
                      }`}
                  >
                    Study ({groupCounts.Study})
                  </Text>
                </Pressable>
              </View>
              <View className="flex-row justify-between">
                <Pressable
                  onPress={() => setSelectedGroupFilter('Controlled')}
                  className={`flex-1 mx-1 py-1.5 px-3 rounded-lg border ${selectedGroupFilter === 'Controlled'
                      ? 'bg-green-600 border-green-600'
                      : 'bg-[#FFE8DA] border-[#FFE8DA]'
                    }`}
                >
                  <Text
                    className={`text-center text-sm font-medium ${selectedGroupFilter === 'Controlled'
                        ? 'text-white'
                        : 'text-gray-700'
                      }`}
                  >
                    Controlled ({groupCounts.Controlled})
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setSelectedGroupFilter('Unassign')}
                  className={`flex-1 mx-1 py-1.5 px-3 rounded-lg border ${selectedGroupFilter === 'Unassign'
                      ? 'bg-green-600 border-green-600'
                      : 'bg-[#D2EBF8] border-[#D2EBF8]'
                    }`}
                >
                  <Text
                    className={`text-center text-sm font-medium ${selectedGroupFilter === 'Unassign'
                        ? 'text-white'
                        : 'text-gray-700'
                      }`}
                  >
                    Unassign ({groupCounts.Unassign})
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Advanced Filter Modal */}
            <AdvancedFilterModal
              visible={showAdvancedSearch}
              onClose={handleAdvancedDone}
              filters={advFilters}
              onCriteriaStatusChange={handleCriteriaStatusChange}
              onGenderChange={handleGenderChange}
              onAgeChange={handleAgeChange}
              onGroupTypeChange={handleGroupTypeChange}
              onCancerDiagnosisChange={handleCancerDiagnosisChange}   // new
              onStageOfCancerChange={handleStageOfCancerChange}
              onClearFilters={handleClearFilters}
              onFiltersReset={onFiltersReset}
              ageRangeError={ageRangeError}
            />
            {/* Add Participant Button */}
            <Pressable
              onPress={() => {
                console.log("PatientAssessmentSplit - Add Participant button pressed");
                setShowOrderModal(true);
              }}
              className="mt-3 bg-[#0ea06c] rounded-xl py-3 px-4 items-center"
            >
              <Text className="text-white font-semibold text-base">
                <Text className="text-white">➕</Text> Add Participant
              </Text>
            </Pressable>
          </View>
          <ScrollView className="p-3"
            style={{ maxHeight: '70%' }}
            contentContainerStyle={{ paddingBottom: 10 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#0ea06c']}
                tintColor="#0ea06c"
              />
            }
          >
            {loading ? (
              <ActivityIndicator color="#0ea06c" />
            ) : filteredParticipants.length > 0 ? (
              filteredParticipants.map((p) => {
                // Compare numeric IDs
                const isNewlyAdded = newlyAddedParticipantId !== null && 
                                     parseInt(newlyAddedParticipantId, 10) === p.ParticipantId;
                return (
                  <ListItem
                    key={p.ParticipantId}
                    item={{
                      ...p,
                      ParticipantId: `${p.ParticipantId}`,
                      status: p.status as 'ok' | 'pending' | 'alert',
                      gender: p.gender as 'Male' | 'Female' | 'Other',
                      groupType: p.groupType,
                      CriteriaStatus: p.CriteriaStatus
                    }}
                    selected={p.ParticipantId === selId}
                    onPress={() => setSelId(p.ParticipantId)}
                    isNewlyAdded={isNewlyAdded}
                  />
                );
              })
            ) : (
              <View className="flex-1 justify-center items-center mt-10">
                <Text className="text-gray-500 text-lg">Patient not found</Text>
              </View>
            )}
          </ScrollView>
        </View>
        {/* Right Pane - Participant Details */}
        <View className="flex-1">
          <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
            <View>
              <Text className="font-extrabold">
                {sel?.name ?? `Participant ${sel?.ParticipantId ?? ''}`}
              </Text>
              <Text className="text-xs text-[#6b7a77] py-1">
                Participant setup {sel?.age ? `• Age ${sel.age}` : ''}
              </Text>
            </View>
            <View className="w-10 h-10 rounded-xl bg-white border border-[#e6eeeb] items-center justify-center">
              <Text>⋯</Text>
            </View>
          </View>
          <View className="px-6">
            {(() => {
              console.log("ParticipantAssessmentSplit - Selected participant:", sel?.ParticipantId, "GroupType:", sel?.groupType, "GroupType type:", typeof sel?.groupType);
              console.log("ParticipantAssessmentSplit - Full selected participant object:", sel);
              
              // Check each condition explicitly - Excluded participants should not see Study-specific tabs
              const shouldShowOrientation = sel?.groupType === 'Study' && sel?.CriteriaStatus === 'Included';
              const shouldShowAssessment = sel?.groupType !== null && sel?.CriteriaStatus === 'Included';
              const shouldShowVRSession = sel?.groupType === 'Study' && sel?.CriteriaStatus === 'Included';
              
              console.log("ParticipantAssessmentSplit - Tab visibility conditions:", {
                shouldShowOrientation,
                shouldShowAssessment, 
                shouldShowVRSession,
                groupTypeEqualsStudy: sel?.groupType === 'Study',
                groupTypeNotEqualsNull: sel?.groupType !== null,
                criteriaStatusEqualsIncluded: sel?.CriteriaStatus === 'Included',
                groupTypeValue: sel?.groupType,
                groupTypeType: typeof sel?.groupType,
                criteriaStatusValue: sel?.CriteriaStatus,
                criteriaStatusType: typeof sel?.CriteriaStatus,
                groupTypeLength: sel?.groupType?.length,
                groupTypeTrimmed: sel?.groupType?.trim()
              });
              
              const tabs = [
                { key: 'dash', label: 'Dashboard' },
                { key: 'info', label: 'Enrollment' },
                // Only show Orientation tab if participant is in "Study" group
                ...(shouldShowOrientation ? [{ key: 'orie', label: 'Orientation' }] : []),
                // Only show Assessment tab if participant is not null (Study or Controlled)
                ...(shouldShowAssessment ? [{ key: 'assessment', label: 'Assessment' }] : []),
                // Only show VR Session tab if participant is in "Study" group
                ...(shouldShowVRSession ? [{ key: 'vr', label: 'VR Session' }] : []),
                { key: 'notification', label: 'Notification' },
              ];
              console.log("ParticipantAssessmentSplit - Generated tabs:", tabs.map(t => t.key));


              return (
                <TabPills
                  tabs={tabs}
                  active={tab}
                  onChange={setTab}
                />
              );
            })()}
          </View>

          {renderTabContent()}
        </View>
      </View>

      {/* Order Instructions Modal */}
      <Modal
        visible={showOrderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOrderModal(false)}
      >
        <View className="flex-1 justify-center items-center p-5">
          <View className="w-full max-w-[23rem] bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-green-200">
            {/* Header */}
            <View className="pt-6 px-6 pb-4 border-b border-green-300 flex-row justify-between items-center">
              <Text className="text-lg font-bold text-gray-900">
                Complete Sections in Following Order
              </Text>
              {/* Close button */}
              <TouchableOpacity
                onPress={() => setShowOrderModal(false)}
              >
                <Text className="text-2xl text-red-500 font-bold">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Body */}
            <View className="px-6 py-6 space-y-3">
              <View className="flex-row items-center">
                <View className="w-6 h-6 bg-red-500 rounded-full mr-3 items-center justify-center">
                  <Text className="text-white text-xs font-bold">1</Text>
                </View>
                <Text className="flex-1 text-gray-800">
                  <Text className="font-semibold text-red-600">Socio demographic form</Text> (mandatory)
                </Text>
              </View>

              <View className="flex-row items-center">
                <View className="w-6 h-6 bg-blue-500 rounded-full mr-3 items-center justify-center">
                  <Text className="text-white text-xs font-bold">2</Text>
                </View>
                <Text className="flex-1 text-gray-800">
                  <Text className="font-semibold">Screening form</Text>
                </Text>
              </View>

              <View className="flex-row items-center">
                <View className="w-6 h-6 bg-gray-400 rounded-full mr-3 items-center justify-center">
                  <Text className="text-white text-xs font-bold">3</Text>
                </View>
                <Text className="flex-1 text-gray-800">
                  <Text className="font-semibold">Informed consent</Text> (optional)
                </Text>
              </View>

              <View className="flex-row items-center">
                <View className="w-6 h-6 bg-purple-500 rounded-full mr-3 items-center justify-center">
                  <Text className="text-white text-xs font-bold">4</Text>
                </View>
                <Text className="flex-1 text-gray-800">
                  <Text className="font-semibold">Group assignment</Text>
                </Text>
              </View>

              <View className="flex-row items-center">
                <View className="w-6 h-6 bg-green-500 rounded-full mr-3 items-center justify-center">
                  <Text className="text-white text-xs font-bold">5</Text>
                </View>
                <Text className="flex-1 text-gray-800">
                  <Text className="font-semibold">Go to Orientation section</Text> for Experimental group
                </Text>
              </View>
            </View>

            {/* Footer */}
            <View className="px-6 pb-6">
              <TouchableOpacity
                onPress={() => {
                  setShowOrderModal(false);
                  navigation.navigate('SocioDemographic', {
                    // patientId: Date.now(),
                    // age: age
                  });
                }}
                className="bg-green-600 py-3 px-4 rounded-xl items-center"
              >
                <Text className="text-white font-semibold text-base">
                  Continue to Socio Demographics
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}