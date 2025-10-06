import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "src/Navigation/types";
import Icon from 'react-native-vector-icons/FontAwesome';


type ObservationStatus = "Motion Sickness with Nausea" | "Eye Strain and Headache" | "Severe Motion Sickness" | "Mild Dizziness" | "Anxiety Attack" | "Equipment Malfunction" | "Mild Nausea" | "complete" | "incomplete" | "flagged" | "pending";



type Observation = {
    id: string;
    weekNumber: number;
    observationDate: Date;
    status: ObservationStatus;
    observerName: string;
    EventDescription: string[];
    ActionsTake: string[];
    actionItems: Array<"Nausea" | "Dizziness" | "Disorientation" | "Eye Strain" | "Headache" | "Anxiety" | "Follow-up" | "Monitor" | "Alert">;
    notes?: string;
    VRSessionContext: {
        OnsetTime: string,
        Duration: string,
        VRProgram: string
    },
    ReportID: string,
    duration: string;
    completionPercentage?: number;
    alertsRaised?: string | number;
    categories?: Record<string, any>;
    keyObservations?: string[];
};

const OBSERVATIONS: Observation[] = [
    {
        id: "12",
        weekNumber: 18,
        observationDate: new Date("2024-01-15T14:30:00"),
        status: "Motion Sickness with Nausea",
        observerName: "Dr. Raghavender",

        EventDescription: [
            "Patient experienced sudden onset nausea and dizziness approximately 15 minutes into VR session. Symptoms persisted for 20 minutes post-session."
        ],

        actionItems: ["Nausea", "Dizziness", "Disorientation"],
        VRSessionContext: {
            OnsetTime: "15 min into session",
            Duration: "20 min post-session",
            VRProgram: "Ocean",
        },
        ActionsTake: [
            "Session duration reduced",
            "VR headset cleaned and adjusted",
            "Patient advised to take breaks",
            "Lighting conditions reviewed"
        ],
        ReportID: "AE-2024-007",
        duration: "moderate",
        alertsRaised: "investigating",
    },
    {
        id: "11",
        weekNumber: 18,
        observationDate: new Date("2024-01-15T14:30:00"),
        status: "Eye Strain and Headache",
        observerName: "Dr. Raghavender",

        EventDescription: [
           "Patient reported mild eye strain and frontal headache during VR session. Symptoms resolved within 10 minutes of session completion."
        ],

        actionItems: ["Eye Strain", "Headache"],
        VRSessionContext: {
            OnsetTime: "25 min into session",
            Duration: "10 min post-session",
            VRProgram: "Pain",
        },
        ActionsTake: [
            "Session duration reduced",
            "VR headset cleaned and adjusted",
            "Patient advised to take breaks",
            "Lighting conditions reviewed"
        ],
        ReportID: "AE-2024-006",
        duration: "minor",
        alertsRaised: "resolved",
    },
    {
        id: "10",
        weekNumber: 18,
        observationDate: new Date("2024-01-15T14:30:00"),
        status: "Severe Motion Sickness",
        observerName: "Dr. Raghavender",

        EventDescription: [
           "Patient experienced severe motion sickness with vomiting during beach VR experience. Required immediate medical attention and session termination."
        ],

        actionItems: ["Nausea", "Dizziness","Anxiety","Disorientation"],
        VRSessionContext: {
            OnsetTime: "25 min into session",
            Duration: "10 min post-session",
            VRProgram: "Pain",
        },
        ActionsTake: [
            "Session duration reduced",
            "VR headset cleaned and adjusted",
            "Patient advised to take breaks",
            "Lighting conditions reviewed"
        ],
        ReportID: "AE-2024-006",
        duration: "critical",
        alertsRaised: "resolved",
    },
    {
        id: "11",
        weekNumber: 18,
        observationDate: new Date("2024-01-15T14:30:00"),
        status: "Eye Strain and Headache",
        observerName: "Dr. Raghavender",

        EventDescription: [
           "Patient reported mild eye strain and frontal headache during VR session. Symptoms resolved within 10 minutes of session completion."
        ],

        actionItems: ["Eye Strain", "Headache"],
        VRSessionContext: {
            OnsetTime: "25 min into session",
            Duration: "10 min post-session",
            VRProgram: "Pain",
        },
        ActionsTake: [
            "Session duration reduced",
            "VR headset cleaned and adjusted",
            "Patient advised to take breaks",
            "Lighting conditions reviewed"
        ],
        ReportID: "AE-2024-006",
        duration: "moderate",
        alertsRaised: "investigating",
    },
    {
        id: "11",
        weekNumber: 18,
        observationDate: new Date("2024-01-15T14:30:00"),
        status: "Eye Strain and Headache",
        observerName: "Dr. Raghavender",

        EventDescription: [
           "Patient reported mild eye strain and frontal headache during VR session. Symptoms resolved within 10 minutes of session completion."
        ],

        actionItems: ["Eye Strain", "Headache"],
        VRSessionContext: {
            OnsetTime: "25 min into session",
            Duration: "10 min post-session",
            VRProgram: "Pain",
        },
        ActionsTake: [
            "Session duration reduced",
            "VR headset cleaned and adjusted",
            "Patient advised to take breaks",
            "Lighting conditions reviewed"
        ],
        ReportID: "AE-2024-006",
        duration: "moderate",
        alertsRaised: "investigating",
    },
    {
        id: "11",
        weekNumber: 18,
        observationDate: new Date("2024-01-15T14:30:00"),
        status: "Eye Strain and Headache",
        observerName: "Dr. Raghavender",

        EventDescription: [
           "Patient reported mild eye strain and frontal headache during VR session. Symptoms resolved within 10 minutes of session completion."
        ],

        actionItems: ["Eye Strain", "Headache"],
        VRSessionContext: {
            OnsetTime: "25 min into session",
            Duration: "10 min post-session",
            VRProgram: "Pain",
        },
        ActionsTake: [
            "Session duration reduced",
            "VR headset cleaned and adjusted",
            "Patient advised to take breaks",
            "Lighting conditions reviewed"
        ],
        ReportID: "AE-2024-006",
        duration: "moderate",
        alertsRaised: "investigating",
    },
];


function formatDate(d: Date) {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function formatTime(d: Date) {
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function statusIcon(s: ObservationStatus) {
    switch (s) {
        case "complete":
            return "✓";
        case "incomplete":
            return "◑";
        case "flagged":
            return "⚠";
        case "pending":
            return "○";
        default:
            return "○";
    }
}

type FilterKey = "all" | "Critical" | "Unresolved" | "Recent" | "Motion Sickness" | "recent" | "complete" | "flagged" | "pending";

export default function AdverseEventReportsHistory() {

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const { patientId, age } = route.params as { patientId: number, age: number };
    const [filter, setFilter] = useState<FilterKey>("all");



    const filtered = useMemo(() => {
        const now = new Date().getTime();
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

        const base = OBSERVATIONS.filter((o) => {
            switch (filter) {
                case "recent":
                    return o.observationDate.getTime() >= sevenDaysAgo;
                case "complete":
                    return o.status === "complete";
                case "flagged":
                    return o.status === "flagged";
                case "pending":
                    return o.status === "pending";
                default:
                    return true;
            }
        }).sort((a, b) => b.observationDate.getTime() - a.observationDate.getTime());

        return base;
    }, [filter]);


    const counts = useMemo(() => {
        return {
            all: OBSERVATIONS.length,
            recent: OBSERVATIONS.filter(
                (o) => o.observationDate.getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000
            ).length,
            complete: OBSERVATIONS.filter((o) => o.status === "complete").length,
            flagged: OBSERVATIONS.filter((o) => o.status === "flagged").length,
            pending: OBSERVATIONS.filter((o) => o.status === "pending").length,
        };
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Container mimic */}
            <View className="mx-auto w-full max-w-[1024px] flex-1 border border-gray-300 rounded-lg  bg-gray-50">

                {/* Patient Header */}
                <View className="bg-white p-6 border-b border-gray-100">
                    <View className="flex-row items-center gap-5 mb-4">
                        <View className="w-16 h-16 rounded-full bg-teal-400 items-center justify-center">
                            <Text className="text-3xl text-white">👤</Text>
                        </View>


                        <View className="flex-1">
                            <Text className="text-2xl font-semibold text-gray-900">Participant002</Text>
                            <Text className="text-sm text-gray-700 mb-1">25 y • 65 kg • Male • Lung Cancer - Stage IIB</Text>
                            <View className="flex-row items-center gap-3">
                                <Text className="text-lg font-medium text-gray-700">⚠️</Text>
                                <Text className="text-lg font-medium text-gray-700">VR Adverse Event Reports</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            className="bg-red-400 px-4 py-3 rounded-lg"
                            onPress={() => navigation.navigate('AdverseEventForm', { patientId, age, studyId: 1 })}
                        >
                            <Text className="text-white font-semibold flex-row items-center">
                                <Icon name="exclamation-triangle" size={12} color="white" /> Report Event
                            </Text>

                        </TouchableOpacity>
                    </View>
                </View>

                {/* Patient status */}
                <View className="bg-white px-6 py-5 border-b border-gray-100">
                    <View className="flex-row justify-between">
                        <View className="flex-1 items-center p-4 rounded-xl bg-red-50 border border-red-200 mx-1">
                            <Text className="text-xl font-extrabold text-gray-900">7</Text>
                            <Text className="text-[11px] uppercase tracking-wide text-gray-500">Total Events</Text>
                            <Text className="text-xs text-gray-500">18 VR sessions</Text>
                        </View>

                        <View className="flex-1 items-center p-4 rounded-xl bg-yellow-50 border border-yellow-200 mx-1">
                            <Text className="text-xl font-extrabold text-gray-900">Moderate</Text>
                            <Text className="text-[11px] uppercase tracking-wide text-gray-500">Avg Severity</Text>
                            <Text className="text-xs text-gray-500">Most recent</Text>
                        </View>

                        <View className="flex-1 items-center p-4 rounded-xl bg-green-50 border border-green-200 mx-1">
                            <Text className="text-xl font-extrabold text-gray-900">85%</Text>
                            <Text className="text-[11px] uppercase tracking-wide text-gray-500">Resolved</Text>
                            <Text className="text-xs text-gray-500">6 of 7 events</Text>
                        </View>

                        <View className="flex-1 items-center p-4 rounded-xl bg-blue-50 border border-blue-200 mx-1">
                            <Text className="text-xl font-extrabold text-gray-900">38.9%</Text>
                            <Text className="text-[11px] uppercase tracking-wide text-gray-500">Event Rate</Text>
                            <Text className="text-xs text-gray-500">Per session</Text>
                        </View>
                    </View>
                </View>

                <View className="w-full  border-t border-b border-gray-200 m-0 p-2 bg-white" >
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
                        {(["all", "Critical", "Unresolved", "Recent", "Motion Sickness"] as FilterKey[]).map((k) => {
                            const active = filter === k;
                            return (
                                <Pressable
                                    key={k}
                                    onPress={() => setFilter(k)}
                                    className={`mr-3 flex-row items-center gap-2 px-4 py-2 rounded-full border ${active ? "bg-teal-400 border-teal-400" : "bg-gray-50 border-gray-200"}`}
                                >
                                    <Text className={`text-sm font-medium ${active ? "text-white" : "text-gray-500"}`}>
                                        {k === "all" ? "All Events" : k[0].toUpperCase() + k.slice(1)}
                                    </Text>
                                    <View className={`px-2 py-0.5 rounded-full ${active ? "bg-white/30" : "bg-gray-200"}`}>
                                        <Text className={`text-xs font-semibold ${active ? "text-white" : "text-gray-600"}`}>
                                            {counts[k]}
                                        </Text>
                                    </View>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>

                <View className="flex-1 px-6 py-5">
                    <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                        <View className="relative">
                            {/* Vertical line */}
                            <View className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 rounded" />
                            {/* Items */}
                            {filtered.length === 0 ? (
                                <View className="items-center justify-center px-8 py-16">
                                    <Text className="text-6xl mb-4">📋</Text>
                                    <Text className="text-xl font-semibold text-gray-900 mb-1">No observation forms found</Text>
                                    <Text className="text-gray-500 text-center">
                                        No study observation forms match your current filter for this patient.
                                    </Text>
                                </View>
                            ) : (
                                filtered.map((o) => (
                                    <View key={o.id} className="pl-20 mb-6">
                                        {/* Date column */}
                                        <View className="absolute left-0 top-0 w-16 items-center">
                                            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                {formatDate(o.observationDate)}
                                            </Text>
                                            <Text className="text-[10px] mt-1 px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                                                Week {o.weekNumber}
                                            </Text>
                                        </View>

                                        {/* Marker */}
                                        <View
                                            className={[
                                                "absolute left-6 top-3 w-4 h-4 rounded-full border-2 border-white",
                                                o.status === "complete" && "bg-emerald-500",
                                                o.status === "incomplete" && "bg-amber-500",
                                                o.status === "flagged" && "bg-red-500",
                                                o.status === "pending" && "bg-gray-500",
                                            ].filter(Boolean).join(" ")}
                                            style={{ shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 2, elevation: 2 }}
                                        />

                                        {/* Card */}
                                        <Pressable className="ml-3 bg-white rounded-xl p-5 border border-gray-100"
                                            onPress={() => { }}>
                                            {/* Header */}
                                            <View className="flex-row items-center justify-between mb-4">
                                                <View className="flex-row items-center gap-4">
                                                    <View
                                                        className={[
                                                            "w-12 h-12 rounded-full items-center justify-center",
                                                            o.status === "complete" && "bg-emerald-500",
                                                            o.status === "incomplete" && "bg-amber-500",
                                                            o.status === "flagged" && "bg-red-500",
                                                            o.status === "pending" && "bg-gray-500",
                                                        ].filter(Boolean).join(" ")}
                                                    >
                                                        <Text className="text-white font-bold text-lg">{statusIcon(o.status)}</Text>
                                                    </View>
                                                    <View>
                                                        <Text
                                                            className={[
                                                                "text-sm font-semibold",
                                                                o.status === "complete" && "text-emerald-600",
                                                                o.status === "incomplete" && "text-amber-600",
                                                                o.status === "flagged" && "text-red-600",
                                                                o.status === "pending" && "text-gray-500",
                                                            ].filter(Boolean).join(" ")}
                                                        >
                                                            {o.status[0].toUpperCase() + o.status.slice(1)} {o.completionPercentage ? `(${o.completionPercentage}%)` : ''}
                                                        </Text>
                                                        <Text className="text-xs text-gray-500">
                                                            {formatTime(o.observationDate)} • {o.duration} min
                                                        </Text>
                                                    </View>
                                                </View>

                                                <View className="flex-row items-center gap-2">
                                                    <Text className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                                                        {o.duration} min
                                                    </Text>
                                                    {typeof o.alertsRaised === 'number' && o.alertsRaised > 0 && (
                                                        <Text className="text-xs px-2 py-1 rounded bg-red-50 text-red-800">
                                                            {o.alertsRaised} alerts
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>

                                            {/* Categories */}
                                            <View className="my-3">
                                                <Text className="text-sm font-medium text-gray-700 mb-3">Observation Categories:</Text>
                                                <View className="grid grid-cols-3 gap-3">
                                                    {Object.entries(o.categories || {}).map(([key, val]) => {
                                                        const base =
                                                            key === "behavioral" ? "bg-blue-100 border-blue-300" :
                                                                key === "physical" ? "bg-green-100 border-green-300" :
                                                                    key === "compliance" ? "bg-purple-100 border-purple-300" :
                                                                        key === "social" ? "bg-orange-100 border-orange-300" :
                                                                            key === "treatment" ? "bg-pink-100 border-pink-300" :
                                              /* adverse */          "bg-red-100 border-red-300";
                                                        return (
                                                            <View key={key} className={`items-center p-3 rounded-xl border ${base}`}>
                                                                <Text className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">{key}</Text>
                                                                <Text className="text-sm font-semibold text-gray-900">{val}</Text>
                                                            </View>
                                                        );
                                                    })}
                                                </View>
                                            </View>

                                            {/* Key observations */}
                                            {(o.keyObservations?.length || 0) > 0 && (
                                                <View className="my-3 rounded-xl border-l-4 border-teal-400 bg-slate-50 px-4 py-3">
                                                    <Text className="text-sm font-semibold text-gray-700 mb-1">Key Observations:</Text>
                                                    {(o.keyObservations || []).map((line, idx) => (
                                                        <View key={idx} className="flex-row">
                                                            <Text className="mr-2 text-teal-400">•</Text>
                                                            <Text className="text-[13px] text-gray-600 flex-1">{line}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            )}

                                            {/* Action items */}
                                            {o.actionItems.length > 0 && (
                                                <View className="my-2">
                                                    <Text className="text-sm font-medium text-gray-700 mb-2">Action Items:</Text>
                                                    <View className="flex-row flex-wrap gap-2">
                                                        {o.actionItems.map((a) => {
                                                            const cls =
                                                                a === "Follow-up" ? "bg-amber-100 border-amber-300 text-amber-900" :
                                                                    a === "Monitor" ? "bg-blue-100 border-blue-300 text-blue-900" :
                                                                        a === "Alert" ? "bg-red-200 border-red-400 text-red-900" :
                                                /* Adjust */        "bg-purple-100 border-purple-300 text-purple-900";
                                                            return (
                                                                <Text key={a} className={`text-xs font-medium px-3 py-1 rounded-xl border ${cls}`}>
                                                                    {a}
                                                                </Text>
                                                            );
                                                        })}
                                                    </View>
                                                </View>
                                            )}

                                            {/* Notes */}
                                            {!!o.notes && (
                                                <View className="my-3 rounded-r-lg border-l-4 border-teal-400 bg-slate-50 p-3">
                                                    <Text className="text-[13px] text-slate-600 italic">"{o.notes}"</Text>
                                                </View>
                                            )}

                                            {/* Footer */}
                                            <View className="mt-4 pt-4 border-t border-gray-100 flex-row items-center justify-between">
                                                <Text className="text-xs text-gray-500">Observed by {o.observerName}</Text>
                                                <View className="flex-row items-center gap-2">
                                                    <Text className="text-xs text-gray-400">{formatTime(o.observationDate)}</Text>
                                                    <Text className="text-lg text-gray-300">›</Text>
                                                </View>
                                            </View>
                                        </Pressable>
                                    </View>
                                ))
                            )}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    );
}
