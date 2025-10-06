import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "src/Navigation/types";

type ObservationStatus = "complete" | "incomplete" | "flagged" | "pending";

type ObservationCategories = {
    behavioral: string;
    physical: string;
    compliance: string;
    social: string;
    treatment: string;
    adverse: string;
};

// Expanded Observation type to include new UI fields
type Observation = {
    id: string;
    weekNumber: number;
    observationDate: Date;
    status: ObservationStatus;
    completionPercentage: number;
    observerName: string;
    categories: ObservationCategories; // Still keeping this, though not directly shown in new card UI
    keyObservations: string[]; // Still keeping this, though not directly shown in new card UI
    actionItems: Array<"Follow-up" | "Monitor" | "Alert" | "Adjust">; // Still keeping this, though not directly shown in new card UI
    notes?: string;
    duration: number;
    alertsRaised: number;

    // New fields for the card content based on the UI
    sessionTitle: string;
    sessionTime: string; // e.g., "02:30 PM"
    overallChange: number; // e.g., 1 for positive, -1 for negative, 0 for neutral

    prePostMetrics: {
        anxiety: { pre: number; post: number; change: number };
        pain: { pre: number; post: number; change: number };
        mood: { pre: number; post: number; change: number };
        stress: { pre: number; post: number; change: number };
    };
    vrExperienceQuality: {
        immersion: number; // /10
        comfort: number;   // /10
        satisfaction: number; // /10
    };
    sessionOutcomes: string[]; // e.g., ["Relaxation", "Pain Relief", "Mood Improvement"]
};

const OBSERVATIONS: Observation[] = [
    {
        id: "12",
        weekNumber: 12,
        observationDate: new Date("2024-01-15T14:30:00"),
        status: "flagged",
        completionPercentage: 100,
        observerName: "Dr. Raghavender",
        categories: {
            behavioral: "Concerning",
            physical: "Stable",
            compliance: "Good",
            social: "Improved",
            treatment: "Responsive",
            adverse: "Present",
        },
        keyObservations: [
            "Patient showing increased anxiety about treatment outcomes",
            "Physical strength maintained, no new symptoms reported",
            "Excellent medication compliance (100% this week)",
        ],
        actionItems: ["Follow-up", "Monitor", "Alert"],
        notes:
            "Excellent session with significant anxiety and pain reduction. Patient very satisfied with ocean environment.",
        duration: 45,
        alertsRaised: 2,
        sessionTitle: "Ocean Meditation VR",
        sessionTime: "02:30 PM",
        overallChange: 1, // positive
        prePostMetrics: {
            anxiety: { pre: 7, post: 3, change: -4 },
            pain: { pre: 6, post: 2, change: -4 },
            mood: { pre: 5, post: 8, change: 3 },
            stress: { pre: 8, post: 3, change: -5 },
        },
        vrExperienceQuality: {
            immersion: 9,
            comfort: 8,
            satisfaction: 9,
        },
        sessionOutcomes: ["Relaxation", "Pain Relief", "Mood Improvement"],
    },
    {
        id: "11",
        weekNumber: 11,
        observationDate: new Date("2024-01-08T11:20:00"),
        status: "complete",
        completionPercentage: 100,
        observerName: "Dr. Smith",
        categories: {
            behavioral: "Stable",
            physical: "Improving",
            compliance: "Excellent",
            social: "Good",
            treatment: "Responsive",
            adverse: "Minimal",
        },
        keyObservations: [
            "Patient mood more positive this week",
            "Appetite improvement noted, weight stable",
            "Engaging well with family and care team",
        ],
        actionItems: ["Monitor"],
        notes:
            "Good week overall. Patient responding well to treatment adjustments made last week.",
        duration: 30,
        alertsRaised: 0,
        sessionTitle: "Forest Walk VR",
        sessionTime: "11:20 AM",
        overallChange: 1, // positive
        prePostMetrics: {
            anxiety: { pre: 6, post: 4, change: -2 },
            pain: { pre: 5, post: 3, change: -2 },
            mood: { pre: 6, post: 7, change: 1 },
            stress: { pre: 7, post: 5, change: -2 },
        },
        vrExperienceQuality: {
            immersion: 8,
            comfort: 7,
            satisfaction: 8,
        },
        sessionOutcomes: ["Relaxation", "Stress Reduction"],
    },
    {
        id: "10",
        weekNumber: 10,
        observationDate: new Date("2024-01-01T16:45:00"),
        status: "complete",
        completionPercentage: 100,
        observerName: "Dr. Johnson",
        categories: {
            behavioral: "Good",
            physical: "Stable",
            compliance: "Good",
            social: "Excellent",
            treatment: "Responsive",
            adverse: "Mild",
        },
        keyObservations: [
            "Holiday period - patient maintained positive outlook",
            "No significant physical changes this week",
            "Family support very strong during holidays",
        ],
        actionItems: ["Monitor"],
        notes:
            "Patient handled holiday period well with strong family support. Continue current regimen.",
        duration: 25,
        alertsRaised: 0,
        sessionTitle: "Mountain Vista VR",
        sessionTime: "04:45 PM",
        overallChange: 1, // positive
        prePostMetrics: {
            anxiety: { pre: 5, post: 4, change: -1 },
            pain: { pre: 4, post: 3, change: -1 },
            mood: { pre: 7, post: 8, change: 1 },
            stress: { pre: 6, post: 4, change: -2 },
        },
        vrExperienceQuality: {
            immersion: 7,
            comfort: 9,
            satisfaction: 8,
        },
        sessionOutcomes: ["Mood Improvement", "Stress Reduction"],
    },
    {
        id: "9",
        weekNumber: 9,
        observationDate: new Date("2023-12-25T09:15:00"),
        status: "incomplete",
        completionPercentage: 75,
        observerName: "Dr. Wilson",
        categories: {
            behavioral: "Concerning",
            physical: "Declining",
            compliance: "Fair",
            social: "Withdrawn",
            treatment: "Variable",
            adverse: "Moderate",
        },
        keyObservations: [
            "Patient more withdrawn this week",
            "Reported increased fatigue and nausea",
            "Some missed medication doses noted",
        ],
        actionItems: ["Follow-up", "Adjust"],
        notes:
            "Challenging week for patient. Consider dose adjustment and additional supportive care.",
        duration: 40,
        alertsRaised: 1,
        sessionTitle: "Calm Lake VR",
        sessionTime: "09:15 AM",
        overallChange: -1, // negative
        prePostMetrics: {
            anxiety: { pre: 8, post: 7, change: -1 },
            pain: { pre: 7, post: 6, change: -1 },
            mood: { pre: 4, post: 3, change: -1 },
            stress: { pre: 9, post: 8, change: -1 },
        },
        vrExperienceQuality: {
            immersion: 6,
            comfort: 6,
            satisfaction: 5,
        },
        sessionOutcomes: ["Relaxation"],
    },
    {
        id: "8",
        weekNumber: 8,
        observationDate: new Date("2023-12-18T13:30:00"),
        status: "flagged",
        completionPercentage: 100,
        observerName: "Dr. Brown",
        categories: {
            behavioral: "Alert",
            physical: "Concerning",
            compliance: "Good",
            social: "Fair",
            treatment: "Responsive",
            adverse: "Significant",
        },
        keyObservations: [
            "Patient reported severe nausea episodes",
            "Weight loss of 3kg noted this week",
            "Maintaining medication schedule despite side effects",
        ],
        actionItems: ["Follow-up", "Alert", "Adjust"],
        notes:
            "Significant adverse events this week. Immediate intervention required for symptom management.",
        duration: 35,
        alertsRaised: 3,
        sessionTitle: "Cloud Gazing VR",
        sessionTime: "01:30 PM",
        overallChange: 0, // neutral (or mixed)
        prePostMetrics: {
            anxiety: { pre: 7, post: 7, change: 0 },
            pain: { pre: 6, post: 6, change: 0 },
            mood: { pre: 5, post: 5, change: 0 },
            stress: { pre: 8, post: 8, change: 0 },
        },
        vrExperienceQuality: {
            immersion: 7,
            comfort: 7,
            satisfaction: 6,
        },
        sessionOutcomes: ["Distraction"],
    },
    {
        id: "7",
        weekNumber: 7,
        observationDate: new Date("2023-12-11T10:45:00"),
        status: "complete",
        completionPercentage: 100,
        observerName: "Dr. Davis",
        categories: {
            behavioral: "Good",
            physical: "Stable",
            compliance: "Excellent",
            social: "Good",
            treatment: "Responsive",
            adverse: "Mild",
        },
        keyObservations: [
            "Patient adapting well to treatment routine",
            "Energy levels consistent with previous week",
            "Good social engagement with support group",
        ],
        actionItems: ["Monitor"],
        notes:
            "Stable week with good treatment response. Patient coping well with current protocol.",
        duration: 20,
        alertsRaised: 0,
        sessionTitle: "Gentle Rain VR",
        sessionTime: "10:45 AM",
        overallChange: 1, // positive
        prePostMetrics: {
            anxiety: { pre: 5, post: 2, change: -3 },
            pain: { pre: 4, post: 1, change: -3 },
            mood: { pre: 6, post: 9, change: 3 },
            stress: { pre: 7, post: 2, change: -5 },
        },
        vrExperienceQuality: {
            immersion: 9,
            comfort: 9,
            satisfaction: 10,
        },
        sessionOutcomes: ["Relaxation", "Pain Relief", "Stress Reduction", "Mood Improvement"],
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

type FilterKey = "all" | "recent" | "mostEffective" | "painRelief" | "anxiety";

export default function VRSummary() {

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
                case "mostEffective":
                    // Assuming "Most Effective" means high satisfaction and significant positive changes
                    return o.vrExperienceQuality.satisfaction >= 8 && o.overallChange > 0;
                case "painRelief":
                    return o.sessionOutcomes.includes("Pain Relief");
                case "anxiety":
                    // Assuming "Anxiety" filter shows sessions that specifically targeted or reduced anxiety
                    return o.sessionOutcomes.includes("Anxiety Reduction") || o.prePostMetrics.anxiety.change < 0;
                default:
                    return true;
            }
        }).sort((a, b) => b.observationDate.getTime() - a.observationDate.getTime());

        return base;
    }, [filter]);


    const counts = useMemo(() => {
        const now = Date.now();
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

        return {
            all: OBSERVATIONS.length,
            recent: OBSERVATIONS.filter(
                (o) => o.observationDate.getTime() >= sevenDaysAgo
            ).length,
            mostEffective: OBSERVATIONS.filter(
                (o) => o.vrExperienceQuality.satisfaction >= 8 && o.overallChange > 0
            ).length,
            painRelief: OBSERVATIONS.filter(
                (o) => o.sessionOutcomes.includes("Pain Relief")
            ).length,
            anxiety: OBSERVATIONS.filter(
                (o) => o.sessionOutcomes.includes("Anxiety Reduction") || o.prePostMetrics.anxiety.change < 0
            ).length,
        };
    }, []);

    const getMetricChangeColor = (change: number) => {
        if (change < 0) return "text-green-500"; // Improvement for anxiety/pain/stress is negative change
        if (change > 0) return "text-red-500";   // Worsening is positive change
        return "text-gray-500";
    };

    const getMoodChangeColor = (change: number) => {
        if (change > 0) return "text-green-500"; // Improvement for mood is positive change
        if (change < 0) return "text-red-500";   // Worsening is negative change
        return "text-gray-500";
    };

    const getOverallChangeArrow = (change: number) => {
        if (change > 0) return "↑"; // Positive
        if (change < 0) return "↓"; // Negative
        return "";
    };

    const getOverallChangeColor = (change: number) => {
        if (change > 0) return "text-green-500";
        if (change < 0) return "text-red-500";
        return "text-gray-500";
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Container mimic */}
            <View className="mx-auto w-full max-w-[1024px] flex-1 border border-gray-300 rounded-lg  bg-gray-50">

                {/* Patient Header */}
                <View className="bg-white p-6 border-b border-gray-100">
                    <View className="flex-row items-center gap-5 mb-4">
                        <View className="w-16 h-16 rounded-full bg-green-400 items-center justify-center">
                            <Text className="text-3xl text-white">👤</Text>
                        </View>


                        <View className="flex-1">
                            <Text className="text-2xl font-semibold text-gray-900">Participant002</Text>
                            <Text className="text-sm text-gray-700 mb-1">25 y • 65 kg • Male • Lung Cancer - Stage IIB</Text>
                            <View className="flex-row items-center gap-3">
                                <Text className="text-lg font-medium text-gray-700">📋</Text>
                                <Text className="text-lg font-medium text-gray-700">Study Observation Forms</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            className="bg-teal-400 px-4 py-3 rounded-lg"
                            onPress={() => navigation.navigate('PreAndPostVR', { patientId, age, studyId: 1 })}
                        >
                            <Text className="text-white font-semibold">+ New VR Session</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Patient status */}
                <View className="bg-white px-6 py-5 border-b border-gray-100">
                    <View className="flex-row justify-between">
                        <View className="flex-1 items-center p-4 rounded-xl bg-blue-50 border border-blue-200 mx-1">
                            <Text className="text-xl font-extrabold text-gray-900">18</Text>
                            <Text className="text-[11px] uppercase tracking-wide text-gray-500">Total Sessions</Text>
                            <Text className="text-xs text-gray-500">Since enrollment</Text>
                        </View>

                        <View className="flex-1 items-center p-4 rounded-xl bg-yellow-50 border border-yellow-200 mx-1">
                            <Text className="text-xl font-extrabold text-gray-900">12.5h</Text>
                            <Text className="text-[11px] uppercase tracking-wide text-gray-500">Total VR Time</Text>
                            <Text className="text-xs text-gray-500">Active therapy</Text>
                        </View>

                        <View className="flex-1 items-center p-4 rounded-xl bg-green-50 border border-green-200 mx-1">
                            <Text className="text-xl font-extrabold text-gray-900">78%</Text>
                            <Text className="text-[11px] uppercase tracking-wide text-gray-500">Improvement</Text>
                            <Text className="text-xs text-gray-500">Pain reduction</Text>
                        </View>

                        <View className="flex-1 items-center p-4 rounded-xl bg-red-50 border border-red-200 mx-1">
                            <Text className="text-xl font-extrabold text-gray-900">4.2/5</Text>
                            <Text className="text-[11px] uppercase tracking-wide text-gray-500">Satisfaction</Text>
                            <Text className="text-xs text-gray-500">Average rating</Text>
                        </View>
                    </View>
                </View>
                <View className="w-full  border-t border-b border-gray-200 m-0 p-2 bg-white" >
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
                        {(["all", "recent", "mostEffective", "painRelief", "anxiety"] as FilterKey[]).map((k) => {
                            const active = filter === k;
                            let label = "";
                            switch (k) {
                                case "all":
                                    label = "All Sessions";
                                    break;
                                case "mostEffective":
                                    label = "Most Effective";
                                    break;
                                case "painRelief":
                                    label = "Pain Relief";
                                    break;
                                case "anxiety":
                                    label = "Anxiety";
                                    break;
                                default:
                                    label = k[0].toUpperCase() + k.slice(1);
                                    break;
                            }
                            return (
                                <Pressable
                                    key={k}
                                    onPress={() => setFilter(k)}
                                    className={`mr-3 flex-row items-center gap-2 px-4 py-2 rounded-full border ${active ? "bg-teal-400 border-teal-400" : "bg-gray-50 border-gray-200"}`}
                                >
                                    <Text className={`text-sm font-medium ${active ? "text-white" : "text-gray-500"}`}>
                                        {label}
                                    </Text>
                                    <View className={`px-2 py-0.5 rounded-full ${active ? "bg-white/30" : "bg-gray-200"}`}>
                                        <Text className={`text-xs font-semibold ${active ? "text-white" : "text-gray-600"}`}>
                                            {counts[k as keyof typeof counts]}
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

                                        {/* Card Content - Adapted to new UI */}
                                        <Pressable className="ml-3 bg-white rounded-xl p-5 border border-gray-100"
                                            onPress={() => { /* Handle navigation to detail screen if needed */ }}>
                                            <View className="flex-row items-center justify-between mb-4">
                                                <View className="flex-row items-center gap-4">
                                                    <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center">
                                                        {/* Placeholder for icon, adjust as needed */}
                                                        <Text className="text-2xl">🌧️</Text>
                                                    </View>
                                                    <View>
                                                        <Text className="text-base font-semibold text-gray-900">{o.sessionTitle}</Text>
                                                        <Text className="text-xs text-gray-500">
                                                            {o.sessionTime} • {o.duration} min
                                                        </Text>
                                                    </View>
                                                </View>
                                                <View className="flex-row items-center gap-2">
                                                    <Text className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                                                        {o.duration} min
                                                    </Text>
                                                    {o.overallChange !== 0 && (
                                                        <View className={`flex-row items-center px-2 py-1 rounded ${o.overallChange > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                                                            <Text className={`text-xs ${getOverallChangeColor(o.overallChange)} font-semibold`}>
                                                                {getOverallChangeArrow(o.overallChange)} {o.overallChange > 0 ? 'positive' : 'negative'}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>

                                            <Text className="text-sm font-semibold text-gray-700 mb-3">Pre/Post Session Metrics:</Text>
                                            <View className="flex-row justify-between mb-4">
                                                <View className="flex-1 items-center p-3 rounded-xl bg-gray-50 border border-gray-200 mx-1">
                                                    <Text className="text-[11px] uppercase tracking-wide text-gray-500">Anxiety</Text>
                                                    <Text className="text-lg font-semibold text-gray-900">{o.prePostMetrics.anxiety.pre}</Text>
                                                    <Text className={`text-xs ${getMetricChangeColor(o.prePostMetrics.anxiety.change)}`}>
                                                        {o.prePostMetrics.anxiety.change < 0 ? '⬇' : '⬆'}{Math.abs(o.prePostMetrics.anxiety.change)}
                                                    </Text>
                                                </View>
                                                <View className="flex-1 items-center p-3 rounded-xl bg-gray-50 border border-gray-200 mx-1">
                                                    <Text className="text-[11px] uppercase tracking-wide text-gray-500">Pain</Text>
                                                    <Text className="text-lg font-semibold text-gray-900">{o.prePostMetrics.pain.pre}</Text>
                                                    <Text className={`text-xs ${getMetricChangeColor(o.prePostMetrics.pain.change)}`}>
                                                        {o.prePostMetrics.pain.change < 0 ? '⬇' : '⬆'}{Math.abs(o.prePostMetrics.pain.change)}
                                                    </Text>
                                                </View>
                                                <View className="flex-1 items-center p-3 rounded-xl bg-gray-50 border border-gray-200 mx-1">
                                                    <Text className="text-[11px] uppercase tracking-wide text-gray-500">Mood</Text>
                                                    <Text className="text-lg font-semibold text-gray-900">{o.prePostMetrics.mood.pre}</Text>
                                                    <Text className={`text-xs ${getMoodChangeColor(o.prePostMetrics.mood.change)}`}>
                                                        {o.prePostMetrics.mood.change > 0 ? '⬆' : '⬇'}{Math.abs(o.prePostMetrics.mood.change)}
                                                    </Text>
                                                </View>
                                                <View className="flex-1 items-center p-3 rounded-xl bg-gray-50 border border-gray-200 mx-1">
                                                    <Text className="text-[11px] uppercase tracking-wide text-gray-500">Stress</Text>
                                                    <Text className="text-lg font-semibold text-gray-900">{o.prePostMetrics.stress.pre}</Text>
                                                    <Text className={`text-xs ${getMetricChangeColor(o.prePostMetrics.stress.change)}`}>
                                                        {o.prePostMetrics.stress.change < 0 ? '⬇' : '⬆'}{Math.abs(o.prePostMetrics.stress.change)}
                                                    </Text>
                                                </View>
                                            </View>

                                            <Text className="text-sm font-semibold text-gray-700 mb-3">VR Experience Quality:</Text>
                                            <View className="flex-row justify-between mb-4">
                                                <View className="flex-1 items-center p-3 rounded-xl bg-gray-50 border border-gray-200 mx-1">
                                                    <Text className="text-[11px] uppercase tracking-wide text-gray-500">Immersion</Text>
                                                    <Text className="text-lg font-semibold text-gray-900">{o.vrExperienceQuality.immersion}/10</Text>
                                                </View>
                                                <View className="flex-1 items-center p-3 rounded-xl bg-gray-50 border border-gray-200 mx-1">
                                                    <Text className="text-[11px] uppercase tracking-wide text-gray-500">Comfort</Text>
                                                    <Text className="text-lg font-semibold text-gray-900">{o.vrExperienceQuality.comfort}/10</Text>
                                                </View>
                                                <View className="flex-1 items-center p-3 rounded-xl bg-gray-50 border border-gray-200 mx-1">
                                                    <Text className="text-[11px] uppercase tracking-wide text-gray-500">Satisfaction</Text>
                                                    <Text className="text-lg font-semibold text-gray-900">{o.vrExperienceQuality.satisfaction}/10</Text>
                                                </View>
                                            </View>

                                            <Text className="text-sm font-semibold text-gray-700 mb-3">Session Outcomes:</Text>
                                            <View className="flex-row flex-wrap gap-2 mb-4">
                                                {o.sessionOutcomes.map((outcome, idx) => (
                                                    <Text key={idx} className="text-xs font-medium px-3 py-1 rounded-xl border bg-green-100 border-green-300 text-green-800">
                                                        {outcome}
                                                    </Text>
                                                ))}
                                            </View>

                                            {!!o.notes && (
                                                <View className="my-3 rounded-lg bg-gray-50 p-3">
                                                    <Text className="text-[13px] text-slate-600 italic">"{o.notes}"</Text>
                                                </View>
                                            )}

                                            {/* Footer */}
                                            <View className="mt-4 pt-4 border-t border-gray-100 flex-row items-center justify-between">
                                                <Text className="text-xs text-gray-500">Conducted by {o.observerName}</Text>
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