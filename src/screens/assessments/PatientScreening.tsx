import { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import FormCard from '@components/FormCard';
import Thermometer from '@components/Thermometer';
import { Field } from '@components/Field';
import DateField from '@components/DateField';
import Chip from '@components/Chip';
import BottomBar from '@components/BottomBar';
import { Btn } from '@components/Button';
import { useRoute, RouteProp, useNavigation, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../Navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiService } from 'src/services';
import Toast from 'react-native-toast-message';
import { formatForUI } from 'src/utils/date';
import { UserContext } from "../../store/context/UserContext";
import { KeyboardAvoidingView } from 'react-native';
import { Platform } from 'react-native';
import { Modal } from 'react-native';
import FactGForm from '@components/FactGForm';
import DistressBaselineForm from '@components/DistressBaselineForm';


interface ClinicalChecklist {
  PMEMID?: string;
  StudyId: string;
  ExeperiencType: string;
  SortKey?: number;
  Status: number;
}

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

export default function PatientScreening() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [dt, setDt] = useState(0);
  const [implants, setImplants] = useState('');
  const [prosthetics, setProsthetics] = useState('');

  const [_participantId, setParticipantId] = useState('');
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState<string>(today);
  const [pulseRate, setPulseRate] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [temperature, setTemperature] = useState('');
  const [bmi, setBmi] = useState('');
  // const [notes, setNotes] = useState('');

  const [clinicalChecklist, setClinicalChecklist] = useState<ClinicalChecklist[]>([]);
  console.log("clinicalCheckList", clinicalChecklist)
  const [conds, setConds] = useState<string[]>([]);
  console.log("condss", conds)
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
  const [PVID, setPVID] = useState<string | null>(null);
  const [PMSID, setPMSID] = useState<string | null>(null);
  const route = useRoute<RouteProp<RootStackParamList, 'PatientScreening'>>();
  const { patientId, age, studyId } = route.params as { patientId: number; age: number; studyId: number };
  const { userId } = useContext(UserContext);
  const [checked, setChecked] = useState(false);

  // Distress Thermometer state
  const [distressSelectedProblems, setDistressSelectedProblems] = useState<{ [key: string]: boolean }>({});

  const [factGScore, setFactGScore] = useState<string | null>(null);
  const [distressScore, setDistressScore] = useState<string | null>(null);
  const [baselineLoading, setBaselineLoading] = useState<boolean>(false);

  const [showFactGForm, setShowFactGForm] = useState(false);
  const [showDistressBaselineForm, setShowDistressBaselineForm] = useState(false);


  const openDistressBaselineForm = () => setShowDistressBaselineForm(true);
  const closeDistressBaselineForm = () => {
    console.log('closeDistressBaselineForm called');
    setShowDistressBaselineForm(false);
    // No need to fetch from API since we get the score directly from callback
  };

  const handleDistressScoreCalculated = (score: number) => {
    console.log('Distress Score Calculated:', score);
    setDistressScore(score.toString());
    setDt(score);
  };

  const routes = useRoute();
  const { CreatedDate: routeCreatedDate, PatientId: routePatientId } = (routes.params as any) ?? {};

  const [selectedCreatedDate, setSelectedCreatedDate] = useState<string | null>(routeCreatedDate ?? today ?? null);
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(routePatientId ?? patientId ?? null);



  useEffect(() => {
    apiService
      .post<{ ResponseData: ClinicalChecklist[] }>('/GetParticipantMedicalExperienceData')
      .then((res) => {
        setClinicalChecklist(res.data.ResponseData || []);
      })
      .catch((err) => console.error(err));
  }, []);


  useEffect(() => {
    if (routeCreatedDate && routeCreatedDate !== selectedCreatedDate) {
      setSelectedCreatedDate(routeCreatedDate);
    }
    if (routePatientId && routePatientId !== currentPatientId) {
      setCurrentPatientId(routePatientId);
    }
  }, [routeCreatedDate, routePatientId]);

  const fetchBaselineScores = async (patientId: string, studyId: string) => {
    setBaselineLoading(true);
    try {
      let factGScore = 0;
      let distressValue = '0';

      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // Fetch FACT-G data for today only
      console.log('Fetching Fact-G data for:', { StudyId: studyId, ParticipantId: patientId, CreatedDate: todayStr });
      const factGRes = await apiService.post('/getParticipantFactGQuestionBaseline', {
        StudyId: studyId,
        ParticipantId: patientId,
        CreatedDate: todayStr,
        SessionNo: "SessionNo-1",
      }) as { data: FactGResponse };

      console.log('Fact-G API Response:', factGRes.data);

      if (factGRes.data && factGRes.data.FinalScore) {
        const parsedScore = Number(factGRes.data.FinalScore);
        factGScore = isNaN(parsedScore) ? 0 : parsedScore;
        console.log('Fact-G Score parsed:', factGScore);
      } else {
        factGScore = 0;
        console.log('No Fact-G score found, setting to 0');
      }

      // Fetch distress score for today only
      console.log('Fetching Distress score for:', { ParticipantId: patientId, StudyId: studyId });
      const distressRes = await apiService.post('/GetParticipantDistressWeeklyScore', {
        ParticipantId: patientId,
        StudyId: studyId,
      }) as { data: DistressWeeklyResponse };

      console.log('Distress API Response:', distressRes.data);

      const todayDistress = distressRes.data.ResponseData.find(item => {
        if (!item.CreatedDate) return false;
        const itemDateStr = item.CreatedDate.split(' ')[0]; // Adjust if needed
        return itemDateStr === todayStr;
      });
      distressValue = todayDistress?.ScaleValue || '0';
      console.log('Today Distress found:', todayDistress);
      console.log('Distress Value:', distressValue);

      if (!todayDistress && distressRes.data.ResponseData.length > 0) {
        distressRes.data.ResponseData.sort((a, b) =>
          b.CreatedDate.localeCompare(a.CreatedDate)
        );
        distressValue = distressRes.data.ResponseData[0].ScaleValue || '0';
        console.log('Fallback distress value:', distressValue);
      }


      // Update the form and state values
      console.log('Setting Fact-G Score to:', factGScore.toString());
      console.log('Setting Distress Score to:', distressValue);
      setFactGScore(factGScore.toString());
      setDistressScore(distressValue);


    } catch (error) {
      setFactGScore('0');
      setDistressScore('0');

    } finally {
      setBaselineLoading(false);
    }
  };

    // useEffect(() => {
    //   const participantId = `${routePatientId}`;
    //   fetchBaselineScores(patientId, `${studyId}`);
    // }, [routePatientId, studyId, routeObservationId]);

  useEffect(() => {
    if (patientId && studyId) {
      fetchBaselineScores(patientId, studyId);
    }
  }, [patientId, studyId]);


  // Toggle distress problem selection
  const toggleDistressProblem = (problemId: string) => {
    setDistressSelectedProblems(prev => ({
      ...prev,
      [problemId]: !prev[problemId]
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const vitalsRes = await apiService.post('/GetParticipantVitals', {
          ParticipantId: patientId ?? '',

        });
        const v = (vitalsRes.data as any).ResponseData?.[0];
        if (v) {
          setPVID(v.PVID);
          setPulseRate(v.PulseRate || '');
          setBloodPressure(v.BP || '');
          setTemperature(v.Temperature || '');
          setBmi(v.BMI || '');
        }

        const screeningRes = await apiService.post('/GetParticipantMedicalScreening', {
          ParticipantId: patientId ?? '',
          StudyId: studyId ?? '',
        });
        const s = (screeningRes.data as any).ResponseData?.[0];
        console.log("PatientScreening", s)
        if (s) {
          setPMSID(s.PMSID || '');
          setDt(Number(s.DistressTherometerScore) || 0);
          setImplants(s.AnyElectranicImplantsLikeFacemaker || '');
          setProsthetics(s.AnyProstheticsAndOrthoticsDevice || '');
          setConds(
            s.MedicalExperienceTypes
              ? s.MedicalExperienceTypes.split(',').map((item: any) => item.trim())
              : []
          );
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };


    fetchData();
  }, []);


  const handleBloodPressureChange = (text: string) => {
    let clean = text.replace(/[^0-9]/g, ""); // digits only
    if (clean.length > 5) clean = clean.slice(0, 5); // max 5 numbers (### + ##)

    let formatted = clean;
    if (clean.length > 3) {
      formatted = clean.slice(0, 3) + "/" + clean.slice(3);
    }
    setBloodPressure(formatted);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!pulseRate.trim()) newErrors.pulseRate = "Pulse Rate is required";
    else if (pulseRate.length > 3) newErrors.pulseRate = "Max 3 digits";

    if (!bloodPressure.trim()) {
      newErrors.bloodPressure = "Blood Pressure is required";
    } else if (!/^\d{2,3}\/\d{2,3}$/.test(bloodPressure)) {
      newErrors.bloodPressure = "Format must be 120/80";
    }

    if (!temperature.trim()) newErrors.temperature = "Temperature is required";
    else if (temperature.length > 5) newErrors.temperature = "Max 5 chars";

    if (!bmi.trim()) newErrors.bmi = "BMI is required";
    else if (bmi.length > 5) newErrors.bmi = "Max 5 chars";

    // if (!dt || dt === 0) newErrors.dt = "Distress Thermometer score is required";

    if (!implants) {
      newErrors.implants = "Select Yes/No for implants";
    }
    if (!prosthetics) {
      newErrors.prosthetics = "Select Yes/No for prosthetics";
    }
    // if (conds.length === 0) {
    //   newErrors.conds = "This field required"
    // }

    // if (!factGScore || factGScore.trim() === "") {
    //   newErrors.factGScore = "This field required";
    // } else {
    //   newErrors.factGScore = "";
    // }



    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fill all required fields",
        position: "top",
        topOffset: 50,
      });
      return false;
    }

    Toast.show({
      type: "success",
      text1: "Validation Passed",
      text2: "All required fields are valid",
      position: "top",
      topOffset: 50,
    });

    return true;
  };



  const handleClear = () => {
    setDt(0);
    setPulseRate("");
    setBloodPressure("");
    setTemperature("");
    setBmi("");

    setImplants("");
    setProsthetics("");
    setConds([]);
    setErrors({});
    // setFactGScore(""); 
    // setNotes(""); 
    setDate(today);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      // payload for vitals
      const vitalsPayload = {
        PVID: PVID || null,
        ParticipantId: `${patientId}`,
        StudyId: `${studyId}`,
        PulseRate: pulseRate,
        BP: bloodPressure,
        Temperature: temperature,
        BMI: bmi,
        SortKey: '0',
        Status: '1',
        ModifiedBy: userId,
      };

      console.log('Vitals Payload:', vitalsPayload);

      const vitalsRes = await apiService.post('/AddUpdateParticipantVitals', vitalsPayload);
      console.log('Vitals Saved:', vitalsRes.data);

      //   Screening Score
      const selectedExperiences = clinicalChecklist
        .filter((item) => conds.includes(item.ExeperiencType))
        .map((item) => item.PMEMID)
        .join(',');

      const ParticipantMedicalScreening = {

        PMSID: PMSID || null,
        ParticipantId: `${patientId}`,
        StudyId: `${studyId}`,
        DistressTherometerScore: String(dt),
        AnyElectranicImplantsLikeFacemaker: implants,
        AnyProstheticsAndOrthoticsDevice: prosthetics,
        AnyMedicalExperience: selectedExperiences,
        SortKey: '1',
        Status: '1',
        ModifiedBy: userId,
      };

      console.log('Score Payload:', ParticipantMedicalScreening);

      const scoreRes = await apiService.post('/AddUpdateParticipantMedicalScreening', ParticipantMedicalScreening);
      console.log('Score Saved:', scoreRes.data);

      Toast.show({
        type: 'success',
        text1: PMSID ? 'Updated Successfully' : 'Added Successfully',
        text2: 'Patient screening saved successfully!',
        position: "top",
        topOffset: 50,
        visibilityTime: 1000,
        onHide: () => navigation.goBack(),
      });

    } catch (err) {
      console.error('Save error:', err);

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save patient screening.',
        position: 'top',
        topOffset: 50,
      });
    }
  };


  const closeFactGModal = () => {
    console.log('closeFactGModal called');
    setShowFactGForm(false);
    // No need to fetch from API since we get the score directly from callback
  };

  const handleFactGScoreCalculated = (score: number) => {
    console.log('Fact-G Score Calculated:', score);
    setFactGScore(score.toString());
  };




  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View className="px-4 pb-1" style={{ paddingTop: 8 }}>

        <View className="bg-white border-b-2 border-gray-300 rounded-xl p-6 flex-row justify-between items-center shadow-sm">
          <Text className="text-lg font-bold text-green-600">
            Participant ID: {patientId}
          </Text>

          <Text className="text-base font-semibold text-green-600">
            Study ID: {studyId || "N/A"}
          </Text>

          <Text className="text-base font-semibold text-gray-700">
            Age: {age || "Not specified"}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 bg-bg pb-[400px]" keyboardShouldPersistTaps="handled">
        <FormCard icon="D" title="Patient Screening">
          <View className="flex-row gap-3 mt-4">
            <View className="flex-1">
              <Field
                label="Participant ID"
                placeholder={`Participant ID: ${patientId}`}
                value={`${patientId}`}
                editable={false}
                onChangeText={setParticipantId}

              />
            </View>
            <View className="flex-1">
              <DateField label="Date" value={formatForUI(date)} onChange={setDate} />
            </View>

          </View>
        </FormCard>

        <FormCard icon="I" title="Medical Details">
          <View className="flex-row gap-3 mb-2">
            <Pressable className="flex-1 px-4 py-3 bg-[#0ea06c] rounded-lg" onPress={() => setShowFactGForm(true)}>
              <Text className="text-sm text-white font-medium text-center">
                Fact-G scoring 0-108
              </Text>
            </Pressable>
            <Pressable className="flex-1 px-4 py-3 bg-[#0ea06c] rounded-lg" onPress={openDistressBaselineForm}>
              <Text className="text-sm text-white font-medium text-center">
                Distress Thermometer scoring 0-10
              </Text>
            </Pressable>
          </View>

          <Field
            label="Fact-G Total Score"
            keyboardType="number-pad"
            value={factGScore?.toString() || ''}
            onChangeText={(text) => {
              setFactGScore(text);
              if (errors.factGScore) {
                setErrors((prev) => ({ ...prev, factGScore: "" }));
              }
            }}
            error={errors.factGScore}
            placeholder="Enter Fact-G Total Score (0-108)"
          />

          <Field
            label="Distress Thermometer Value"
            keyboardType="number-pad"
            value={dt?.toString() || ''}
            onChangeText={(text) => {
              setDt(text);
              if (errors.dt) {
                setErrors((prev) => ({ ...prev, dt: "" }));
              }
            }}
            error={errors.dt}
            placeholder="Enter Distress Value (0-10)"
          />

          <Modal
            visible={showFactGForm}
            animationType="slide"
            onRequestClose={closeFactGModal}
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
                    Fact G Baseline
                  </Text>

                  <Pressable onPress={closeFactGModal}
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
                  <FactGForm closeFactGModal={closeFactGModal} onScoreCalculated={handleFactGScoreCalculated} />
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
                    <DistressBaselineForm closeDistressBaselineForm={closeDistressBaselineForm} onScoreCalculated={handleDistressScoreCalculated} />
                </ScrollView>
              </View>

            </View>
          </Modal>

          <Text className="text-lg mt-3 font-semibold">Vitals</Text>
          <View className="flex-row gap-3 mt-3">
            <View className="flex-1">

              <Field
                label={
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: '#2c4a43', fontSize: 14, fontWeight: '500' }}>
                      Pulse Rate (bpm)
                    </Text>
                    <Text style={{ color: 'red', fontSize: 14, fontWeight: '500', marginLeft: 2 }}>
                      *
                    </Text>
                  </View>
                }
                placeholder="76"
                error={errors.pulseRate}
                value={pulseRate}
                onChangeText={setPulseRate}
                keyboardType="numeric"
                maxLength={3}
                textAlign="right"
              />
            </View>

            <View className="flex-1">

              <Field
                label={
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: '#2c4a43', fontSize: 14, fontWeight: '500' }}>
                      Blood Pressure (mmHg)
                    </Text>
                    <Text style={{ color: 'red', fontSize: 14, fontWeight: '500', marginLeft: 2 }}>
                      *
                    </Text>
                  </View>
                }
                placeholder="120/80"
                error={errors.bloodPressure}
                value={bloodPressure}
                onChangeText={handleBloodPressureChange}
                keyboardType="numeric"
                textAlign="right"
              />
            </View>

            <View className="flex-1">
              <Field
                label={
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: '#2c4a43', fontSize: 14, fontWeight: '500' }}>
                      Temperature (°C)
                    </Text>
                    <Text style={{ color: 'red', fontSize: 14, fontWeight: '500', marginLeft: 2 }}>
                      *
                    </Text>
                  </View>
                }
                error={errors.temperature}
                placeholder="36.8"
                value={temperature}
                onChangeText={setTemperature}
                keyboardType="decimal-pad"
                maxLength={5}
                textAlign="right"
              />
            </View>

            <View className="flex-1">
              <Field
                label={
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: '#2c4a43', fontSize: 14, fontWeight: '500' }}>
                      BMI
                    </Text>
                    <Text style={{ color: 'red', fontSize: 14, fontWeight: '500', marginLeft: 2 }}>
                      *
                    </Text>
                  </View>
                }
                error={errors.bmi}
                placeholder="22.5"
                value={bmi}
                onChangeText={setBmi}
                keyboardType="decimal-pad"
                maxLength={5}
                textAlign="right"
              />

            </View>


          </View>
        </FormCard>

        <FormCard icon="⚙️" title="Devices">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  className={`text-md font-medium mb-2 ${errors.implants && !implants ? "text-red-500" : "text-[#2c4a43]"
                    }`}
                >
                  Any electronic implants?
                </Text>
                <Text style={{ color: 'red', fontSize: 16, fontWeight: '500', marginLeft: 2 }}>
                  *
                </Text>
              </View>

              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setImplants("Yes")}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${implants === "Yes" ? "bg-[#4FC264]" : "bg-[#EBF6D6]"
                    }`}
                >
                  <Text className={`font-medium text-xs ${implants === "Yes" ? "text-white" : "text-[#2c4a43]"}`}>Yes</Text>
                </Pressable>

                <Pressable
                  onPress={() => setImplants("No")}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${implants === "No" ? "bg-[#4FC264]" : "bg-[#EBF6D6]"
                    }`}
                >
                  <Text className={`font-medium text-xs ${implants === "No" ? "text-white" : "text-[#2c4a43]"}`}>No</Text>
                </Pressable>
              </View>
            </View>



            <View className="flex-1">
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  className={`text-md font-medium mb-2 ${errors.prosthetics && !prosthetics ? "text-red-500" : "text-[#2c4a43]"
                    }`}
                >
                  Any prosthetics or orthotics device?
                </Text>
                <Text style={{ color: 'red', fontSize: 16, fontWeight: '500', marginLeft: 2 }}>
                  *
                </Text>
              </View>

              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setProsthetics("Yes")}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${prosthetics === "Yes" ? "bg-[#4FC264]" : "bg-[#EBF6D6]"
                    }`}
                >
                  <Text className={`font-medium text-xs ${prosthetics === "Yes" ? "text-white" : "text-[#2c4a43]"}`}>Yes</Text>
                </Pressable>

                <Pressable
                  onPress={() => setProsthetics("No")}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${prosthetics === "No" ? "bg-[#4FC264]" : "bg-[#EBF6D6]"
                    }`}
                >
                  <Text className={`font-medium text-xs ${prosthetics === "No" ? "text-white" : "text-[#2c4a43]"}`}>No</Text>
                </Pressable>
              </View>
            </View>

          </View>
        </FormCard>

        {/* <FormCard
          // icon="✔︎"
          title="Clinical Checklist"
          error={errors.conds ? true : false}
        > */}

        <View
          className="bg-[#fff] border border-[#fff] rounded-2xl shadow-card mb-2 mt-2"
          style={{ padding: 16 }}
        >
          {/* Title row with checkbox */}
          <View className="flex-row items-center mb-2">
            <Pressable
              onPress={() => setChecked(!checked)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                borderWidth: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: checked ? '#22c55e' : '#fff',
                borderColor: checked ? '#16a34a' : '#bec1c7ff',
                marginRight: 8,
              }}
            >
              {checked && <Text style={{ color: '#fff', fontWeight: 'bold' }}>✔︎</Text>}
            </Pressable>

            <Text className={`text-base font-semibold mt-1 ${errors.conds ? "text-red-500" : "text-[#0b1f1c]"}`}
            >Clinical Checklist</Text>
          </View>

          {/* Chip row below */}
          <View className="mt-2">
            <Chip
              items={clinicalChecklist.map((item) => item.ExeperiencType)}
              value={conds}
              onChange={(selected) => {
                setConds(selected);
                if (errors.conds && selected.length > 0) {
                  setErrors((prev) => ({ ...prev, conds: "" }));
                }
              }}
            />
          </View>

          <View style={{ height: 150 }} />
        </View>




        {/* </FormCard> */}


      </ScrollView>

      <BottomBar>
        <Btn variant="light" onPress={handleClear} className="py-4">
          Clear
        </Btn>
        <Btn onPress={handleSave} className="py-4 font-bold text-base">
          Save & Close
        </Btn>
      </BottomBar>
    </KeyboardAvoidingView>
  );
}


