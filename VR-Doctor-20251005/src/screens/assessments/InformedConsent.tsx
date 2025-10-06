import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  TouchableOpacity,
} from 'react-native';
// @ts-ignore - TypeScript declaration issue with react-native exports
import { KeyboardAvoidingView, Platform } from 'react-native';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../Navigation/types';
import BottomBar from '../../components/BottomBar';
import { Btn } from '../../components/Button';
import FormCard from '../../components/FormCard';
import { apiService } from 'src/services';
import Toast from 'react-native-toast-message';
import { UserContext } from 'src/store/context/UserContext';
import { formatDate } from 'src/utils/formUtils';
import { formatDateDDMMYYYY } from 'src/utils/date';
import DateField from '@components/DateField';
import SignatureModal from '@components/SignatureModal';
import { useAuth } from 'src/hooks/useAuth';

/* ---------------------- Types ---------------------- */

interface InformedConsentFormProps {
  patientId?: number;
  age?: number;
  studyId?: number;
}

interface setInformedConsent {
  ICMID: string;
  StudyId: string;
  QuestionName: string;
  SortKey: number;
  Status: number;
}

/* ---------------------- Helpers ---------------------- */

// stringify
const asStr = (v: any) => (v == null ? '' : String(v));

/** Make sure something is a data URI (UI + POST friendly). */
const ensureDataUri = (rawOrUri?: string) => {
  if (!rawOrUri) return '';
  return rawOrUri.startsWith('data:image') ? rawOrUri : `data:image/png;base64,${rawOrUri}`;
};

/** Safely return a data-uri for POST (matches your working payload). */
const signatureForPost = (maybeRawOrUri?: string) => ensureDataUri(maybeRawOrUri);

/** Quick DD/MM/YYYY today */
const getCurrentDateString = () => {
  const today = new Date();
  const d = String(today.getDate()).padStart(2, '0');
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const y = today.getFullYear();
  return `${d}/${m}/${y}`;
};

export default function InformedConsentForm({}: InformedConsentFormProps) {
  console.log('🚀 InformedConsentForm component mounted');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'InformedConsent'>>();
  const { patientId, age, studyId } = route.params as { patientId: number; age: number; studyId: number };
  const { isAuthenticated, isTokenValid } = useAuth();
  
  console.log('🔍 InformedConsentForm params:', { patientId, age, studyId });
  console.log('🔐 Auth status:', { isAuthenticated, isTokenValid: isTokenValid() });
  console.log('🔍 Current informedConsent state:', informedConsent);
  console.log('🔍 isLoadingQuestions:', isLoadingQuestions);
  console.log('🔍 Initial PICDID state:', PICDID);

  /* ---------------------- Study Details ---------------------- */
  const [studyTitle, setStudyTitle] = useState(
    'An exploratory study to assess the effectiveness of Virtual Reality assisted Guided Imagery on QoL of cancer patients undergoing chemo-radiation treatment'
  );
  const [studyNumber, setStudyNumber] = useState<string | number>(studyId ?? '');

  /* ------------------ Participant Information ---------------- */
  const [ageInput, setAgeInput] = useState(age ? String(age) : '');
  const { userId } = useContext(UserContext);
  const [PICDID, setPICDID] = useState<string | null>(null);

  // signatures (data URIs for UI)
  const [subjectSignaturePad, setSubjectSignaturePad] = useState('');
  const [coPISignaturePad, setCoPISignaturePad] = useState('');
  const [witnessSignaturePad, setWitnessSignaturePad] = useState('');

  const [informedConsent, setInformedConsent] = useState<setInformedConsent[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
  const [acks, setAcks] = useState<Record<string, boolean>>({});
  const [agree, setAgree] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  /* ---------------------- Signatures ------------------------- */
  const [signatures, setSignatures] = useState({
    subjectName: '',
    subjectDate: getCurrentDateString(),
    coPIName: '',
    coPIDate: getCurrentDateString(),
    investigatorName: '',
    witnessName: '',
    witnessDate: getCurrentDateString(),
  });

  const setSig = (k: keyof typeof signatures, v: string) => setSignatures((p) => ({ ...p, [k]: v }));

  const toggleAck = (id: string) => setAcks((prev) => ({ ...prev, [id]: !prev[id] }));

  /* ---------------------- Load Masters ---------------------- */
  useEffect(() => {
    const fetchMasterData = async () => {
      if (!patientId) {
        console.log('⚠️ No patientId available, skipping consent questions fetch');
        return;
      }

      setIsLoadingQuestions(true);
      try {
        const API_BASE_URL = 'https://dev.3framesailabs.com:8060/api';
        const fullUrl = `${API_BASE_URL}/GetInformedConsentMaster`;
        
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySUQiOiJVSUQtOSIsIkVtYWlsIjoic2VudGhpbEBvamFza2EuY29tIiwiUm9sZUlkIjoiUkwtMDAwMSIsIlJvbGVOYW1lIjoiQWRtaW5pc3RyYXRvciIsImlhdCI6MTc1OTY4NDUyMywiZXhwIjoxNzU5NzcwOTIzfQ.1UTh4V2PexWpwU30maQqYcn6-hCMSj9eAIWy6X6rcGg',
        };
        
        const payload = {
          ParticipantId: `PID-${patientId}`
        };
        
        console.log('📋 Fetching consent questions for:', payload);
        console.log('📋 API URL:', fullUrl);
        
        const response = await fetch(fullUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        
        console.log('📡 API Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ API Error Response:', errorText);
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('📦 Master data response:', data);
        console.log('📦 Response data structure:', JSON.stringify(data, null, 2));
        
        const questions = data.ResponseData || [];
        console.log('📦 Questions array:', questions);
        console.log('📦 Questions length:', questions.length);
        setInformedConsent(questions);
        console.log('✅ Master data loaded:', questions.length, 'items');
      } catch (err) {
        console.error('❌ Error loading master data:', err);
        console.error('❌ Error details:', {
          message: (err as any)?.message,
          stack: (err as any)?.stack,
        });
        
        // Fallback: Use mock data matching your API response structure
        console.log('🔄 Using fallback mock data for testing');
        const mockQuestions = [
          {
            ICMID: 'ICMID-1',
            StudyId: 'CS-0001',
            QuestionName: 'I have been explained the purpose and procedures of the study, and had the opportunity to ask questions.',
            SortKey: 1,
            Status: 1,
            CreatedBy: '0',
            CreatedDate: '2025-09-10 16:08:08',
            ModifiedBy: null,
            ModifiedDate: '2025-09-10 16:08:08'
          },
          {
            ICMID: 'ICMID-2',
            StudyId: 'CS-0001',
            QuestionName: 'I understand my participation is voluntary and I may withdraw at any time without affecting my care or legal rights.',
            SortKey: 2,
            Status: 1,
            CreatedBy: '0',
            CreatedDate: '2025-09-10 16:08:08',
            ModifiedBy: null,
            ModifiedDate: '2025-09-10 16:08:08'
          },
          {
            ICMID: 'ICMID-3',
            StudyId: 'CS-0001',
            QuestionName: 'I agree that the Sponsor, Ethics Committee, regulators, and authorized personnel may access my health records for the study; my identity will not be revealed in released information.',
            SortKey: 3,
            Status: 1,
            CreatedBy: '0',
            CreatedDate: '2025-09-10 16:08:08',
            ModifiedBy: null,
            ModifiedDate: '2025-09-10 16:08:08'
          },
          {
            ICMID: 'ICMID-4',
            StudyId: 'CS-0001',
            QuestionName: 'I understand my medical record information is essential to evaluate study results and will be kept confidential.',
            SortKey: 4,
            Status: 1,
            CreatedBy: '0',
            CreatedDate: '2025-09-10 16:08:08',
            ModifiedBy: null,
            ModifiedDate: '2025-09-10 16:08:08'
          }
        ];
        setInformedConsent(mockQuestions);
        
        // Show error to user
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load consent questions, using fallback data',
        });
      } finally {
        setIsLoadingQuestions(false);
      }
    };
    
    fetchMasterData();
  }, [patientId]);

  /* ---------------------- Participant basics ---------------------- */
  useFocusEffect(
    React.useCallback(() => {
      const fetchParticipantDetails = async () => {
        try {
          const response = await apiService.post('/GetParticipantDetails', { ParticipantId: patientId });
          const data = response.data.ResponseData;
          console.log('📦 Participant details response:', data);
          if (data) {
            setAgeInput(data.Age ? String(data.Age) : '');
            // If they store a signature in details, ensure it's usable in UI
            if (data.Signature) {
              console.log('🖊️ Found signature in participant details, length:', data.Signature.length);
              setSubjectSignaturePad(ensureDataUri(data.Signature));
            }
          }
          console.log('✅ Participant details loaded');
        } catch (err) {
          console.error('❌ Error loading participant details:', err);
          console.error('❌ Error details:', {
            message: (err as any)?.message,
            stack: (err as any)?.stack,
          });
          // Show error to user
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to load participant details',
          });
        }
      };
      if (patientId) fetchParticipantDetails();
    }, [patientId])
  );

  /* ---------------------- Acks cleanup ---------------------- */
  useEffect(() => {
    const allInitialed = informedConsent.every((item) => acks[item.ICMID]);
    if (allInitialed) {
      setErrors((prev) => {
        const { allInitialed, ...rest } = prev;
        return rest;
      });
    }
  }, [acks, informedConsent]);

  /* ---------------------- Validate ---------------------- */
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    const hasAnyInitialed = Object.keys(acks).length > 0 && Object.values(acks).some(Boolean);
    if (!hasAnyInitialed) newErrors.allInitialed = 'Please initial at least one required section';

    if (!agree) newErrors.agree = 'Please agree to the terms and conditions';

    if (!signatures.coPIName?.trim()) newErrors.coPIName = 'Co-PI name is required';
    if (!signatures.investigatorName?.trim()) newErrors.investigatorName = 'Study Investigator name is required';
    if (!signatures.witnessName?.trim()) newErrors.witnessName = 'Witness name is required';

    if (!signatures.coPIDate?.trim()) newErrors.coPIDate = 'Co-PI signature date is required';
    if (!signatures.witnessDate?.trim()) newErrors.witnessDate = 'Witness signature date is required';

    // If you want to force signatures present, uncomment:
    // if (!coPISignaturePad?.trim()) newErrors.coPISignaturePad = 'Co-PI signature is required';
    // if (!witnessSignaturePad?.trim()) newErrors.witnessSignaturePad = 'Witness signature is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill all required fields',
        position: 'top',
        topOffset: 50,
      });
      return false;
    }
    return true;
  };

  /* ---------------------- Clear ---------------------- */
  const handleClear = () => {
    setAcks({});
    setAgree(false);
    setSignatures({
      subjectName: '',
      subjectDate: getCurrentDateString(),
      coPIName: '',
      coPIDate: getCurrentDateString(),
      investigatorName: '',
      witnessName: '',
      witnessDate: getCurrentDateString(),
    });
    setSubjectSignaturePad('');
    setCoPISignaturePad('');
    setWitnessSignaturePad('');
    setPICDID(null);
    setErrors({});
  };

  /* ---------------------- Submit ---------------------- */
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const questionIds = Object.keys(acks).filter((qid) => acks[qid]);
      
      // Format ParticipantId to match API expectation (PID-XXX format)
      const formattedParticipantId = patientId.toString().startsWith('PID-') ? patientId.toString() : `PID-${patientId}`;
      
      const requestBody = {
        PICDID: PICDID || '', // Empty string for new records, PICDID value for updates
        StudyId: "CS-0001", // Fixed study ID as per API spec
        ParticipantId: formattedParticipantId,
        QuestionId: questionIds.join(','), // Comma-separated question IDs
        Response: 1,
        SubjectSignatoryName: signatures.subjectName || 'John Doe',
        // IMPORTANT: send with data-uri prefix (server expects this)
        SubjectSignature: signatureForPost(subjectSignaturePad),
        SubjectSignatureDate: formatDate(signatures.subjectDate) || '2024-09-10',
        CoPrincipalInvestigatorSignatoryName: signatures.coPIName || 'Dr. Sarah Smith',
        CoPrincipalInvestigatorSignature: signatureForPost(coPISignaturePad),
        CoPrincipalInvestigatorDate: formatDate(signatures.coPIDate) || '2024-09-10',
        StudyInvestigatorName: signatures.investigatorName || 'Dr. Michael Johnson',
        WitnessSignature: signatureForPost(witnessSignaturePad),
        WitnessName: signatures.witnessName || 'Jane Witness',
        WitnessDate: formatDate(signatures.witnessDate) || '2024-09-10',
        Status: 1,
        CreatedBy: asStr(userId),
      };

      // Debug previews
      console.log('🚀 Starting save/update process...');
      console.log('📋 Current PICDID:', PICDID);
      console.log('📋 PICDID type:', typeof PICDID);
      console.log('📋 PICDID length:', PICDID?.length);
      console.log('📋 Operation type:', PICDID ? 'UPDATE' : 'CREATE');
      console.log('📋 Formatted ParticipantId:', formattedParticipantId);
      console.log('📋 Question IDs:', questionIds);
      console.log('📋 Selected acknowledgments:', acks);
      console.log('📋 Request body PICDID field:', requestBody.PICDID);
      console.log('📋 Request body PICDID type:', typeof requestBody.PICDID);
      
      // Log signature sizes for debugging (backend will handle size limits)
      const subjectSigSize = requestBody.SubjectSignature?.length || 0;
      const coPISigSize = requestBody.CoPrincipalInvestigatorSignature?.length || 0;
      const witnessSigSize = requestBody.WitnessSignature?.length || 0;
      
      console.log('📋 Signature sizes (for debugging):');
      console.log('📋 Subject signature:', subjectSigSize, 'characters');
      console.log('📋 Co-PI signature:', coPISigSize, 'characters');
      console.log('📋 Witness signature:', witnessSigSize, 'characters');
      
      console.log(
        '📤 POST /AddUpdateParticipantInformedConsent payload:',
        JSON.stringify(
          {
            ...requestBody,
            SubjectSignature: requestBody.SubjectSignature
              ? `[${requestBody.SubjectSignature.length}] ${requestBody.SubjectSignature.slice(0, 40)}...`
              : 'empty',
            CoPrincipalInvestigatorSignature: requestBody.CoPrincipalInvestigatorSignature
              ? `[${requestBody.CoPrincipalInvestigatorSignature.length}] ${requestBody.CoPrincipalInvestigatorSignature.slice(
                  0,
                  40
                )}...`
              : 'empty',
            WitnessSignature: requestBody.WitnessSignature
              ? `[${requestBody.WitnessSignature.length}] ${requestBody.WitnessSignature.slice(0, 40)}...`
              : 'empty',
          },
          null,
          2
        )
      );

      console.log('📤 Full Request payload:', requestBody);
      
      // Test direct fetch call first to bypass API service
      console.log('🧪 Testing direct fetch call...');
      try {
        const API_BASE_URL = 'https://dev.3framesailabs.com:8060/api';
        const fullUrl = `${API_BASE_URL}/AddUpdateParticipantInformedConsent`;
        
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySUQiOiJVSUQtOSIsIkVtYWlsIjoic2VudGhpbEBvamFza2EuY29tIiwiUm9sZUlkIjoiUkwtMDAwMSIsIlJvbGVOYW1lIjoiQWRtaW5pc3RyYXRvciIsImlhdCI6MTc1OTY4NDUyMywiZXhwIjoxNzU5NzcwOTIzfQ.1UTh4V2PexWpwU30maQqYcn6-hCMSj9eAIWy6X6rcGg',
        };
        
        console.log('🧪 Direct fetch URL:', fullUrl);
        console.log('🧪 Direct fetch headers:', headers);
        console.log('🧪 Direct fetch payload:', requestBody);
        
        const directResponse = await fetch(fullUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
        });
        
        console.log('🧪 Direct fetch response status:', directResponse.status);
        const directResponseData = await directResponse.json();
        console.log('🧪 Direct fetch response data:', directResponseData);
        
        if (directResponse.ok && directResponseData) {
          console.log('✅ Direct fetch successful!');
          
          // Check for the correct response structure (both create and update)
          const addResponse = directResponseData.addParticipantInformedConsent;
          const updateResponse = directResponseData.updateParticipantInformedConsent;
          
          const hasInsertId = addResponse?.insertId;
          const hasAffectedRows = addResponse?.affectedRows;
          const hasUpdateAffectedRows = Array.isArray(updateResponse) ? updateResponse.length > 0 : (updateResponse?.affectedRows > 0);
          
          // For updates, even if the array is empty, the presence of the field indicates the API was called
          const hasUpdateResponse = updateResponse !== undefined;
          // For creates, empty array means failure - we need actual insertId or affectedRows
          const hasCreateSuccess = hasInsertId || (hasAffectedRows > 0);
          
          console.log('📦 Response structure check:');
          console.log('📦 addParticipantInformedConsent:', addResponse);
          console.log('📦 updateParticipantInformedConsent:', updateResponse);
          console.log('📦 hasInsertId:', hasInsertId);
          console.log('📦 hasAffectedRows:', hasAffectedRows);
          console.log('📦 hasUpdateAffectedRows:', hasUpdateAffectedRows);
          console.log('📦 hasUpdateResponse:', hasUpdateResponse);
          console.log('📦 hasCreateSuccess:', hasCreateSuccess);
          console.log('📦 Operation type:', PICDID ? 'UPDATE' : 'CREATE');
          console.log('📦 Full response structure:', Object.keys(directResponseData));
          
          // Check for database errors in the response
          const hasError = directResponseData.addParticipantInformedConsent_error || directResponseData.updateParticipantInformedConsent_error;
          if (hasError) {
            console.error('❌ Database error detected:', hasError);
            
            // Handle specific database errors
            if (hasError.code === 'ER_DATA_TOO_LONG') {
              console.error('❌ Data too long for database column');
              Toast.show({
                type: 'error',
                text1: 'Data Too Large',
                text2: 'Signature data is too large. Please create smaller signatures.',
                position: 'top',
                topOffset: 50,
                visibilityTime: 3000,
              });
              return;
            }
            
            Toast.show({
              type: 'error',
              text1: 'Database Error',
              text2: hasError.sqlMessage || 'Database operation failed',
              position: 'top',
              topOffset: 50,
              visibilityTime: 3000,
            });
            return;
          }
          
          // Different validation for create vs update
          const isSuccess = PICDID 
            ? (hasUpdateAffectedRows || hasUpdateResponse) // For updates: accept empty arrays
            : hasCreateSuccess; // For creates: need actual insertId or affectedRows
          
          console.log('📦 Final success check:', isSuccess);
          
          if (isSuccess) {
            const successMessage = PICDID ? 'Consent form updated successfully' : 'Consent form saved successfully';
            const successTitle = PICDID ? 'Updated Successfully' : 'Saved Successfully';
            
            // Update PICDID if this was a new record
            if (!PICDID && hasInsertId) {
              console.log('📋 Updating PICDID with new insertId:', hasInsertId);
              setPICDID(hasInsertId);
            }
            
            Toast.show({
              type: 'success',
              text1: successTitle,
              text2: successMessage,
              position: 'top',
              topOffset: 50,
              visibilityTime: 2000,
              onHide: () => navigation.goBack(),
            });
            return; // Exit early if direct fetch works
          } else {
            console.error('❌ Direct fetch failed - invalid response structure');
            console.error('❌ For CREATE operation, expected insertId or affectedRows > 0');
            console.error('❌ For UPDATE operation, expected updateParticipantInformedConsent field');
            console.error('❌ Actual response:', directResponseData);
            
            // Show specific error message based on operation type
            const errorMessage = PICDID 
              ? 'Update failed - no data was modified'
              : 'Create failed - new record was not created';
            
            Toast.show({
              type: 'error',
              text1: 'Save Failed',
              text2: errorMessage,
              position: 'top',
              topOffset: 50,
              visibilityTime: 3000,
            });
          }
        } else {
          console.error('❌ Direct fetch failed:', directResponseData);
        }
      } catch (directError) {
        console.error('❌ Direct fetch error:', directError);
      }
      
      // If direct fetch fails, try API service
      console.log('🔄 Trying API service as fallback...');
      
      // Debug authentication before API service call
      const { authService } = await import('src/services/authService');
      const authHeader = authService.getAuthHeader();
      console.log('🔐 Auth header from service:', authHeader);
      console.log('🔐 Is authenticated:', authService.isAuthenticated());
      console.log('🔐 Is token valid:', authService.isTokenValid());
      
      const response = await apiService.uploadInformedConsentSignatures(requestBody);
      console.log('📦 POST API Response status:', response.success);
      console.log('📦 POST API Response data:', response.data);
      console.log('📦 POST API Response message:', response.message);

      // Check for the correct response structure (both create and update)
      const addResponse = response.data?.addParticipantInformedConsent;
      const updateResponse = response.data?.updateParticipantInformedConsent;
      
      const hasInsertId = addResponse?.insertId;
      const hasAffectedRows = addResponse?.affectedRows;
      const hasUpdateAffectedRows = Array.isArray(updateResponse) ? updateResponse.length > 0 : (updateResponse?.affectedRows > 0);
      
      // For updates, even if the array is empty, the presence of the field indicates the API was called
      const hasUpdateResponse = updateResponse !== undefined;
      // For creates, empty array means failure - we need actual insertId or affectedRows
      const hasCreateSuccess = hasInsertId || (hasAffectedRows > 0);
      
      console.log('📦 API Service response check:');
      console.log('📦 addParticipantInformedConsent:', addResponse);
      console.log('📦 updateParticipantInformedConsent:', updateResponse);
      console.log('📦 hasInsertId:', hasInsertId);
      console.log('📦 hasAffectedRows:', hasAffectedRows);
      console.log('📦 hasUpdateAffectedRows:', hasUpdateAffectedRows);
      console.log('📦 hasUpdateResponse:', hasUpdateResponse);
      console.log('📦 hasCreateSuccess:', hasCreateSuccess);
      console.log('📦 Operation type:', PICDID ? 'UPDATE' : 'CREATE');
      
      // Different validation for create vs update
      const isSuccess = PICDID 
        ? (hasUpdateAffectedRows || hasUpdateResponse) // For updates: accept empty arrays
        : hasCreateSuccess; // For creates: need actual insertId or affectedRows
      
      console.log('📦 Final success check:', isSuccess);
      
      // Check for database errors in the response
      const hasError = response.data?.addParticipantInformedConsent_error || response.data?.updateParticipantInformedConsent_error;
      if (hasError) {
        console.error('❌ Database error detected:', hasError);
        
        // Handle specific database errors
        if (hasError.code === 'ER_DATA_TOO_LONG') {
          console.error('❌ Data too long for database column');
          Toast.show({
            type: 'error',
            text1: 'Data Too Large',
            text2: 'Signature data is too large. Please create smaller signatures.',
            position: 'top',
            topOffset: 50,
            visibilityTime: 3000,
          });
          return;
        }
        
        Toast.show({
          type: 'error',
          text1: 'Database Error',
          text2: hasError.sqlMessage || 'Database operation failed',
          position: 'top',
          topOffset: 50,
          visibilityTime: 3000,
        });
        return;
      }
      
      if (response.success && isSuccess) {
        console.log('✅ Save/Update successful!');
        const successMessage = PICDID ? 'Consent form updated successfully' : 'Consent form saved successfully';
        const successTitle = PICDID ? 'Updated Successfully' : 'Saved Successfully';
        
        Toast.show({
          type: 'success',
          text1: successTitle,
          text2: successMessage,
          position: 'top',
          topOffset: 50,
          visibilityTime: 2000,
          onHide: () => navigation.goBack(),
        });
      } else {
        console.error('❌ Save failed - invalid response structure');
        console.error('❌ For CREATE operation, expected insertId or affectedRows > 0');
        console.error('❌ For UPDATE operation, expected updateParticipantInformedConsent field');
        console.error('❌ Actual response:', response);
        
        // Show specific error message based on operation type
        const errorMessage = PICDID 
          ? 'Update failed - no data was modified'
          : 'Create failed - new record was not created';
        
        Toast.show({ 
          type: 'error', 
          text1: 'Save Failed', 
          text2: errorMessage
        });
      }
    } catch (error: any) {
      console.error('❌ Save error:', error);
      console.error('❌ Error response:', error?.response?.data);
      console.error('❌ Error message:', error?.message);
      
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Something went wrong. Please try again.';
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
        position: 'top',
        topOffset: 50,
        visibilityTime: 3000,
      });
    }
  };

  /* ---------------------- Monitor PICDID changes ---------------------- */
  useEffect(() => {
    console.log('🔄 PICDID changed to:', PICDID);
    console.log('🔄 PICDID type:', typeof PICDID);
    console.log('🔄 Operation mode:', PICDID ? 'UPDATE' : 'CREATE');
  }, [PICDID]);

  /* ---------------------- Load existing consent ---------------------- */
  useEffect(() => {
    console.log('🔄 Load existing consent useEffect triggered with patientId:', patientId);
    const fetchConsent = async () => {
      if (!patientId) {
        console.log('⚠️ No patientId available, skipping existing consent fetch');
        return;
      }
      
      console.log('🚀 Starting to fetch existing consent for patientId:', patientId);

      try {
        const API_BASE_URL = 'https://dev.3framesailabs.com:8060/api';
        const fullUrl = `${API_BASE_URL}/GetParticipantInformedConsent`;
        
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySUQiOiJVSUQtOSIsIkVtYWlsIjoic2VudGhpbEBvamFza2EuY29tIiwiUm9sZUlkIjoiUkwtMDAwMSIsIlJvbGVOYW1lIjoiQWRtaW5pc3RyYXRvciIsImlhdCI6MTc1OTY4NDUyMywiZXhwIjoxNzU5NzcwOTIzfQ.1UTh4V2PexWpwU30maQqYcn6-hCMSj9eAIWy6X6rcGg',
        };
        
        const payload = {
          ParticipantId: patientId.toString().startsWith('PID-') ? patientId.toString() : `PID-${patientId}`
        };
        
        console.log('📋 Fetching existing consent for:', payload);
        console.log('📋 Original patientId:', patientId);
        console.log('📋 Formatted ParticipantId:', payload.ParticipantId);
        
        const response = await fetch(fullUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        
        console.log('📡 Existing consent API Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Existing consent API Error Response:', errorText);
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        
        const consentRes = await response.json();
        console.log('📦 GET API Response data:', consentRes);
        
        // Get first row only if multiple rows exist
        const c = consentRes?.ResponseData?.[0];
        console.log('📋 Raw consent data:', c);
        console.log('📋 ResponseData length:', consentRes?.ResponseData?.length);
        
        if (!c) {
          console.log('📋 No existing consent data found');
          return;
        }

        console.log('📋 Loading existing consent data:', c);
        console.log('📋 QuestionDetails available:', !!c.QuestionDetails);
        console.log('📋 QuestionDetails length:', c.QuestionDetails?.length);
        console.log('📋 Raw PICDID from API:', c.PICDID);
        console.log('📋 PICDID type:', typeof c.PICDID);
        setPICDID(c.PICDID || null);
        console.log('📋 PICDID set to:', c.PICDID || null);

        // Handle QuestionId - can be array or single value
        const qids: string[] = Array.isArray(c.QuestionId) ? c.QuestionId : [c.QuestionId];
        const savedAcks: Record<string, boolean> = {};
        qids.filter(Boolean).forEach((qid) => (savedAcks[qid] = true));
        setAcks(savedAcks);
        
        // If QuestionDetails are available, use them to populate informedConsent
        if (c.QuestionDetails && Array.isArray(c.QuestionDetails)) {
          console.log('📋 Loading questions from QuestionDetails:', c.QuestionDetails);
          const questionDetails = c.QuestionDetails.map((qd: any) => ({
            ICMID: qd.QuestionId,
            StudyId: c.StudyId || 'CS-0001',
            QuestionName: qd.QuestionName,
            SortKey: qd.SortKey,
            Status: 1
          }));
          console.log('📋 Processed questionDetails:', questionDetails);
          setInformedConsent(questionDetails);
          console.log('📋 setInformedConsent called with', questionDetails.length, 'questions');
        } else {
          console.log('📋 No QuestionDetails found, will use GetInformedConsentMaster API');
        }

        setAgree(c.Response === 1);

        // Names/Dates
        setSignatures({
          subjectName: c.SubjectSignatoryName || '',
          subjectDate: c.SubjectSignatureDate ? formatDateDDMMYYYY(c.SubjectSignatureDate) : getCurrentDateString(),
          coPIName: c.CoPrincipalInvestigatorSignatoryName || '',
          coPIDate: c.CoPrincipalInvestigatorDate ? formatDateDDMMYYYY(c.CoPrincipalInvestigatorDate) : getCurrentDateString(),
          investigatorName: c.StudyInvestigatorName || '',
          witnessName: c.WitnessName || '',
          witnessDate: c.WitnessDate ? formatDateDDMMYYYY(c.WitnessDate) : getCurrentDateString(),
        });

        // SIGNATURES: API returns raw base64, convert → data URI for UI
        console.log('📋 Processing signatures...');
        console.log('📋 SubjectSignature length:', c.SubjectSignature?.length);
        console.log('📋 CoPISignature length:', c.CoPrincipalInvestigatorSignature?.length);
        console.log('📋 WitnessSignature length:', c.WitnessSignature?.length);
        
        setSubjectSignaturePad(ensureDataUri(c.SubjectSignature || ''));
        setCoPISignaturePad(ensureDataUri(c.CoPrincipalInvestigatorSignature || ''));
        setWitnessSignaturePad(ensureDataUri(c.WitnessSignature || ''));
        
        console.log('📋 Signatures processed and set');

        // Optional details
        if (c.Age) setAgeInput(String(c.Age));
        if (c.StudyTitle) setStudyTitle(c.StudyTitle);
        if (c.StudyNumber) setStudyNumber(c.StudyNumber);
        
        console.log('✅ Successfully loaded existing consent data');
      } catch (err) {
        console.error('❌ Error fetching consent:', err);
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load consent data' });
      }
    };

    fetchConsent();
  }, [patientId, studyId]);

  /* ============================ UI ============================ */
  console.log('🎨 Rendering InformedConsentForm UI');
  console.log('🎨 Informed consent questions:', informedConsent.length);
  console.log('🎨 PICDID:', PICDID);
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View className="px-4 pb-1" style={{ paddingTop: 8 }}>
        <View className="bg-white border-b-2 border-gray-300 rounded-xl p-6 flex-row justify-between items-center shadow-sm">
          <Text className="text-lg font-bold text-green-600">Participant ID: {patientId}</Text>
          <Text className="text-base font-semibold text-green-600">Study ID: {studyId || 'N/A'}</Text>
          <Text className="text-base font-semibold text-gray-700">Age: {age || 'Not specified'}</Text>
        </View>
        
      </View>

      <ScrollView className="flex-1 px-4 bg-bg pb-[400px]">
        {/* Study Details */}
        <FormCard icon="A" title="Study Details">
          <View className="mb-4 mt-4">
            <Text className="text-md text-[#2c4a43] font-medium mb-2">Study Title</Text>
            <View className="bg-white border border-[#e6eeeb] rounded-2xl p-4 min-h-[96px]">
              <TextInput
                value={studyTitle}
                onChangeText={setStudyTitle}
                multiline
                textAlignVertical="top"
                placeholder="Enter study title"
                placeholderTextColor="#9ca3af"
                className="text-base text-[#0b1f1c]"
              />
            </View>
          </View>

        </FormCard>

        {/* Participant Information */}
        <FormCard icon="B" title="Participant Information">
          <View className="flex-row space-x-4 mb-4 mt-4">
            <LabeledInput label="Participant ID" value={patientId ? String(patientId) : ''} editable={false} />
          </View>

          <View className="flex-row space-x-4 mb-4">
            <View className="flex-[0.6]">
              <Text className="text-md font-medium text-[#2c4a43]  mb-2">Age</Text>
              <InputShell>
                <TextInput
                  value={ageInput}
                  onChangeText={setAgeInput}
                  placeholder="Age"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  className="text-base text-[#0b1f1c]"
                  editable={false}
                />
              </InputShell>
            </View>
            <View className="flex-1">
              <LabeledInput
                label="Study Number"
                placeholder="Study Number"
                value={String(studyNumber)}
                editable={false}
              />
            </View>
          </View>
        </FormCard>

        {/* Acknowledgements */}
        <FormCard icon="C" title="Consent Acknowledgements (Initial each) *" error={!!errors.allInitialed}>
          {isLoadingQuestions ? (
            <View className="py-8 items-center">
              <Text className="text-[#666] text-center">Loading consent questions...</Text>
            </View>
          ) : informedConsent.length === 0 ? (
            <View className="py-8 items-center">
              <Text className="text-[#666] text-center">No consent questions available</Text>
            </View>
          ) : (
            informedConsent.map((s, idx) => (
            <View key={s.ICMID} className="mb-3 mt-4">
              <View className="bg-white border border-[#e6eeeb] rounded-2xl p-3">
                <View className="flex-row items-start">
                  <View className="w-8 mr-3">
                    <View className="w-8 h-8 rounded-md bg-[#e7f7f0] border border-[#cfe0db] items-center justify-center">
                      <Text className="text-[#0a6f55] font-extrabold">{['i', 'ii', 'iii', 'iv'][idx] || idx + 1}</Text>
                    </View>
                  </View>
                  <View className="flex-1 pr-3">
                    <Text className="text-[15px] leading-6 text-[#0b1f1c]">{s.QuestionName}</Text>
                  </View>
                  <Pressable
                    onPress={() => toggleAck(s.ICMID)}
                    className={`h-10 px-4 rounded-lg border-2 border-dashed items-center justify-center ${
                      acks[s.ICMID] ? 'border-[#0ea06c] bg-[#0ea06c]/10' : 'border-[#cfe0db]'
                    }`}
                  >
                    <Text
                      className={`text-[12px] font-semibold ${
                        acks[s.ICMID] ? 'text-[#0ea06c]' : 'text-[#6b7a77]'
                      }`}
                    >
                      {acks[s.ICMID] ? '✓ Initialed' : 'Initial'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))
          )}

          <View className="mt-3">
            <View className="flex-row items-center">
              <Pressable
                onPress={() => {
                  setAgree((v) => {
                    const nv = !v;
                    if (nv) setErrors((p) => ({ ...p, agree: undefined }));
                    return nv;
                  });
                }}
                className={`w-7 h-7 mr-3 rounded-[6px] border-2 items-center justify-center  ${
                  agree ? 'bg-[#0ea06c] border-[#0ea06c]' : 'border-[#cfe0db]'
                }`}
              >
                {agree && <Text className="text-white text-[10px]">✓</Text>}
              </Pressable>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text className={`text-sm font-medium ${errors.agree ? 'text-red-500' : 'text-[#0b1f1c]'}`}>
                  I agree to voluntarily take part in the above study.
                </Text>
                <Text style={{ color: 'red', fontSize: 14, fontWeight: '500', marginLeft: 2 }}>*</Text>
              </View>
            </View>
          </View>
        </FormCard>

        {/* Signatures */}
        <FormCard icon="D" title="Signatures">
          <View className="space-y-4 mt-4">
            <View className="flex-row space-x-4">
              <SignatureBlock
                title="Signature (or Thumb impression) of the Subject"
                nameLabel="Signatory’s Name"
                hideName
                error={{
                  subjectName: errors.subjectName,
                  subjectSignaturePad: errors.subjectSignaturePad,
                }}
                nameValue={signatures.subjectName}
                onChangeName={(v) => setSig('subjectName', v)}
                signatureValue={subjectSignaturePad}
                onChangeSignature={(v) => setSubjectSignaturePad(ensureDataUri(v))}
                dateValue={signatures.subjectDate}
                onChangeDate={(v) => setSig('subjectDate', v)}
              />

              <SignatureBlock
                title="Co-Principal Investigator Signature"
                nameLabel="Co-PI Name"
                nameValue={signatures.coPIName}
                error={{
                  subjectName: errors.coPIName,
                  subjectSignaturePad: errors.coPISignaturePad,
                }}
                onChangeName={(v) => setSig('coPIName', v)}
                signatureValue={coPISignaturePad}
                onChangeSignature={(v) => setCoPISignaturePad(ensureDataUri(v))}
                dateValue={signatures.coPIDate}
                onChangeDate={(v) => setSig('coPIDate', v)}
              />
            </View>

            <View className="flex-row space-x-4">
              <InvestigatorNameBlock
                value={signatures.investigatorName}
                onChange={(v) => setSig('investigatorName', v)}
                error={errors.investigatorName}
              />

              <SignatureBlock
                title="Witness Signature"
                nameLabel="Name of the Witness"
                nameValue={signatures.witnessName}
                error={{
                  subjectName: errors.witnessName,
                  subjectSignaturePad: errors.witnessSignaturePad,
                }}
                onChangeName={(v) => setSig('witnessName', v)}
                signatureValue={witnessSignaturePad}
                onChangeSignature={(v) => setWitnessSignaturePad(ensureDataUri(v))}
                dateValue={signatures.witnessDate}
                onChangeDate={(v) => setSig('witnessDate', v)}
              />
            </View>

            <Text className="text-[12px] text-[#6b7a77] italic">
              Note: Make 2 copies of the Subject Information Sheet and Consent Form — one for the Principal
              Investigator and one for the patient.
            </Text>
          </View>
        </FormCard>

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomBar>
        <Btn variant="light" onPress={handleClear}>
          Clear
        </Btn>
        <Btn
          onPress={() => {
            handleSubmit();
          }}
          className="font-bold text-base"
        >
          Save & Close
        </Btn>
      </BottomBar>
    </KeyboardAvoidingView>
  );
}

/* --------------------- Small UI helpers ---------------------- */

function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText?: (t: string) => void;
  placeholder?: string;
  editable?: boolean;
}) {
  return (
    <View className="flex-1">
      <Text className="text-md font-medium text-[#2c4a43] mb-2">{label}</Text>
      <InputShell>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          editable={editable}
          placeholderTextColor="#9ca3af"
          className="text-base text-[#0b1f1c]"
        />
      </InputShell>
    </View>
  );
}

function InputShell({ children }: { children: React.ReactNode }) {
  return <View className="bg-white border border-[#e6eeeb] rounded-2xl px-3 py-3">{children}</View>;
}

type SignatureBlockProps = {
  title: string;
  nameLabel: string;
  nameValue: string;
  dateValue: string;
  signatureValue: string;
  error?: {
    subjectName?: string;
    subjectSignaturePad?: string;
  };
  hideName?: boolean;
  onChangeName: (v: string) => void;
  onChangeDate: (v: string) => void;
  onChangeSignature: (v: string) => void;
};

export function SignatureBlock({
  title,
  nameLabel,
  error,
  nameValue,
  hideName,
  onChangeName,
  dateValue,
  onChangeDate,
  signatureValue,
  onChangeSignature,
}: SignatureBlockProps) {
  const [nameError, setNameError] = useState(!!error?.subjectName && !hideName);
  const [sigError, setSigError] = useState(!!error?.subjectSignaturePad);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!hideName) setNameError(!!(error?.subjectName && !nameValue?.trim()));
    else setNameError(false);
  }, [nameValue, error?.subjectName, hideName]);

  useEffect(() => {
    setSigError(!!(error?.subjectSignaturePad && !signatureValue?.trim()));
  }, [signatureValue, error?.subjectSignaturePad]);

  return (
    <View className="flex-1 bg-white border border-[#e6eeeb] rounded-2xl p-4">
      <Text className={`text-md font-medium mb-3 ${sigError ? 'text-red-500' : 'text-[#2c4a43]'}`}>{title}</Text>

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          minHeight: 96,
          borderWidth: 2,
          borderColor: '#cfe0db',
          borderStyle: 'dashed',
          borderRadius: 12,
          backgroundColor: '#fafdfb',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text style={{ color: signatureValue ? '#0b1f1c' : '#90a29d' }}>
          {signatureValue ? '✓ Signature Added' : 'Tap to Sign'}
        </Text>
      </TouchableOpacity>

      <SignatureModal
        label={title}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        signatureData={signatureValue}
        setSignatureData={onChangeSignature}
      />

      <View className="flex-row space-x-4">
        {!hideName && (
          <View className="flex-1">
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
              <Text className={`text-md font-base mb-2 ${nameError ? 'text-red-500' : 'text-[#2c4a43]'}`}>
                {nameLabel}
              </Text>
              <Text style={{ color: 'red', fontSize: 14, fontWeight: '500', marginLeft: 2 }}>*</Text>
            </View>
            <TextInput
              value={nameValue}
              onChangeText={onChangeName}
              placeholder="Enter name"
              placeholderTextColor="#9ca3af"
              className={`text-sm text-[#0b1f1c] border rounded-xl px-3 py-3 border-[#dce9e4] ${
                nameError ? 'border-red-500' : ''
              }`}
              style={{ lineHeight: 20, minHeight: 44, textAlignVertical: 'center' }}
              multiline={false}
              numberOfLines={1}
            />
          </View>
        )}
        <View className="flex-1">
          <DateField label="Date" value={dateValue} onChange={onChangeDate} mode="date" />
        </View>
      </View>
    </View>
  );
}

export function InvestigatorNameBlock({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [showError, setShowError] = useState(!!error);

  useEffect(() => {
    if (value?.trim()) setShowError(false);
    else if (error) setShowError(true);
  }, [value, error]);

  return (
    <View className="flex-1 bg-white border border-[#e6eeeb] rounded-2xl p-4">
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text className={`text-md font-medium mb-3 ${showError ? 'text-red-500' : 'text-[#2c4a43]'}`}>
          Study Investigator's Name
        </Text>
        <Text style={{ color: 'red', fontSize: 16, fontWeight: '500', marginLeft: 2 }}>*</Text>
      </View>

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Enter name"
        placeholderTextColor="#9ca3af"
        className={`text-sm text-[#0b1f1c] border rounded-xl px-3 py-3 border-[#dce9e4] ${
          showError ? 'border-red-500' : ''
        }`}
        style={{ lineHeight: 20, minHeight: 44, textAlignVertical: 'center' }}
        multiline={false}
        numberOfLines={1}
      />
    </View>
  );
}
