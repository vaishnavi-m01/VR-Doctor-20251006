import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserContext } from 'src/store/context/UserContext';
import { RootStackParamList } from '../../Navigation/types';
import { apiService } from 'src/services';
import FormCard from '@components/FormCard';
import { Field } from '@components/Field';
import BottomBar from '@components/BottomBar';
import Button, { Btn } from '@components/Button';
import Chip from '@components/Chip';
import { PARTICIPANT_RESPONSES } from '../../constants/appConstants';
import DateField from '@components/DateField';
import { KeyboardAvoidingView } from 'react-native';
import { Platform } from 'react-native';
import { formatDateDDMMYYYY } from 'src/utils/date';
import { DropdownField } from '@components/DropdownField';
import FactGForm from '@components/FactGForm';
import { Modal } from 'react-native';
import DistressBaselineForm from '@components/DistressBaselineForm';


const STATIC_DEVICE_ID = 'DEV-001';

interface FormField {
  SOFID: string;
  FieldLabel: string;
  SortOrder: number;
  Status: number;
  CreatedBy: string;
  CreatedDate: string;
  ModifiedBy: string | null;
  ModifiedDate?: string | null;
}

interface ApiResponse<T> {
  ResponseData: T[];
}

interface StudyObservationApiModel {
  ObservationId: string | null;
  ParticipantId: string;
  StudyId: string;
  DateAndTime: string;
  DeviceId: string;
  ObserverName: string;
  SessionNumber: string;
  SessionName: string;
  FACTGScore: string;
  DistressThermometerScore: string;
  SessionCompleted: string;
  SessionNotCompletedReason: string | null;
  SessionStartTime: string;
  SessionEndTime: string;
  PatientResponseDuringSession: string;
  PatientResponseOther: string | null;
  TechnicalIssues: string;
  TechnicalIssuesDescription: string | null;
  PreVRAssessmentCompleted: string;
  PostVRAssessmentCompleted: string;
  DistressScoreAndFACTGCompleted: string;
  SessionStoppedMidwayReason: string | null;
  PatientAbleToFollowInstructions: string;
  PatientInstructionsExplanation: string | null;
  VisibleSignsOfDiscomfort: string;
  DiscomfortDescription: string | null;
  PatientRequiredAssistance: string;
  AssistanceExplanation: string | null;
  DeviationsFromProtocol: string;
  ProtocolDeviationExplanation: string | null;
  OtherObservations: string | null;
  WeekNumber?: number;
  Status?: number;
  CreatedBy?: string;
  ModifiedBy: string;
}

type RouteParams = {
  patientId: number;
  age: number;
  studyId: number;
  observationId?: string | null;
};

interface DistressWeeklyScore {
  PDWSID: string;
  ParticipantId: string;
  ScaleValue: string;
  SortKey: number;
  Status: number;
  CreatedBy: string;
  CreatedDate: string;
  ModifiedBy: string | null;
  ModifiedDate: string;
}

interface DistressWeeklyResponse {
  ResponseData: DistressWeeklyScore[];
}

interface FactGItem {
  id: string;
  score: number;
  category: string;
  createdDate?: string;
  [key: string]: any;
}

interface FactGResponse {
  ResponseData: FactGItem[];
  CategoryScore: Record<string, string>;
  FinalScore: string;
}

// Utility functions
const getCurrentDateTimeISO = (): string => new Date().toISOString();

const extractTime = (dateTimeStr?: string | null): string => {
  if (!dateTimeStr) return '';
  const match = dateTimeStr.match(/(\d{2}:\d{2}(:\d{2})?)/);
  return match ? match[1] : '';
};

const formatDateTimeForApi = (isoString: string): string => {
  if (!isoString) return '';
  const d = new Date(isoString);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
};

const StudyObservation = () => {
  // Context and routing
  const route = useRoute<RouteProp<RootStackParamList, 'StudyObservation'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userId } = useContext(UserContext);
  const { patientId: routePatientId, age, studyId, observationId: routeObservationId } = route.params as RouteParams;

  // State
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [yesNoStates, setYesNoStates] = useState<Record<string, string>>({});
  const [resp, setResp] = useState<string>(''); // single selection for patient response
  const [observationId, setObservationId] = useState<string | null>(routeObservationId ?? null);
  const [studyIdState, setStudyIdState] = useState<string>(studyId.toString());
  const [factGScore, setFactGScore] = useState<string | null>(null);
  const [distressScore, setDistressScore] = useState<string | null>(null);
  const [baselineLoading, setBaselineLoading] = useState<boolean>(false);
  const [randomizationId, setRandomizationId] = useState("");

  const [showFactGForm, setShowFactGForm] = useState(false);
  const [showDistressBaselineForm, setShowDistressBaselineForm] = useState(false);


  const openDistressBaselineForm = () => setShowDistressBaselineForm(true);
  const closeDistressBaselineForm = () => setShowDistressBaselineForm(false);

  //   const closeFactGModal = () => {
  //   setShowFactGForm(false);
  //   // Refresh baseline scores after FactG form is closed
  //   const participantId = `${routePatientId}`;
  //   fetchBaselineScores(participantId, `${studyId}`);
  // };

    const openFactGModal = () => setShowFactGForm(true);
  const closeFactGModal= () => setShowFactGForm(false);


  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const rawDate = formValues['SOFID-1']?.split('T')[0] || '';
  const formattedDate = formatDateDDMMYYYY(rawDate);

  const weekOptions = Array.from({ length: 12 }, (_, i) => ({
    label: `Week ${i + 1}`,
    value: (i + 1).toString(),
  }));



  // Group fields into categories for form cards
  const groupFields = (fields: FormField[]) => {
    const baseline = fields.filter((f) => ['SOFID-7', 'SOFID-8'].includes(f.SOFID));
    const basic = fields.filter((f) => ['SOFID-1', 'SOFID-2', 'SOFID-3', 'SOFID-4', 'SOFID-5'].includes(f.SOFID));
    const session = fields.filter((f) =>
      ['SOFID-9', 'SOFID-10', 'SOFID-11', 'SOFID-12', 'SOFID-13', 'SOFID-14', 'SOFID-15'].includes(f.SOFID)
    );
    const compliance = fields.filter((f) =>
      ['SOFID-16', 'SOFID-17', 'SOFID-18', 'SOFID-20', 'SOFID-21'].includes(f.SOFID)
    );
    const additional = fields.filter((f) =>
      ['SOFID-22', 'SOFID-23', 'SOFID-24', 'SOFID-25', 'SOFID-26', 'SOFID-27', 'SOFID-28'].includes(f.SOFID)
    );
    return { baseline, basic, session, compliance, additional };
  };

  useEffect(() => {
    fetchFormFields();
    loadObservationForm();
    fetchRandomizationId(routePatientId.toString());
  }, [routePatientId, studyIdState]);

  const fetchFormFields = async () => {
    try {
      const res = await apiService.post<ApiResponse<FormField>>('/GetStudyObservationFormFields', {});
      const fields = res.data?.ResponseData ?? [];
      fields.sort((a, b) => a.SortOrder - b.SortOrder);
      setFormFields(fields);
    } catch {
      setError('Failed to load form fields.');
    }
  };

  const loadObservationForm = async () => {
    setLoading(true);
    setError(null);
    try {
      const participantId = routePatientId.toString();
      const payload = {
        ObservationId: observationId,
        ParticipantId: participantId,
        StudyId: studyIdState,
        SessionName: null,
        DateAndTime: null,
      };
      const res = await apiService.post<ApiResponse<StudyObservationApiModel>>('/GetParticipantStudyObservationForms', payload);
      const data = res.data?.ResponseData ?? [];

      if (data.length > 0) {
        const record = data[0];

        setFactGScore(record.FACTGScore || null);
        setDistressScore(record.DistressThermometerScore || null);

        setFormValues({
          'SOFID-1': record.DateAndTime || getCurrentDateTimeISO(),
          'SOFID-2': record.ParticipantId,
          'SOFID-3': record.DeviceId || STATIC_DEVICE_ID,
          'SOFID-4': record.ObserverName,
          'SOFID-5': record.SessionNumber,
          'SOFID-6': record.SessionName,
          'SOFID-7': record.FACTGScore,
          'SOFID-8': record.DistressThermometerScore,
          'SOFID-9': record.SessionCompleted,
          'SOFID-10': record.SessionNotCompletedReason || '',
          'SOFID-11': extractTime(record.SessionStartTime),
          'SOFID-12': extractTime(record.SessionEndTime),
          'SOFID-13': record.PatientResponseDuringSession || '',
          'SOFID-13-OTHER': record.PatientResponseOther || '',
          'SOFID-14': record.TechnicalIssues,
          'SOFID-15': record.TechnicalIssuesDescription || '',
          'SOFID-16': record.PreVRAssessmentCompleted,
          'SOFID-17': record.PostVRAssessmentCompleted,
          'SOFID-18': record.DistressScoreAndFACTGCompleted,
          'SOFID-19': record.SessionStoppedMidwayReason || '',
          'SOFID-20': record.PatientAbleToFollowInstructions,
          'SOFID-21': record.PatientInstructionsExplanation || '',
          'SOFID-22': record.VisibleSignsOfDiscomfort,
          'SOFID-23': record.DiscomfortDescription || '',
          'SOFID-24': record.PatientRequiredAssistance,
          'SOFID-25': record.AssistanceExplanation || '',
          'SOFID-26': record.DeviationsFromProtocol,
          'SOFID-27': record.ProtocolDeviationExplanation || '',
          'SOFID-28': record.OtherObservations || '',
        });

        // Normalize PatientResponseDuringSession to single string
        let patientResponse = record.PatientResponseDuringSession || '';
        if (Array.isArray(patientResponse)) {
          patientResponse = patientResponse.join('');
        }
        if (typeof patientResponse === 'string' && patientResponse.includes(',')) {
          patientResponse = patientResponse.split(',')[0].trim();
        }
        setResp(patientResponse);

        setYesNoStates({
          'SOFID-9': record.SessionCompleted,
          'SOFID-14': record.TechnicalIssues,
          'SOFID-22': record.VisibleSignsOfDiscomfort,
          'SOFID-24': record.PatientRequiredAssistance,
          'SOFID-26': record.DeviationsFromProtocol,
          'SOFID-20': record.PatientAbleToFollowInstructions,
          'SOFID-16': record.PreVRAssessmentCompleted,
          'SOFID-17': record.PostVRAssessmentCompleted,
          'SOFID-18': record.DistressScoreAndFACTGCompleted,
        });
        setObservationId(record.ObservationId);
      } else {
        // Initialize empty form
        setFactGScore(null);
        setDistressScore(null);
        setFormValues({
          'SOFID-1': getCurrentDateTimeISO(),
          'SOFID-2': routePatientId.toString(),
          'SOFID-3': STATIC_DEVICE_ID,
          'SOFID-4': 'Dr. John',
          'SOFID-5': '1',
          'SOFID-6': 'Chemotherapy',
          'SOFID-7': '',
          'SOFID-8': '',
          'SOFID-9': '',
          'SOFID-10': '',
          'SOFID-11': '',
          'SOFID-12': '',
          'SOFID-13': '',
          'SOFID-13-OTHER': '',
          'SOFID-14': '',
          'SOFID-15': '',
          'SOFID-16': '',
          'SOFID-17': '',
          'SOFID-18': '',
          'SOFID-19': '',
          'SOFID-20': '',
          'SOFID-21': '',
          'SOFID-22': '',
          'SOFID-23': '',
          'SOFID-24': '',
          'SOFID-25': '',
          'SOFID-26': '',
          'SOFID-27': '',
          'SOFID-28': '',
        });
        setYesNoStates({});
        setResp('');
        setObservationId(null);
      }
    } catch {
      setError('Failed to load Study Observation data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRandomizationId = async (participantIdParam: string) => {
    try {
      const response = await apiService.post('/GetParticipantDetails', {
        ParticipantId: participantIdParam,
      });

      console.log('Randomization ID API response:', response.data);
      const data = response.data?.ResponseData;
      console.log('Randomization ID data:', data);

      if (data && data.GroupTypeNumber) {
        console.log('Setting randomization ID:', data.GroupTypeNumber);
        setRandomizationId(data.GroupTypeNumber);
      } else {
        console.log('No GroupTypeNumber found in response');
      }
    } catch (error) {
      console.error('Error fetching randomization ID:', error);
    }
  };

  const fetchBaselineScores = async (participantId: string, studyId: string) => {
    setBaselineLoading(true);
    try {
      let factGScore = 0;
      let distressValue = '0';

      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // Fetch FACT-G data for today only
      const factGRes = await apiService.post('/getParticipantFactGQuestionBaseline', {
        StudyId: studyId,
        ParticipantId: participantId,
        CreatedDate: today,
      }) as { data: FactGResponse };

      if (factGRes.data && factGRes.data.FinalScore) {
        const parsedScore = Number(factGRes.data.FinalScore);
        factGScore = isNaN(parsedScore) ? 0 : parsedScore;
      } else {
        factGScore = 0;
      }

      // Fetch distress score for today only
      const distressRes = await apiService.post('/GetParticipantDistressWeeklyScore', {
        ParticipantId: participantId,
        CreatedDate: todayStr,
      }) as { data: DistressWeeklyResponse };

      const todayDistress = distressRes.data.ResponseData.find(item => {
        if (!item.CreatedDate) return false;
        const itemDateStr = item.CreatedDate.split(' ')[0]; // Adjust if needed
        return itemDateStr === todayStr;
      });
      distressValue = todayDistress?.ScaleValue || '0';

      if (!todayDistress && distressRes.data.ResponseData.length > 0) {
        distressRes.data.ResponseData.sort((a, b) =>
          b.CreatedDate.localeCompare(a.CreatedDate)
        );
        distressValue = distressRes.data.ResponseData[0].ScaleValue || '0';
        console.log('Fallback distress value:', distressValue);
      }


      // Update the form and state values
      setFactGScore(factGScore.toString());
      setDistressScore(distressValue);
      setFormValues(prev => ({
        ...prev,
        'SOFID-7': factGScore.toString(),
        'SOFID-8': distressValue,
      }));
      // setBaselineDisabled(factGScore > 0); 

    } catch (error) {
      setFactGScore('0');
      setDistressScore('0');
      setFormValues(prev => ({
        ...prev,
        'SOFID-7': '0',
        'SOFID-8': '0',
      }));
    } finally {
      setBaselineLoading(false);
    }
  };


  useEffect(() => {
    const participantId = `${routePatientId}`;
    fetchBaselineScores(participantId, `${studyId}`);
  }, [routePatientId, studyId, routeObservationId]);

  const updateFormValue = (sofid: string, value: string) => {
    setFormValues(prev => ({ ...prev, [sofid]: value }));
    setFieldErrors(prev => {
      const copy = { ...prev };
      delete copy[sofid];
      return copy;
    });
  };

  const handleYesNoChange = (sofid: string, value: string) => {
    setYesNoStates(prev => ({ ...prev, [sofid]: value }));
    setFormValues(prev => ({ ...prev, [sofid]: value }));
    setFieldErrors(prev => {
      const copy = { ...prev };
      delete copy[sofid];
      return copy;
    });
  };

  // Updated: Accept string or string[] from Chip and normalize
  const handlePatientResponseChange = (next: string | string[]) => {
    if (typeof next === 'string') {
      setResp(next);
      setFormValues(prev => ({ ...prev, 'SOFID-13': next }));
    } else if (Array.isArray(next) && next.length > 0) {
      setResp(next[0]);
      setFormValues(prev => ({ ...prev, 'SOFID-13': next[0] }));
    } else {
      setResp('');
      setFormValues(prev => ({ ...prev, 'SOFID-13': '' }));
    }
    setFieldErrors(prev => {
      const copy = { ...prev };
      delete copy['SOFID-13'];
      return copy;
    });
  };

  const yesNoButton = (label: string, value: string, selected: string, onSelect: (v: string) => void) => (
    <Pressable
      onPress={() => onSelect(value)}
      className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${selected === value ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
        }`}
    >
      <Text className={`font-medium text-sm ${selected === value ? 'text-white' : 'text-black'}`}>{label}</Text>
    </Pressable>
  );

  const isValidTime = (time: string): boolean => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
    return timeRegex.test(time);
  };

  // Helper to get form value safely (empty string fallback)
  const getFormValue = (sofid: string): string => {
    return (formValues[sofid] ?? '').trim();
  };

  const handleValidate = (): boolean => {
    const errors: Record<string, string> = {};

    // Required text fields excluding start/end time fields
    const requiredTextFields = [
      'SOFID-1',
      'SOFID-2',
      'SOFID-3',
      'SOFID-4',
      'SOFID-5',
      // 'SOFID-6',
      // 'SOFID-11',//Start time
      // 'SOFID-12',//End time
    ];

    requiredTextFields.forEach((field) => {
      const value = getFormValue(field);
      if (!value) {
        const label = formFields.find((f) => f.SOFID === field)?.FieldLabel || field;
        errors[field] = `${label} is required.`;
      }
    });

    ['SOFID-11', 'SOFID-12'].forEach((timeField) => {
      const value = getFormValue(timeField);
      if (value && !isValidTime(value)) {
        const label = formFields.find((f) => f.SOFID === timeField)?.FieldLabel || timeField;
        errors[timeField] = `${label} must be in HH:MM:SS format.`;
      }
    });

    // Yes/No state fields required
    const yesNoRequiredFields = [
      'SOFID-9',
      'SOFID-14',
      'SOFID-20',
      'SOFID-22',
      'SOFID-24',
      'SOFID-26',
      'SOFID-16',
      'SOFID-17',
      'SOFID-18',
    ];

    yesNoRequiredFields.forEach((field) => {
      const val = yesNoStates[field];
      if (val !== 'Yes' && val !== 'No') {
        const label = formFields.find((f) => f.SOFID === field)?.FieldLabel || field;
        errors[field] = `${label} is required.`;
      }
    });

    // Response required
    if (!resp || resp.length === 0) {
      errors['SOFID-13'] = 'Please select Patient Response During Session.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'All fields are required',
        position: 'top',
        topOffset: 50,
      });
      return false; // validation failed
    } else {
      setFieldErrors({});
      Toast.show({
        type: 'success',
        text1: 'Validation Passed',
        text2: 'All required fields are filled',
        position: 'top',
        topOffset: 50,
      });
      return true; // validation passed
    }
  };


  const handleSave = async () => {
    if (saving) return;

    const isValid = handleValidate();
    if (!isValid) return; // stop if validation fails

    setSaving(true);

    try {
      const participantId = getFormValue('SOFID-2');
      const dateTime = getFormValue('SOFID-1');
      const dateTimeFormatted = formatDateTimeForApi(dateTime);

      // Build payload
      const payload: StudyObservationApiModel = {
        ObservationId: observationId,
        ParticipantId: participantId,
        StudyId: studyIdState,
        DateAndTime: dateTimeFormatted,
        DeviceId: getFormValue('SOFID-3') || STATIC_DEVICE_ID,
        ObserverName: getFormValue('SOFID-4'),
        SessionNumber: getFormValue('SOFID-5'),
        SessionName: getFormValue('SOFID-6'),
        FACTGScore: getFormValue('SOFID-7'),
        DistressThermometerScore: getFormValue('SOFID-8'),
        SessionCompleted: yesNoStates['SOFID-9'],
        SessionNotCompletedReason:
          yesNoStates['SOFID-9'] === 'No' ? getFormValue('SOFID-10') || null : null,
        SessionStartTime: getFormValue('SOFID-11'),
        SessionEndTime: getFormValue('SOFID-12'),
        PatientResponseDuringSession: Array.isArray(resp) ? resp.join(',') : resp,
        PatientResponseOther:
          Array.isArray(resp) && resp.includes('Other') && getFormValue('SOFID-13-OTHER') !== ''
            ? getFormValue('SOFID-13-OTHER')
            : !Array.isArray(resp) && resp === 'Other' && getFormValue('SOFID-13-OTHER') !== ''
              ? getFormValue('SOFID-13-OTHER')
              : null,
        TechnicalIssues: yesNoStates['SOFID-14'],
        TechnicalIssuesDescription:
          yesNoStates['SOFID-14'] === 'Yes' && getFormValue('SOFID-15') !== '' ? getFormValue('SOFID-15') : null,
        PreVRAssessmentCompleted: yesNoStates['SOFID-16'],
        PostVRAssessmentCompleted: yesNoStates['SOFID-17'],
        DistressScoreAndFACTGCompleted: yesNoStates['SOFID-18'],
        SessionStoppedMidwayReason:
          yesNoStates['SOFID-9'] === 'No' ? getFormValue('SOFID-19') || getFormValue('SOFID-10') || null : null,
        PatientAbleToFollowInstructions: yesNoStates['SOFID-20'],
        PatientInstructionsExplanation:
          yesNoStates['SOFID-20'] === 'No' && getFormValue('SOFID-21') !== '' ? getFormValue('SOFID-21') : null,
        VisibleSignsOfDiscomfort: yesNoStates['SOFID-22'],
        DiscomfortDescription:
          yesNoStates['SOFID-22'] === 'Yes' && getFormValue('SOFID-23') !== '' ? getFormValue('SOFID-23') : null,
        PatientRequiredAssistance: yesNoStates['SOFID-24'],
        AssistanceExplanation:
          yesNoStates['SOFID-24'] === 'Yes' && getFormValue('SOFID-25') !== '' ? getFormValue('SOFID-25') : null,
        DeviationsFromProtocol: yesNoStates['SOFID-26'],
        ProtocolDeviationExplanation:
          yesNoStates['SOFID-26'] === 'Yes' && getFormValue('SOFID-27') !== '' ? getFormValue('SOFID-27') : null,
        OtherObservations: getFormValue('SOFID-28') !== '' ? getFormValue('SOFID-28') : null,
        ModifiedBy: userId ?? 'UID-1',
      };

      console.log('Saving observation payload:', payload);

      const response = await apiService.post('/AddUpdateParticipantStudyObservationForm', payload);

      if (response.status === 200 || response.status === 201) {
        Toast.show({
          type: 'success',
          text1: !observationId ? "Added Successfully!" : "Updated Successfully!",
          text2: !observationId ? 'Observation Added successfully!' : 'Observation Updated successfully!',
          position: 'top',
          topOffset: 50,
          visibilityTime: 1000,
          onHide: () => navigation.goBack(),
        });
      } else {
        throw new Error(`Server returned status ${response.status}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error saving observation:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage || 'Failed to save Study Observation. Please try again.',
        position: 'top',
        topOffset: 50,
      });
    } finally {
      setSaving(false);
    }
  };


  const handleClear = () => {
    setYesNoStates({});
    setResp('');
    setObservationId(null);
    // setFactGScore(null);
    // setDistressScore(null);
    setFieldErrors({});

    setFormValues(prev => ({
      ...prev,

      'SOFID-1': prev['SOFID-1'],
      'SOFID-2': prev['SOFID-2'],
      'SOFID-3': prev['SOFID-3'],
      'SOFID-4': prev['SOFID-4'],
      'SOFID-5': prev['SOFID-5'],
      'SOFID-6': prev['SOFID-6'],

      'SOFID-7': '',
      'SOFID-8': '',
      'SOFID-9': '',
      'SOFID-10': '',
      'SOFID-11': '',
      'SOFID-12': '',
      'SOFID-13': '',
      'SOFID-13-OTHER': '',
      'SOFID-14': '',
      'SOFID-15': '',
      'SOFID-16': '',
      'SOFID-17': '',
      'SOFID-18': '',
      'SOFID-19': '',
      'SOFID-20': '',
      'SOFID-21': '',
      'SOFID-22': '',
      'SOFID-23': '',
      'SOFID-24': '',
      'SOFID-25': '',
      'SOFID-26': '',
      'SOFID-27': '',
      'SOFID-28': '',
    }));
  };




  const renderTextField = (sofid: string, label: string, placeholder?: string, multiline = false) => {
    const hasError = !!fieldErrors[sofid];
    const isRequired = ['SOFID-1', 'SOFID-2', 'SOFID-3', 'SOFID-4', 'SOFID-5'].includes(sofid);
    
    return (
      <View key={sofid} className="mt-3">
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            className={`text-sm `}
            style={{ color: hasError ? '#EF4444' : '#rgb(44 74 67)', fontWeight: '500', marginBottom: 2 }}>
            {label}
          </Text>
          {isRequired && (
             <Text style={{ color: 'red', fontSize: 16, fontWeight: '500', marginLeft: 5, marginBottom: 5 }}>
              *
            </Text>
          )}
        </View>
        <Field
          placeholder={placeholder || label}
          value={formValues[sofid] || ''}
          onChangeText={(value) => updateFormValue(sofid, value)}
          multiline={multiline}
        />
      </View>
    );
  };

  const renderYesNoField = (sofid: string, label: string) => {
    const hasError = !!fieldErrors[sofid];
    const isRequired = ['SOFID-9', 'SOFID-14', 'SOFID-20', 'SOFID-22', 'SOFID-24', 'SOFID-26', 'SOFID-16', 'SOFID-17', 'SOFID-18'].includes(sofid);
    
    return (
      <View key={sofid} className="mt-3">
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text className="text-sm mb-2" style={{ color: hasError ? '#EF4444' : '#rgb(44 74 67)', fontWeight: '500' }}>
            {label}
          </Text>
          {isRequired && (
             <Text style={{ color: 'red', fontSize: 16, fontWeight: '500', marginLeft: 5, marginBottom: 9 }}>
              *
            </Text>
          )}
        </View>

        <View className="flex-row gap-2">
          {yesNoButton('Yes', 'Yes', yesNoStates[sofid] || '', (value) => handleYesNoChange(sofid, value))}
          {yesNoButton('No', 'No', yesNoStates[sofid] || '', (value) => handleYesNoChange(sofid, value))}

        </View>

      </View>
    );
  };

  const renderPatientResponse = () => {
    const hasError = !!fieldErrors['SOFID-13'];
    return (

      <View className="mt-3" key="patient-response-chips">
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text className="text-sm text-[#4b5f5a] mb-2"
            style={{ color: hasError ? '#EF4444' : '#rgb(44 74 67)', fontWeight: '500' }}
          >
            Patient Response During Session
          </Text>
           <Text style={{ color: 'red', fontSize: 16, fontWeight: '500', marginLeft: 5, marginBottom: 9 }}>
            *
          </Text>
        </View>
        <Chip
          items={[...PARTICIPANT_RESPONSES]}
          value={resp}
          onChange={handlePatientResponseChange}
          type="single"
        />
        {resp === 'Other' && renderTextField('SOFID-13-OTHER', 'Describe other response', 'Describe other response', true)}
      </View>
    );
  };

  if (loading) return <ActivityIndicator size="large" color="#4FC264" />;

  const groupedFields = groupFields(formFields);

  return (

    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 130 : 0}
    >
      <View className="px-4" style={{ paddingTop: 8 }}>
        <View className="bg-white border-b-2 border-gray-300 rounded-xl p-6 flex-row justify-between items-center shadow-sm">
          <Text className="text-lg font-bold text-green-600">Participant ID: {routePatientId}</Text>
          <Text className="text-base font-semibold text-green-600">Randomization ID: {randomizationId || "N/A"}</Text>
          <Text className="text-base font-semibold text-gray-700">Age: {age ?? 'Not specified'}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4 bg-bg pb-[400px]" style={{ paddingTop: 5 }} keyboardShouldPersistTaps="handled">
        <FormCard icon="S" title="Study Observation - Basic Information">

          <View className="flex-row flex-wrap gap-x-4 gap-y-3 mt-3">
            <View style={{ minWidth: '48%' }}>
              <Field
                label="Participant ID"
                placeholder={`Participant ID: ${formValues['SOFID-2'] || ''}`}
                value={formValues['SOFID-2'] || ''}
                editable={false}
              />
            </View>
            <View style={{ minWidth: '45%' }}>
              <DateField
                label="Date"
                value={formValues['SOFID-1']?.split('T')[0] || ''}
                onChange={(val) => updateFormValue('SOFID-1', val)}
                mode="date"
                placeholder="DD-MM-YYYY"
              />
            </View>

            {groupedFields.basic
              .filter((f) => f.SOFID !== 'SOFID-1' && f.SOFID !== 'SOFID-2')
              .map((f) => {
                if (f.SOFID === 'SOFID-5') {
                  return (
                    <View key={f.SOFID} className="flex-1" style={{ minWidth: '45%' }}>
                      <DropdownField
                        label="Session Week"
                        options={weekOptions}
                        value={formValues['SOFID-5'] || ''}
                        onValueChange={(val: string) => updateFormValue('SOFID-5', val)}
                        placeholder="Select week"
                      />
                    </View>
                  );
                } else {
                  return (
                    <View key={f.SOFID} className="flex-1" style={{ minWidth: '45%' }}>
                      {renderTextField(f.SOFID, f.FieldLabel)}
                    </View>
                  );
                }
              })}

          </View>

        </FormCard>


        <FormCard icon="B" title="Baseline Assessment & Scores">

          <View className="flex-row flex-wrap gap-3">
            <View className="flex-1 mt-3">
              <Text className="text-sm text-[#rgb(44 74 67)] mb-1">FACT G Score</Text>
              <View className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                {baselineLoading ? (
                  <ActivityIndicator size="small" color="#4FC264" />
                ) : (
                  <Text className="text-base text-gray-800">{(factGScore && factGScore !== '') ? factGScore : '0'}</Text>
                )}
              </View>
            </View>

            <View className="flex-1 mt-3">
              <Text className="text-sm text-[#rgb(44 74 67)] mb-1">Distress Thermometer Score</Text>
              <View className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                {baselineLoading ? (
                  <ActivityIndicator size="small" color="#4FC264" />
                ) : (
                  <Text className="text-base text-gray-800">{(distressScore && distressScore !== '') ? distressScore : '0'}</Text>
                )}
              </View>
            </View>


          </View>
        </FormCard>

        <Modal
          visible={showFactGForm}
          animationType="slide"
          transparent={true}
          onRequestClose={closeFactGModal}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 20,
                width: '98%',
                maxHeight: '80%',
                elevation: 8,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontWeight: '600', fontSize: 16, color: '#000' }}>
                 Fact G Baseline
                </Text>

                <Pressable
                  onPress={closeFactGModal}
                  style={{
                    backgroundColor: '#f87171',
                    borderRadius: 20,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '600' }}>Close</Text>
                </Pressable>
              </View>

              {/* Scrollable form */}
              <ScrollView showsVerticalScrollIndicator={false}>
                <FactGForm closeFactGModal={closeFactGModal}/>
              
              </ScrollView>
            </View>
          </View>
        </Modal>

         <Modal
          visible={showDistressBaselineForm}
          animationType="slide"
          onRequestClose={closeDistressBaselineForm}
          transparent={true}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 20,
                width: '98%',
                maxHeight: '80%',
                elevation: 8,
              }}
            >

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontWeight: '600', fontSize: 16, color: '#000' }}>
                  Distress Thermometer Baseline
                </Text>

                <Pressable onPress={closeDistressBaselineForm}
                  style={{
                    backgroundColor: '#f87171',
                    borderRadius: 20,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '600' }}>Close</Text>
                </Pressable>
              </View>
      
            <ScrollView showsVerticalScrollIndicator={false}> 
               
              <DistressBaselineForm closeDistressBaselineForm={closeDistressBaselineForm} />
                   
            </ScrollView>
          </View>
          </View>
        </Modal>

        <FormCard icon="S" title="Session Details & Responses">
          {renderYesNoField('SOFID-9', 'Was the session completed?')}
          {yesNoStates['SOFID-9'] === 'No' && renderTextField('SOFID-10', 'If No, specify reason')}
          <View className="flex-row gap-4 mt-3">
            {['SOFID-11', 'SOFID-12'].map((sofid) => {
              const field = formFields.find((f) => f.SOFID === sofid);
              if (!field) return null;

              return (
                <View key={sofid} className="flex-1">
                  <Text
                    className="text-sm"
                    style={{
                      color: fieldErrors[sofid] ? '#EF4444' : '#4b5f5a',
                    }}
                  >
                    {field.FieldLabel}
                  </Text>
                  <DateField
                    value={formValues[sofid] || ''}
                    onChange={(val) => updateFormValue(sofid, val)}
                    mode="time"
                    placeholder="HH:mm:ss"
                  />
                </View>
              );
            })}
          </View>


          {renderPatientResponse()}
          {renderYesNoField('SOFID-14', 'Any Technical Issues?')}
          {yesNoStates['SOFID-14'] === 'Yes' && renderTextField('SOFID-15', 'If Yes, describe technical issues', undefined, true)}
        </FormCard>

        <FormCard icon="C" title="Counselor Compliance">
          <View className="flex-col gap-4">
            {['SOFID-16', 'SOFID-17', 'SOFID-18'].map((sofid) => {
              const field = formFields.find((f) => f.SOFID === sofid);
              if (!field) return null;
              return (
                <View key={sofid}>
                  {renderYesNoField(sofid, field.FieldLabel)}
                </View>
              );
            })}
          </View>

          {renderYesNoField('SOFID-20', 'Was the patient able to follow instructions?')}
          {yesNoStates['SOFID-20'] === 'No' && renderTextField('SOFID-21', 'If No, explain instruction difficulties (optional)', undefined, true)}
        </FormCard>


        <FormCard icon="A" title="Additional Observations & Side Effects">
          {renderYesNoField('SOFID-22', 'Any visible signs of discomfort?')}
          {yesNoStates['SOFID-22'] === 'Yes' && renderTextField('SOFID-23', 'If Yes, describe discomfort (optional)', undefined, true)}
          {renderYesNoField('SOFID-24', 'Did the patient require assistance?')}
          {yesNoStates['SOFID-24'] === 'Yes' && renderTextField('SOFID-25', 'If Yes, explain assistance provided (optional)', undefined, true)}
          {renderYesNoField('SOFID-26', 'Any deviations from protocol?')}
          {yesNoStates['SOFID-26'] === 'Yes' && renderTextField('SOFID-27', 'If Yes, explain protocol deviations (optional)', undefined, true)}
          {renderTextField('SOFID-28', 'Other Observations (optional)', undefined, true)}
          <View style={{ height: 150 }} />
        </FormCard>

      </ScrollView>

      <BottomBar>
        <Btn variant="light" onPress={handleClear}>Clear</Btn>
        <Btn onPress={handleSave} disabled={saving || loading} className="font-bold text-base">
          {saving ? 'Saving...' : 'Save & Close'}
        </Btn>
      </BottomBar>
    </KeyboardAvoidingView>

  );
};

export default StudyObservation;
