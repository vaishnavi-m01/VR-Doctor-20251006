import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
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

/* ---------------------- Types ---------------------- */

interface InformedConsentFormProps {
  patientId?: number;
  age?: number;
  studyId?: number;
}

interface ConsentMasterItem {
  ICMID: string;
  StudyId: string;
  QuestionName: string;
  SortKey: number;
  Status: number;
}

/* ---------------------- Helpers ---------------------- */

// Use same auth path as your working screen: calls go through apiService (Authorization via interceptor)
const asStr = (v: any) => (v == null ? '' : String(v));

/** CS-0001 format – mirrors your working page approach */
const formatStudyId = (sid: string | number) => {
  const s = sid?.toString?.() ?? '';
  return s.startsWith('CS-') ? s : `CS-${s.padStart(4, '0')}`;
};

/** API returns raw base64; UI needs a data URI */
const ensureDataUri = (rawOrUri?: string) => {
  if (!rawOrUri) return '';
  return rawOrUri.startsWith('data:image') ? rawOrUri : `data:image/png;base64,${rawOrUri}`;
};

/** Server expects data URI on POST (as per your working payload) */
const signatureForPost = (maybeRawOrUri?: string) => ensureDataUri(maybeRawOrUri);

/** DD/MM/YYYY today */
const todayDDMMYYYY = () => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export default function InformedConsentForm({}: InformedConsentFormProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'InformedConsent'>>();

  const { patientId, age, studyId } = route.params as {
    patientId: number;
    age: number;
    studyId: number;
  };

  /* ---------------------- Study & participant ---------------------- */
  const [studyTitle, setStudyTitle] = useState(
    'An exploratory study to assess the effectiveness of Virtual Reality assisted Guided Imagery on QoL of cancer patients undergoing chemo-radiation treatment'
  );
  const [studyNumber, setStudyNumber] = useState<string | number>(studyId ?? '');

  const [participantName, setParticipantName] = useState('');
  const [ageInput, setAgeInput] = useState(age ? String(age) : '');
  const [qualification, setQualification] = useState('');

  const { userId } = useContext(UserContext);

  /* ---------------------- Consent state ---------------------- */
  const [PICDID, setPICDID] = useState<string | null>(null);

  // signatures (UI keeps data URIs so they preview fine)
  const [subjectSignaturePad, setSubjectSignaturePad] = useState('');
  const [coPISignaturePad, setCoPISignaturePad] = useState('');
  const [witnessSignaturePad, setWitnessSignaturePad] = useState('');

  const [consentMaster, setConsentMaster] = useState<ConsentMasterItem[]>([]);
  const [acks, setAcks] = useState<Record<string, boolean>>({});
  const [agree, setAgree] = useState(false);

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const [signatures, setSignatures] = useState({
    subjectName: '',
    subjectDate: todayDDMMYYYY(),
    coPIName: '',
    coPIDate: todayDDMMYYYY(),
    investigatorName: '',
    witnessName: '',
    witnessDate: todayDDMMYYYY(),
  });
  const setSig = (k: keyof typeof signatures, v: string) =>
    setSignatures((p) => ({ ...p, [k]: v }));

  const toggleAck = (id: string) => setAcks((prev) => ({ ...prev, [id]: !prev[id] }));

  /* ---------------------- Load consent master (authorized via apiService) ---------------------- */
  useEffect(() => {
    apiService
      .post<{ ResponseData: ConsentMasterItem[] }>('/GetInformedConsentMaster')
      .then((res) => setConsentMaster(res.data.ResponseData?.sort((a, b) => a.SortKey - b.SortKey) || []))
      .catch((err) => console.error('Master load error:', err));
  }, []);

  /* ---------------------- Participant details (authorized) ---------------------- */
  useFocusEffect(
    React.useCallback(() => {
      const fetchParticipantDetails = async () => {
        try {
          const res = await apiService.post<any>('/GetParticipantDetails', {
            ParticipantId: patientId,
          });
          const data = res.data?.ResponseData;
          if (data) {
            setQualification(data.EducationLevel ?? '');
            setParticipantName(data.Signature ?? '');
            setAgeInput(data.Age ? String(data.Age) : '');
            if (data.Signature) setSubjectSignaturePad(ensureDataUri(data.Signature));
          }
        } catch (err) {
          console.error('Participant details error:', err);
        }
      };
      if (patientId) fetchParticipantDetails();
    }, [patientId])
  );

  /* ---------------------- Remove ack error once all are ticked ---------------------- */
  useEffect(() => {
    const allInitialed = consentMaster.every((it) => acks[it.ICMID]);
    if (allInitialed) {
      setErrors((prev) => {
        const { allInitialed: _remove, ...rest } = prev;
        return rest;
      });
    }
  }, [acks, consentMaster]);

  /* ---------------------- Validate ---------------------- */
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const hasAnyInitialed = Object.keys(acks).length > 0 && Object.values(acks).some(Boolean);
    if (!hasAnyInitialed) newErrors.allInitialed = 'Please initial at least one required section';
    if (!agree) newErrors.agree = 'Please agree to the terms and conditions';

    if (!signatures.coPIName?.trim()) newErrors.coPIName = 'Co-PI name is required';
    if (!signatures.investigatorName?.trim()) newErrors.investigatorName = 'Study Investigator name is required';
    if (!signatures.witnessName?.trim()) newErrors.witnessName = 'Witness name is required';

    if (!signatures.coPIDate?.trim()) newErrors.coPIDate = 'Co-PI signature date is required';
    if (!signatures.witnessDate?.trim()) newErrors.witnessDate = 'Witness signature date is required';

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

  /* ----------- Clear ------------ */
  const handleClear = () => {
    setAcks({});
    setAgree(false);
    setSignatures({
      subjectName: '',
      subjectDate: todayDDMMYYYY(),
      coPIName: '',
      coPIDate: todayDDMMYYYY(),
      investigatorName: '',
      witnessName: '',
      witnessDate: todayDDMMYYYY(),
    });
    setSubjectSignaturePad('');
    setCoPISignaturePad('');
    setWitnessSignaturePad('');
    setPICDID(null);
    setErrors({});
  };

  /* ---------------------- Save (authorized via apiService) ---------------------- */
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const formattedStudyId = formatStudyId(studyId ?? '0001');
      const questionIds = Object.keys(acks).filter((qid) => acks[qid]);

      const payload = {
        PICDID: PICDID || '',
        StudyId: formattedStudyId,
        ParticipantId: asStr(patientId),
        QuestionId: questionIds.join(','),
        Response: 1,
        SubjectSignatoryName: signatures.subjectName || 'John Doe',
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

      // Authorization header comes from apiService interceptor (same as your working screen)
      const res = await apiService.post('/AddUpdateParticipantInformedConsent', payload);

      if (res?.data) {
        Toast.show({
          type: 'success',
          text1: PICDID ? 'Updated Successfully' : 'Added Successfully',
          text2: 'Consent form submitted successfully',
          position: 'top',
          topOffset: 50,
          visibilityTime: 1000,
          onHide: () => navigation.goBack(),
        });
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to save consent form' });
      }
    } catch (error: any) {
      console.error('❌ Save error', error?.response?.data || error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.',
      });
    }
  };

  /* ---------------------- Load existing consent (authorized) ---------------------- */
  useEffect(() => {
    const fetchConsent = async () => {
      try {
        // Your confirmed working pattern: POST with ParticipantId only
        const consentRes = await apiService.post<any>('/GetParticipantInformedConsent', {
          ParticipantId: asStr(patientId),
        });

        const c = consentRes?.data?.ResponseData?.[0];
        if (!c) return;

        setPICDID(c.PICDID || null);

        // Acks
        const qids: string[] = Array.isArray(c.QuestionId) ? c.QuestionId : [c.QuestionId];
        const savedAcks: Record<string, boolean> = {};
        qids.filter(Boolean).forEach((qid) => (savedAcks[qid] = true));
        setAcks(savedAcks);

        setAgree(c.Response === 1);

        // Names/Dates
        setSignatures({
          subjectName: c.SubjectSignatoryName || '',
          subjectDate: c.SubjectSignatureDate ? formatDateDDMMYYYY(c.SubjectSignatureDate) : todayDDMMYYYY(),
          coPIName: c.CoPrincipalInvestigatorSignatoryName || '',
          coPIDate: c.CoPrincipalInvestigatorDate ? formatDateDDMMYYYY(c.CoPrincipalInvestigatorDate) : todayDDMMYYYY(),
          investigatorName: c.StudyInvestigatorName || '',
          witnessName: c.WitnessName || '',
          witnessDate: c.WitnessDate ? formatDateDDMMYYYY(c.WitnessDate) : todayDDMMYYYY(),
        });

        // Signatures (GET returns raw base64 → make data URIs for UI)
        setSubjectSignaturePad(ensureDataUri(c.SubjectSignature || ''));
        setCoPISignaturePad(ensureDataUri(c.CoPrincipalInvestigatorSignature || ''));
        setWitnessSignaturePad(ensureDataUri(c.WitnessSignature || ''));

        // Optional info
        if (c.ParticipantName) setParticipantName(c.ParticipantName);
        if (c.Qualification) setQualification(c.Qualification);
        if (c.Age) setAgeInput(String(c.Age));
        if (c.StudyTitle) setStudyTitle(c.StudyTitle);
        if (c.StudyNumber) setStudyNumber(c.StudyNumber);
      } catch (err) {
        console.error('❌ Fetch consent error:', err);
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load consent data' });
      }
    };

    fetchConsent();
  }, [patientId]);

  /* ============================ UI ============================ */
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

          <View className="grid md:flex md:flex-row md:space-x-4">
            <View className="flex-1 mb-4">
              <Text className="text-md font-medium text-[#2c4a43]  mb-2">Study Number</Text>
              <View className="bg-white border border-[#e6eeeb] rounded-2xl p-3">
                <TextInput
                  value={String(studyNumber ?? '')}
                  onChangeText={setStudyNumber as any}
                  placeholder="Auto / Enter study number"
                  placeholderTextColor="#9ca3af"
                  className="text-base text-[#0b1f1c]"
                />
              </View>
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
                label="Qualification"
                placeholder="Education / Qualification"
                value={qualification}
                editable={false}
              />
            </View>
          </View>
        </FormCard>

        {/* Acknowledgements */}
        <FormCard icon="C" title="Consent Acknowledgements (Initial each) *" error={!!errors.allInitialed}>
          {consentMaster.map((s, idx) => (
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
          ))}

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
        <Btn onPress={handleSubmit} className="font-bold text-base">
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
