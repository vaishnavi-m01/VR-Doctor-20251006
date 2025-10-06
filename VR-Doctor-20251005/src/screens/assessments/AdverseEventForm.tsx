import { useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import FormCard from '@components/FormCard';
import { Field } from '@components/Field';
import Segmented from '@components/Segmented';
import BottomBar from '@components/BottomBar';
import { Btn } from '@components/Button';
import { useNavigation, useRoute } from '@react-navigation/native';
import { DropdownField } from '@components/DropdownField';
import Chip from '@components/Chip';
import DateField from '@components/DateField';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation/types';
import { RouteProp } from '@react-navigation/native';
import {

    FORM_PLACEHOLDERS,

} from '../../constants/appConstants';
import { apiService } from 'src/services';
import Toast from "react-native-toast-message";
import { UserContext } from 'src/store/context/UserContext';
import { KeyboardAvoidingView } from 'react-native';
import { Platform } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { format, formatForDB } from 'src/utils/date';
import SignatureModal from '@components/SignatureModal';



interface AeSeverity {
    SeverityId?: string;
    SeverityName: string;
    Description: string;
    SortKey?: number;
    Status: number | string;
}

interface AeOutcome {
    OutcomeId?: string;
    OutcomeName: string;
    Description: string;
    SortKey?: number;
    Status: number | string;
}

interface AeImmediateAction {
    ActionId?: string;
    ActionName: string;
    Description: string;
    SortKey?: number;
    Status: number | string;
}

interface AdverseEventData {
    AEId?: string;
    ParticipantId?: string;
    DateOfReport?: string;
    OnsetDateTime?: string;
    ReportedByName?: string;
    ReportedByRole?: string;
    AEDescription?: string;
    VRSessionInProgress?: string;
    ContentType?: string;
    SessionInterrupted?: string;
    PhysicianNotifiedDateTime?: string;
    PhysicianNotifiedName?: string;
    VRRelated?: string;
    PreExistingContribution?: string;
    FollowUpPatientStatus?: string;
    InvestigatorSignature?: string;
    FollowUpVisitDate?: string;
    InvestigatorSignDate?: string;
    SeverityOutcomeData?: Array<{ SeverityId?: string; OutcomeId?: string }>;
    ImmediateActionData?: Array<{ ActionId?: string }>;
}


interface AdverseEventResponse {
    ResponseData: AdverseEventData[];
}

interface AddAdverseEventResponse {
    addAdverseEvent: {
        AEId: string;
        SeverityOutcomeIds: string[];
        ImmediateActionIds: string[];
        LatestSeverityOutcomeId: number;
        LatestImmediateActionId: number;
    };
}


interface Session {
    SessionNo: string;
    ParticipantId: string;
    StudyId: string;
    Description: string;
    SessionStatus: string;
    Status: number;
    CreatedBy: string;
    CreatedDate: string;
    ModifiedBy: string | null;
    ModifiedDate: string | null;
}

interface GetSessionsResponse {
    ResponseData: Session[];
}

export default function AdverseEventForm() {
    const today = new Date().toISOString().split("T")[0];
    console.log("today", today)

    const [reportDate, setReportDate] = useState("");
    console.log("reportDate", reportDate)
    const [dateOfAE, setdateOfAE] = useState("");
    const [timeOfAE, settimeOfAE] = useState("");
    const [_participantIdField, setParticipantIdField] = useState("");
    const [reportedBy, setReportedBy] = useState("");

    const [guidance, setGuidance] = useState('');
    const [completed, setCompleted] = useState('');
    const [vrContentType, setVrContentType] = useState("");

    const [physicianName, setPhysicianName] = useState("");
    const [aeRelated, setAeRelated] = useState<string | null>(null);
    const [conditionContribution, setConditionContribution] = useState<string | null>(null);
    const [randomizationId, setRandomizationId] = useState("");
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'AdverseEventForm'>>();
    const { patientId, age, studyId, RandomizationId } = route.params as { patientId: number, age: number, studyId: number, RandomizationId: string };

    const [aeOutcome, setAeOutcome] = useState<AeOutcome[]>([]);
    const [outcome, setOutcome] = useState<string[]>([]);
    console.log("outcome", outcome)

    const [aeImmediateAction, setAeImmediateAction] = useState<AeImmediateAction[]>([]);
    const [actions, setActions] = useState<string[]>([]);

    const [aeSeverity, setAeServerity] = useState<AeSeverity[]>([]);
    const [severity, setSeverity] = useState<string | null>(null);
    console.log("severityid", severity)
    const [Description, setdescription] = useState<string>("");
    const [investigatorSignature, setInvestigatorSignature] = useState<string | undefined>("");
    const [followUpParticipantStatus, setFollowUpParticipantStatus] = useState<string | undefined>("");

    const [followUpDate, setFollowUpDate] = useState("");
    const [date, setDate] = useState("");
    const [physicianDateTime, setPhysicianDateTime] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
    const [loading, setLoading] = useState(false);




    const [AEId, setAEId] = useState<string | null>(null);
    console.log("AEID", AEId)


    const { userId } = useContext(UserContext);

    const [availableSessions, setAvailableSessions] = useState<string[]>([]);
    const [sessionNo, setSessionNo] = useState<string | null>(null);
    console.log("sessionNo", sessionNo)
    const [selectedSession, setSelectedSession] = useState<string>("No session");
    const [showSessionDropdown, setShowSessionDropdown] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [activeSignature, setActiveSignature] = useState<{
        label: string;
        value: string;
        setValue: React.Dispatch<React.SetStateAction<string>>;
    } | null>(null);



    useEffect(() => {
        fetchAvailableSessions();
        // fetchRandomizationId(patientId.toString());
    }, []);

    const fetchAvailableSessions = async () => {
        try {
            const response = await apiService.post<GetSessionsResponse>("/GetParticipantVRSessions", {
                ParticipantId: patientId,
                StudyId: studyId,
            });

            const { ResponseData } = response.data;

            if (ResponseData && ResponseData.length > 0) {

                const sessions = ResponseData.map((s: any) =>
                    `Session ${s.SessionNo.replace("SessionNo-", "")}`
                );

                setAvailableSessions(sessions);


                if (!selectedSession || selectedSession === "No session") {

                    setSelectedSession(sessions[0]);
                    setSessionNo(ResponseData[0].SessionNo);
                }

            } else {
                setAvailableSessions(["No session"]);
                setSelectedSession("No session");
                setSessionNo(null);
            }
        } catch (error) {
            console.error("Error fetching sessions:", error);
            setAvailableSessions(["No session"]);
            setSelectedSession("No session");
            setSessionNo(null);
        }
    };

    // const fetchRandomizationId = async (participantIdParam: string) => {
    //     try {
    //         const response = await apiService.post('/GetParticipantDetails', {
    //             ParticipantId: participantIdParam,
    //         });

    //         console.log('Randomization ID API response:', response.data);
    //         const data = response.data?.ResponseData;
    //         console.log('Randomization ID data:', data);

    //         if (data && data.GroupTypeNumber) {
    //             console.log('Setting randomization ID:', data.GroupTypeNumber);
    //             setRandomizationId(data.GroupTypeNumber);
    //         } else {
    //             console.log('No GroupTypeNumber found in response');
    //         }
    //     } catch (error) {
    //         console.error('Error fetching randomization ID:', error);
    //     }
    // };

    const toggleOutcome = (id: string) => {
        setOutcome((prev) =>
            prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
        );
    };

    useEffect(() => {
        apiService
            .post<{ ResponseData: AeSeverity[] }>("/GetAeSeverityMaster")
            .then((res) => {
                setAeServerity(res.data.ResponseData || []);
            })
            .catch((err) => console.error(err))
    }, []);


    useEffect(() => {
        apiService
            .post<{ ResponseData: AeOutcome[] }>("/GetAeOutcomeMaster")
            .then((res) => {
                setAeOutcome(res.data.ResponseData || []);
            })
            .catch((err) => console.error(err));
    }, []);


    useEffect(() => {
        apiService
            .post<{ ResponseData: AeImmediateAction[] }>("/GetAeImmediateActionMaster")
            .then((res) => {
                setAeImmediateAction(res.data.ResponseData || []);
            })
            .catch((err) => console.error(err))
    }, []);



    useEffect(() => {
        if (!sessionNo) return;
        const fetchAeData = async () => {
            setLoading(true);
            try {
                // await fetchAvailableSessions();
                const res = await apiService.post<AdverseEventResponse>(
                    "/GetParticipantAdverseEvent",
                    { ParticipantId: `${patientId}`, SessionNo: sessionNo, StudyId: studyId }
                );

                if (res.data.ResponseData && res.data.ResponseData.length > 0) {
                    const ae = res.data.ResponseData[0];

                    setAEId(ae.AEId || "");
                    // if (ae.DateOfReport) {
                    //     const [datePart] = ae.DateOfReport.split(" "); // "2025-09-25"
                    //     const [year, month, day] = datePart.split("-");
                    //     setReportDate(`${day}-${month}-${year}`); // "25-09-2025"
                    // } else {
                    //     setReportDate("");
                    // }
                    setReportDate(format(ae.DateOfReport ?? ""))
                    setdateOfAE(format(ae.OnsetDateTime ?? "") || "");


                    settimeOfAE(
                        ae.OnsetDateTime
                            ? new Date(ae.OnsetDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : ""
                    );
                    setParticipantIdField(ae.ParticipantId || "");
                    setReportedBy(
                        ae.ReportedByRole
                            ? `${ae.ReportedByName} (${ae.ReportedByRole})`
                            : ae.ReportedByName || ""
                    );
                    setdescription(ae.AEDescription || "");
                    setCompleted(ae.VRSessionInProgress || "");
                    setVrContentType(ae.ContentType || "");
                    setGuidance(ae.SessionInterrupted || "");
                    // setPhysicianDateTime(ae.PhysicianNotifiedDateTime?.split("T")[0] || "");
                    setPhysicianDateTime(format(ae.PhysicianNotifiedDateTime ?? ""));
                    setPhysicianName(ae.PhysicianNotifiedName || "");
                    setAeRelated(ae.VRRelated || "");
                    setConditionContribution(ae.PreExistingContribution || "");
                    setFollowUpParticipantStatus(ae.FollowUpPatientStatus || "");
                    setInvestigatorSignature(ae.InvestigatorSignature || "");
                    setFollowUpDate(format(ae.FollowUpVisitDate ?? ""));
                    setDate(format(ae.InvestigatorSignDate ?? ""));



                    // -----------------------------
                    // Set severity, outcome, and actions from response
                    // -----------------------------
                    if (ae.SeverityOutcomeData && ae.SeverityOutcomeData.length > 0) {
                        // Assuming only one severity can be selected
                        setSeverity(ae.SeverityOutcomeData[0].SeverityId || "");

                        // Map outcome IDs
                        const outcomeIds = ae.SeverityOutcomeData?.map((o) => o.OutcomeId || "") || [];
                        setOutcome(outcomeIds);
                    }

                    if (ae.ImmediateActionData && ae.ImmediateActionData.length > 0) {
                        const actionIds = ae.ImmediateActionData?.map((a) => a.ActionId || "") || [];
                        setActions(actionIds);
                    }
                }

            } catch (err) {
                console.error("Error fetching AE data:", err);
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Failed to fetch AE data",
                    position: "top",
                    topOffset: 50,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAeData();
    }, [patientId, sessionNo, studyId]);


    const handleValidate = () => {
        const newErrors: { [key: string]: string } = {};

        // if (!reportDate) {
        //     newErrors.reportDate = "Report Date is required";
        // }

        // if (!dateOfAE) newErrors.dateOfAE = "Date of AE is required";
        // if (!timeOfAE) newErrors.timeOfAE = "Time of AE is required";

        // if (!reportedBy) {
        //     newErrors.reportedBy = "Reported By is required";
        // }

        if (!Description?.trim()) {
            newErrors.Description = "Description is required";
        }

        if (!completed) {
            newErrors.completed = "Completed field is required";
        }

        if (!vrContentType) {
            newErrors.vrContentType = "VR Content Type is required";
        }

        if (!guidance) {
            newErrors.guidance = "Guidance is required";
        }

        // if (!physicianDateTime) {
        //     newErrors.physicianDateTime = "Physician Date & Time is required";
        // }

        if (!physicianName?.trim()) {
            newErrors.physicianName = "Physician Name is required";
        }

        if (!aeRelated) {
            newErrors.aeRelated = "AE Related is required";
        }

        if (!conditionContribution) {
            newErrors.conditionContribution = "Condition Contribution is required";
        }

        // if (!followUpDate) newErrors.followUpDate = "Follow-up Date is required";

        if (!followUpParticipantStatus?.trim()) {
            newErrors.followUpParticipantStatus = "Follow-up Participant Status is required";
        }

        // if (!investigatorSignature?.trim()) {
        //     newErrors.investigatorSignature = "Investigator Signature is required";
        // }

        if (!severity) {
            newErrors.severity = "Severity is required";
        }

        if (outcome.length === 0) {
            newErrors.outcome = "Outcome cannot be empty";
        }

        if (actions.length === 0) {
            newErrors.actions = "Actions cannot be empty";
        }

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

        setReportDate("");
        setdateOfAE("");
        settimeOfAE("");
        setParticipantIdField("");
        setReportedBy("");
        setGuidance('');
        setCompleted('');
        setVrContentType('');
        setPhysicianDateTime("");
        setPhysicianName('');
        setAeRelated('');
        setConditionContribution('');
        setOutcome([]);
        setActions([]);
        setSeverity('');
        setdescription('');
        setFollowUpParticipantStatus('');
        setFollowUpDate('');
        setInvestigatorSignature('');
        setDate('');

        setAEId('');
        // setSelectedSession('Select Session');
    };

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#4FC264" />
                <Text style={{ marginTop: 8 }}>Loading questions…</Text>
            </View>
        );
    }



    const handleSave = async () => {

        if (!handleValidate()) return;
        try {
            const payload = {
                AEId: AEId || null,
                ParticipantId: String(patientId),
                SessionNo: sessionNo || "",
                StudyId: studyId,
                DateOfReport: reportDate ? formatForDB(reportDate) : today,
                ReportedByName: reportedBy.split("(")[0]?.trim() || "",
                ReportedByRole: reportedBy.match(/\((.*?)\)/)?.[1] || "",
                OnsetDateTime: dateOfAE ? formatForDB(dateOfAE) : today,
                AEDescription: Description,
                VRSessionInProgress: completed,
                ContentType: vrContentType,
                SessionInterrupted: guidance,
                PhysicianNotifiedDateTime:
                    physicianDateTime ? formatForDB(physicianDateTime) : today,
                PhysicianNotifiedName: physicianName,
                VRRelated: aeRelated,
                PreExistingContribution: conditionContribution,
                FollowUpVisitDate: followUpDate ? formatForDB(followUpDate) : today,

                FollowUpPatientStatus: followUpParticipantStatus,
                InvestigatorSignature: investigatorSignature || "",
                InvestigatorSignDate: date ? formatForDB(date) : today,

                SeverityOutcomeData: severity
                    ? outcome.map((outcomeId) => ({
                        SeverityId: severity,
                        OutcomeId: outcomeId || null,
                    }))
                    : [],

                immediateActionsData: actions.map((actionId) => ({
                    ActionId: actionId || null,
                })),

                SortKey: 0,
                Status: 1,
                CreatedBy: userId,
            };

            console.log("FINAL PAYLOAD", payload);

            const response = await apiService.post<AddAdverseEventResponse>(
                "/AddUpdateParticipantAdverseEvent",
                payload
            );

            if (response.data?.addAdverseEvent?.AEId) {
                setAEId(response.data?.addAdverseEvent?.AEId);
                console.log("Saved AEId:", response.data.addAdverseEvent.AEId);
            }

            if (response.status === 200) {
                Toast.show({
                    type: "success",
                    text1: AEId ? "Updated Successfully" : "Added Successfully",
                    text2: AEId
                        ? "Participant adverse event updated."
                        : "Participant adverse event added.",
                    position: "top",
                    topOffset: 50,
                    visibilityTime: 2000,
                    onHide: () => navigation.goBack(),
                });
            } else {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Something went wrong. Please try again.",
                    position: "top",
                    topOffset: 50,
                });
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error("Error saving participant:", errorMessage);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: `Failed to save participant: ${errorMessage}`,
                position: "top",
                topOffset: 50,
            });
        }
    };





    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >

            <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
                <View
                    style={{
                        backgroundColor: "white",
                        borderBottomWidth: 1,
                        borderBottomColor: "rgba(229, 231, 235, 1)",
                        borderRadius: 12,
                        padding: 17,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        shadowColor: "#000000",
                        shadowOpacity: 0.35,
                        shadowRadius: 1,
                        shadowOffset: { width: 0, height: 1 },
                    }}
                >

                    <View className="flex-1 flex-col">
                        <Text
                            style={{
                                color: "rgba(22, 163, 74, 1)",
                                fontWeight: "700",
                                fontSize: 18,
                                lineHeight: 28,
                            }}
                        >
                            Participant ID: {patientId}
                        </Text>
                        <Text
                            style={{
                                color: "rgba(22, 163, 74, 1)",
                                fontWeight: "600",
                                fontSize: 16,
                                lineHeight: 24,
                                marginTop:4
                            }}
                        >
                            Randomization ID: {RandomizationId || "N/A"}
                        </Text>
                    </View>


                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                        <Text style={{ color: "#4a5568", fontSize: 16, fontWeight: "600" }}>
                            Age: {age || "Not specified"}
                        </Text>

                        {/* Session Dropdown */}
                        <View style={{ width: 128 }}>
                            <Pressable
                                style={{
                                    backgroundColor: '#f8f9fa',
                                    borderColor: '#e5e7eb',
                                    borderWidth: 1,
                                    borderRadius: 8,
                                    paddingHorizontal: 12,
                                    paddingVertical: 8,
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                                onPress={() => setShowSessionDropdown(!showSessionDropdown)}
                            >
                                <Text style={{ fontSize: 14, color: "#374151" }}>
                                    {selectedSession || "Select Session"}
                                </Text>
                                <Text style={{ color: "#6b7280", fontSize: 12 }}>▼</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>

            {/* Session Dropdown Menu */}
            {showSessionDropdown && (
                <>
                    {/* Backdrop */}
                    <Pressable
                        className="absolute top-0 left-0 right-0 bottom-0 z-[9998]"
                        onPress={() => setShowSessionDropdown(false)}
                    />
                    <View
                        className="absolute top-20 right-6 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] w-32 max-h-48"
                        style={{ elevation: 10, maxHeight: 80, overflow: 'hidden' }}
                    >
                        <ScrollView style={{ maxHeight: 140 }}>
                            {availableSessions.map((session, index) => (
                                <Pressable
                                    key={session}
                                    className={`px-3 py-2 ${index < availableSessions.length - 1 ? 'border-b border-gray-100' : ''}`}
                                    onPress={() => {
                                        if (session !== "No session") {
                                            setSelectedSession(session);
                                            const sessionNumber = session.replace("Session ", "SessionNo-");
                                            setAEId(null);
                                            handleClear();

                                            setSessionNo(sessionNumber);
                                        } else {
                                            setSelectedSession("No session");
                                            setSessionNo(null);
                                            handleClear();
                                        }
                                        setShowSessionDropdown(false);
                                    }}



                                >
                                    <Text className="text-sm text-gray-700">
                                        {session}
                                    </Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                </>
            )}

            <ScrollView className="flex-1 px-4 bg-bg pb-[400px]" style={{ paddingTop: 5 }} keyboardShouldPersistTaps="handled"
            >
                <FormCard icon="AE" title="Adverse Event">
                    <View className="flex-row gap-3 mt-4">
                        <DateField label="Date of Report (Optional)" value={reportDate} onChange={setReportDate} />
                        <View className="flex-1"><Field
                            label="Participant ID (Optional)"
                            placeholder="e.g., PT-0234"
                            value={String(patientId)}
                            onChangeText={setParticipantIdField}
                        />
                        </View>
                    </View>
                    <View className="mt-4">
                        <Field
                            label="Reported By (Name & Role) (Optional)"
                            placeholder="e.g., Dr. John (Investigator)"
                            multiline
                            value={reportedBy}
                            error={errors.reportedBy}
                            onChangeText={setReportedBy}
                        />

                    </View>

                    <Text className="text-[12px] text-gray-500">
                        These fields mirror the form header (Date of Report, Participant ID, Reported By). All fields are optional.
                    </Text>

                </FormCard>

                <FormCard icon="1" title="Adverse Event Details">
                    <View className="flex-row gap-3 mt-4">
                        <DateField label="Date of AE onset" value={dateOfAE} onChange={setdateOfAE} />
                        <Field
                            label="Time of AE onset"
                            placeholder={FORM_PLACEHOLDERS.TIME}
                            value={timeOfAE}
                            onChangeText={settimeOfAE}
                        />
                    </View>
                    <View className="mt-4">
                        <Field
                            label={
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ color: '#2c4a43', fontSize: 14, fontWeight: '500' }}>
                                        Description (symptoms, severity)
                                    </Text>
                                     <Text style={{ color: 'red', fontSize: 16, fontWeight: '500', marginLeft: 5, marginBottom: 3 }}>
                                        *
                                    </Text>
                                </View>
                            }
                            placeholder="symptoms, context, severity..."
                            multiline
                            value={Description ?? ""}
                            error={errors?.Description}
                            onChangeText={setdescription}
                        />
                    </View>

                    <View className="mt-4">
                        <View className="flex-row justify-between items-center mb-2 ">
                            {/* <Text className="text-xs text-[#4b5f5a]">VR session in progress?</Text> */}
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text
                                    className={`text-md font-medium mb-2 ${errors.completed && !completed ? "text-red-500" : "text-[#2c4a43]"
                                        }`}
                                >
                                    VR session in progress?
                                </Text>
                                <Text style={{ color: 'red', fontSize: 16, fontWeight: '500', marginLeft: 5, marginBottom: 9 }}>
                                    *
                                </Text>
                            </View>
                        </View>
                        <View className="flex-row gap-2">
                            {/* Yes Button */}
                            <Pressable
                                onPress={() => {
                                    setCompleted('Yes');
                                    setErrors((prev) => ({ ...prev, completed: '' })); // clear error immediately
                                }}
                                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${completed === 'Yes' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                                    }`}
                            >
                                <Text className={`font-medium text-xs ${completed === 'Yes' ? 'text-white' : 'text-[#2c4a43]'}`}>
                                    Yes
                                </Text>
                            </Pressable>

                            {/* No Button */}
                            <Pressable
                                onPress={() => {
                                    setCompleted('No');
                                    setErrors((prev) => ({ ...prev, completed: '' })); // clear error immediately
                                }}
                                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${completed === 'No' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                                    }`}
                            >
                                <Text className={`font-medium text-xs ${completed === 'No' ? 'text-white' : 'text-[#2c4a43]'}`}>
                                    No
                                </Text>
                            </Pressable>
                        </View>


                    </View>
                    <View className="mt-6">
                        <DropdownField
                            label={
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ color: '#2c4a43', fontSize: 14, fontWeight: '500' }}>
                                        VR Content Type at AE
                                    </Text>
                                      <Text style={{ color: 'red', fontSize: 16, fontWeight: '500', marginLeft: 5, marginBottom: 6 }}>
                                        *
                                    </Text>
                                </View>
                            }
                            value={vrContentType}
                            error={errors?.vrContentType}
                            onValueChange={(val) => {
                                setVrContentType(val);
                                setErrors((prev) => ({ ...prev, vrContentType: "" }));
                            }}
                            options={[
                                { label: "Chemotherapy", value: "chemotherapy" },
                                { label: "Anxiety", value: "anxiety" },
                                { label: "Relaxation", value: "relaxation" },
                                { label: "Pain Management", value: "pain" },
                            ]}
                        />
                    </View>


                    <View className="flex-1  mt-4">
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text className={`text-md font-medium mb-2 ${errors.guidance && !guidance ? "text-red-500" : "text-[#2c4a43]"
                                }`}>Was the Session Interrupted?</Text>
                              <Text style={{ color: 'red', fontSize: 16, fontWeight: '500', marginLeft: 5, marginBottom: 9 }}>
                                *
                            </Text>
                        </View>

                        <View className="flex-row gap-2">
                            {/* Yes Button */}
                            <Pressable
                                onPress={() => {
                                    setGuidance('Yes');
                                    setErrors((prev) => ({ ...prev, guidance: "" }));
                                }}
                                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${guidance === 'Yes' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                                    }`}
                            >
                                <Text className={`font-medium text-xs ${guidance === 'Yes' ? 'text-white' : 'text-[#2c4a43]'}`}>Yes</Text>
                            </Pressable>

                            {/* No Button */}
                            <Pressable
                                onPress={() => {
                                    setGuidance('No');
                                    setErrors((prev) => ({ ...prev, guidance: "" })); // Clear error immediately
                                }}
                                className={`flex-1 flex-row items-center justify-center rounded-full py-3 px-2 ${guidance === 'No' ? 'bg-[#4FC264]' : 'bg-[#EBF6D6]'
                                    }`}
                            >
                                <Text className={`font-medium text-xs ${guidance === 'No' ? 'text-white' : 'text-[#2c4a43]'}`}>No</Text>
                            </Pressable>
                        </View>


                    </View>


                </FormCard>


                <FormCard icon="2" title=" Severity & Impact Assessment">

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text
                            className={`text-md font-medium mb-3 mt-4 ${errors.severity && !severity ? "text-red-500" : "text-[#2c4a43]"
                                }`}
                        >
                            AE Severity Level (Check One):
                        </Text>
                          <Text style={{ color: 'red', fontSize: 16, fontWeight: '500', marginLeft: 5, marginBottom: 7 }}>
                            *
                        </Text>
                    </View>

                    <View className="space-y-2">
                        {aeSeverity.map((item, index) => (
                            <TouchableOpacity
                                key={item.SeverityId || index}
                                onPress={() => {
                                    console.log("Selected SeverityId:", item.SeverityId);
                                    setSeverity(item.SeverityId || "");

                                    // Clear error immediately when user selects
                                    setErrors((prev) => ({ ...prev, severity: "" }));
                                }}
                                className="flex-row items-center px-3 py-2 rounded-xl border border-[#dce9e4]"
                            >
                                <View className="w-5 h-5 rounded-full border border-gray-400 items-center justify-center mr-2">
                                    {severity === item.SeverityId && (
                                        <View className="w-2.5 h-2.5 rounded-full bg-green-600" />
                                    )}
                                </View>

                                <Text className="text-sm text-gray-800">
                                    {item.SeverityName} ({item.Description})
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>


                    {/* Divider */}
                    <View className="h-px bg-gray-200 my-4 mb-4" />

                    {/* Outcome of AE */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text
                            className={`text-md font-medium mb-3 mt-2 ${errors.outcome && outcome.length === 0 ? "text-red-500" : "text-[#2c4a43]"
                                }`}
                        >
                            Outcome of AE:
                        </Text>
                        <Text style={{ color: 'red', fontSize: 16, fontWeight: '500', marginLeft: 5, marginBottom: 9 }}>
                            *
                        </Text>
                    </View>

                    <View className="flex flex-wrap flex-row gap-2">
                        {aeOutcome.map((item, index) => (
                            <TouchableOpacity
                                key={item.OutcomeId || index}
                                onPress={() => {
                                    toggleOutcome(item.OutcomeId || "");

                                    // Clear error immediately on selection
                                    setErrors((prev) => ({ ...prev, outcome: "" }));
                                }}
                                className="flex-row items-center px-3 py-2 rounded-xl border border-[#dbe8e3] bg-[#F6F7F7]"
                            >
                                <View className="w-5 h-5 border border-gray-400 rounded mr-2 items-center justify-center">
                                    {outcome.includes(item.OutcomeId!) && (
                                        <Text className="text-white text-xs font-bold bg-green-600 w-4 h-4 text-center rounded">
                                            ✓
                                        </Text>
                                    )}
                                </View>
                                <Text className="text-sm text-gray-800">{item.OutcomeName}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>


                </FormCard>
                <FormCard icon="3" title="Action Taken">
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text
                            className={`text-md font-medium mb-2 mt-4 ${errors.actions && actions.length === 0 ? "text-red-500" : "text-[#2c4a43]"
                                }`}
                        >
                            Immediate Action Taken (Check all that apply):
                        </Text>
                          <Text style={{ color: 'red', fontSize: 16, fontWeight: '500', marginLeft: 5, marginBottom: 5 }}>
                            *
                        </Text>
                    </View>

                    <Chip
                        items={aeImmediateAction.map((item) => ({
                            label: item.ActionName,
                            value: item.ActionId || "",
                        }))}
                        value={actions}
                        type="multiple"
                        onChange={(newActions) => {
                            console.log("Selected ActionIds:", newActions);
                            setActions(newActions);

                            if (newActions.length > 0) {
                                setErrors((prev) => ({ ...prev, actions: "" }));
                            }
                        }}
                    />



                    <View className="flex-row gap-3 mt-4">
                        <DateField label="Date physician notified" value={physicianDateTime} onChange={setPhysicianDateTime} />
                        <View className="flex-1">
                            <Field 
                                label={
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{ color: '#2c4a43', fontSize: 14, fontWeight: '500' }}>
                                            Physician name
                                        </Text>
                                         <Text style={{ color: 'red', fontSize: 16, fontWeight: '500', marginLeft: 5, marginBottom:0 }}>
                                            *
                                        </Text>
                                    </View>
                                }
                                placeholder="Dr. _____" 
                                value={physicianName} 
                                onChangeText={setPhysicianName} 
                                error={errors?.physicianName} 
                            />
                        </View>
                    </View>
                </FormCard>


                <FormCard icon="4" title="Causality Assessment">
                    <View className="mb-4 mt-4">
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text
                            className={`text-md font-medium mb-2 ${errors.aeRelated && !aeRelated ? "text-red-500" : "text-[#2c4a43]"
                                }`}
                        >
                            AE related to VR use?
                        </Text>
                        <Text style={{ color: 'red', fontSize: 16, fontWeight: '500', marginLeft: 5, marginBottom: 9 }}>
                            *
                        </Text>
                    </View>

                        <Segmented
                            options={[
                                { label: "Yes", value: "Yes" },
                                { label: "No", value: "No" },
                                { label: "Uncertain", value: "Uncertain" },
                            ]}
                            value={aeRelated || undefined}
                            onChange={(val) => {
                                setAeRelated(val);

                                setErrors((prev) => ({ ...prev, aeRelated: "" }));
                            }}
                        />
                    </View>


                    <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text
                                className={`text-md font-medium mb-2 ${errors.conditionContribution && !conditionContribution
                                    ? "text-red-500"
                                    : "text-[#2c4a43]"
                                    }`}
                            >
                                Pre-existing condition contribution?
                            </Text>
                            <Text style={{ color: 'red', fontSize: 16, fontWeight: '500', marginLeft: 5, marginBottom: 9 }}>
                                *
                            </Text>
                        </View>

                        <Segmented
                            options={[
                                { label: "Yes", value: "Yes" },
                                { label: "No", value: "No" },
                            ]}
                            value={conditionContribution || undefined}
                            onChange={(val) => {
                                setConditionContribution(val);
                                setErrors((prev) => ({ ...prev, conditionContribution: "" }));
                            }}
                        />
                    </View>

                </FormCard>


                <FormCard icon="5" title="Follow-Up & Resolution">
                    <View className="flex-row gap-3 mt-4">
                        <View className="flex-1">
                            <DateField label="Follow-up visit date" value={followUpDate} onChange={setFollowUpDate} />
                        </View>
                        <View className="flex-1">
                            {/* <Field label="signature of Investigator" placeholder="Sign/name" value={investigatorSignature} onChangeText={setInvestigatorSignature} error={errors?.investigatorSignature} /> */}

                            <TouchableOpacity
                                onPress={() => {
                                    setActiveSignature({
                                        label: "Signature of Investigator",
                                        value: investigatorSignature ?? "",
                                        setValue: setInvestigatorSignature,
                                    });
                                    setModalVisible(true);
                                }}
                            >
                                <Field
                                    label="Signature of Investigator"
                                    placeholder="Sign/name"
                                    value={investigatorSignature ? "Added" : ""}
                                    editable={false}
                                    error={errors?.investigatorSignature}
                                />
                            </TouchableOpacity>
                            {activeSignature && (
                                <SignatureModal
                                    label={activeSignature.label}
                                    visible={modalVisible}
                                    onClose={() => setModalVisible(false)}
                                    signatureData={activeSignature.value}
                                    setSignatureData={activeSignature.setValue}
                                />
                            )}


                        </View>
                    </View>

                    <View className="flex-row gap-3 mt-2">
                        <View className="flex-1">
                            <Field 
                                label={
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{ color: '#2c4a43', fontSize: 14, fontWeight: '500' }}>
                                            Participant status during follow-up
                                        </Text>
                                         <Text style={{ color: 'red', fontSize: 16, fontWeight: '500', marginLeft: 5, marginBottom: 0 }}>
                                            *
                                        </Text>
                                    </View>
                                }
                                placeholder="Notes on Clinical status..." 
                                multiline 
                                value={followUpParticipantStatus} 
                                onChangeText={setFollowUpParticipantStatus} 
                                error={errors?.followUpParticipantStatus} 
                            />
                        </View>
                        <View className="flex-1">
                            <DateField label="Date" value={date} onChange={setDate} />
                        </View>
                    </View>
                </FormCard>


                <View className="bg-[#fff] border border-[#fff] rounded-2xl shadow-card p-3 mb-3  items-start gap-3">

                    <Text className="text-base font-extrabold text-gray-800 mb-2">
                        Submission & Reporting
                    </Text>


                    <Text className="text-sm text-gray-700 leading-5">
                        Submit to: Co-Principal Investigator & Clinical Research Associate.
                        Serious AE (SAE): within 24 hours. Mild/Moderate AE: within 48 hours.
                    </Text>
                </View>

                {/* Extra space to ensure last content is not hidden by BottomBar */}
                <View style={{ height: 150 }} />

            </ScrollView>

            <BottomBar>
                {/* <Text className="px-3 py-2 rounded-xl bg-[#0b362c] text-white font-bold">AE Reporting: {String(ready)}</Text> */}

                <Btn variant="light" onPress={handleClear}>Clear</Btn>
                <Btn onPress={handleSave} className="font-bold text-base">Save & Close</Btn>
            </BottomBar>
        </KeyboardAvoidingView>
    );
}  