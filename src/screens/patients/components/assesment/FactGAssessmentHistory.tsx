import { useNavigation, useRoute } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { RootStackParamList } from "src/Navigation/types";



type ObservationStatus = "Good QoL" | "Moderate QoL" | "Excellent QoL";

type ObservationCategories = {

    physical: string;
    social: string;
    Emotional: string;
    Functional: string;

};

type Observation = {
    id: string;
    weekNumber: number;
    observationDate: Date;
    status: ObservationStatus;
    completionPercentage?: number;
    observerName: string;
    categories: ObservationCategories;
    keyObservations: string[];
    notes?: string;
    duration: number;
    alertsRaised: number;
};

const OBSERVATIONS: Observation[] = [
    {
        id: "12",
        weekNumber: 6,
        observationDate: new Date("2024-01-15T14:30:00"),
        status: "Good QoL",

        observerName: "Dr. Smith",
        categories: {
            physical: "18",
            social: "22",
            Emotional: "19",
            Functional: "19"
        },
        keyObservations: [
            "Good quality of life with manageable symptoms and maintained daily functioning.",
        ],
        notes:
            "Significant improvement in overall quality of life. Patient reporting better physical function and emotional wellbeing.",
        duration: 25,
        alertsRaised: 12,
    },
    {
        id: "11",
        weekNumber: 5,
        observationDate: new Date("2024-01-08T11:20:00"),
        status: "Moderate QoL",

        observerName: "Dr. Smith",
        categories: {
            physical: "15",
            social: "18",
            Emotional: "16",
            Functional: "17"
        },
        keyObservations: [
            "Moderate quality of life with some limitations in daily activities and wellbeing",
        ],
        // actionItems: ["Monitor"],
        notes:
            "Moderate quality of life improvements. Patient adapting well to treatment regimen with some remaining challenges.",
        duration: 18,
        alertsRaised: 0,
    },
    {
        id: "10",
        weekNumber: 4,
        observationDate: new Date("2024-01-01T16:45:00"),
        status: "Good QoL",
        completionPercentage: 100,
        observerName: "Dr. Johnson",
        categories: {
            physical: "17",
            social: "20",
            Emotional: "17",
            Functional: "178"
        },
        keyObservations: [
            "Good quality of life with manageable symptoms and maintained daily functioning.",
        ],
        // actionItems: ["Monitor"],
        notes:
            "Good quality of life maintenance during holiday period. Patient showing resilience despite treatment challenges.",
        duration: 20,
        alertsRaised: 14,
    },
    {
        id: "9",
        weekNumber: 3,
        observationDate: new Date("2023-12-25T09:15:00"),
        status: "Moderate QoL",
        completionPercentage: 75,
        observerName: "Dr. Wilson",
        categories: {
            physical: "13",
            social: "16",
            Emotional: "14",
            Functional: "15"
        },
        keyObservations: [
            "Moderate quality of life with some limitations in daily activities and wellbeing.",
        ],
        notes:
            "Decreased quality of life due to treatment intensification. Patient experiencing fatigue and emotional challenges.",
        duration: 28,
        alertsRaised: 27,
    },
    {
        id: "8",
        weekNumber: 2,
        observationDate: new Date("2023-12-18T13:30:00"),
        status: "Excellent QoL",
        observerName: "Dr. Brown",
        categories: {
            physical: "21",
            social: "23",
            Emotional: "20",
            Functional: "21"
        },
        keyObservations: [
            "Excellent overall functioning across all life domains with minimal impact from cancer/treatment.",
        ],

        notes:
            "Excellent quality of life scores across all domains. Patient functioning well with strong support systems",
        duration: 30,
        alertsRaised: 3,
    },
    {
        id: "7",
        weekNumber: 7,
        observationDate: new Date("2023-12-11T10:45:00"),
        status: "Good QoL",
        completionPercentage: 100,
        observerName: "Dr. Davis",
        categories: {
            physical: "16",
            social: "19",
            Emotional: "15",
            Functional: "19"
        },
        keyObservations: [
            "Good quality of life with manageable symptoms and maintained daily functioning",
        ],
        notes:
            "Baseline assessment shows moderate to good quality of life. Patient motivated and optimistic about treatment.",
        duration: 16,
        alertsRaised: 0,
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
        case "Good QoL":
            return "78";
        case "Moderate QoL":
            return "58";
        case "Excellent QoL":
            return "85";
        default:
            return "○";
    }
}


type FilterKey = "all" | "Last 30 Days" | "Improving" | "Excellent QoL" | "Concerning";

const FactGAssessmentHistory = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const { patientId, age } = route.params as { patientId: number, age: number }

    const [filter, setFilter] = useState<FilterKey>("all");



    const filtered = useMemo(() => {
        const now = Date.now();
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

        return OBSERVATIONS.filter((o) => {
            switch (filter) {
                case "Last 30 Days":
                    return o.observationDate.getTime() >= thirtyDaysAgo;
                case "Improving":
                    return o.status === "Good QoL" || o.status === "Excellent QoL";
                case "Excellent QoL":
                    return o.status === "Excellent QoL";
                case "Concerning":
                    return o.status === "Moderate QoL";
                default:
                    return true;
            }
        }).sort((a, b) => b.observationDate.getTime() - a.observationDate.getTime());
    }, [filter]);



    const counts = useMemo(() => {
        return {
            all: OBSERVATIONS.length,

            "Last 30 Days": OBSERVATIONS.filter(
                (o) => o.observationDate.getTime() >= Date.now() - 30 * 24 * 60 * 60 * 1000
            ).length,


            "Improving": OBSERVATIONS.filter(
                (o) => o.status === "Good QoL" || o.status === "Excellent QoL"
            ).length,

            "Excellent QoL": OBSERVATIONS.filter(
                (o) => o.status === "Excellent QoL"
            ).length,

            Concerning: OBSERVATIONS.filter(
                (o) => o.status === "Moderate QoL"
            ).length,
        };
    }, [OBSERVATIONS]);


    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="mx-auto w-full max-w-[1024px] flex-1 border border-gray-300 rounded-lg  bg-gray-50">

                {/* Header */}
                <View className="bg-white p-6 border-b border-gray-100">
                    <View className="flex-row items-center mb-4 gap-5">

                        <View className="w-16 h-16 rounded-full bg-green-400 items-center justify-center">
                            <Text className="text-3xl text-white">👤</Text>
                        </View>

                        <View className="flex-1 ">
                            <Text className="text-2xl font-semibold text-gray-900">Participant002</Text>
                            <Text className="text-sm text-gray-700 mb-1">25 y • 65 kg • Male • Lung Cancer - Stage IIB</Text>
                            <View className="flex-row items-center gap-3">
                                <Text className="text-lg font-medium text-gray-700">📝</Text>
                                <Text className="text-lg font-medium text-gray-700">Fact-G Assessment History</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            className="bg-teal-400 px-4 py-3 rounded-lg"
                            onPress={() => navigation.navigate('EdmontonFactGScreen', { patientId, age, studyId: 1 })}
                        >
                            <Text className="text-white font-semibold">+ New Assessment</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* patient status */}

                <View className="bg-white px-6 py-5 border-b border-gray-100">
                    <View className="flex-row justify-between">
                        <View className="flex-1 items-center p-4 rounded-xl  bg-blue-50 border border-blue-200 mx-1">
                            <Text className="tex-xl font-extrabold text-gray-900">78</Text>
                            <Text className="text-[11px] uppercase tracking-wide text-gray-500">Current Score</Text>
                            <Text className="text-xs tex-gray-500">Last visit (/108)</Text>
                        </View>

                        <View className="flex-1 items-center p-4 rounded-xl  bg-yellow-50 border border-yellow-200 mx-1">
                            <Text className="tex-xl font-extrabold text-gray-900">71.4</Text>
                            <Text className="text-[11px] uppercase tracking-wide text-gray-500">Average Score</Text>
                            <Text className="tracking-wide tex-gray-600">Over 6 visits</Text>
                        </View>


                        <View className="flex-1 items-center p-4 rounded-xl  bg-blue-50 border border-blue-200 mx-1">
                            <Text className="tex-xl font-extrabold text-gray-900">+12</Text>
                            <Text className="text-[11px] uppercase tracking-wide text-gray-500">Trend</Text>
                            <Text className="tracking-wide tex-gray-600">↓ Since last month</Text>
                        </View>

                        <View className="flex-1 items-center p-4 rounded-xl  bg-green-50 border border-green-200 mx-1">
                            <Text className="tex-xl font-extrabold text-gray-900">Good</Text>
                            <Text className="text-[11px] uppercase tracking-wide text-gray-500">QoL Level</Text>
                            <Text className="text-xs tracking-wide tex-gray-600">↑ Improving</Text>
                        </View>
                    </View>
                </View>

                {/* filter */}

                <View className=" w-full bg-white border-t border-b border-gray-200 m-0 p-2">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
                        {(["all", "Last 30 Days", "Improving", "Excellent QoL", "Concerning"] as FilterKey[]).map((k) => {
                            const active = filter === k
                            return (
                                <Pressable
                                    key={k}
                                    onPress={() => setFilter(k)}
                                    className={`mr-3 flex-row items-center px-3 py-2 gap-2 rounded-full border ${active ? "bg-teal-400 border-teal-400" : "bg-gray-50 border-gray-200"}`}
                                >

                                    <Text className={`text-sm font-medium ${active ? "text-white" : "text-gray-500"}`}>
                                        {k === "all" ? "All Visits" : k[0].toUpperCase() + k.slice(1)}
                                    </Text>
                                    <View className={`px-2 py-0.5 rounded-full ${active ? "bg-white/30" : "bg-gray-200"}`}>
                                        <Text className={`text-xs font-semibold ${active ? "text-white" : "text-gray-600"}`}>
                                            {counts[k]}
                                        </Text>
                                    </View>

                                </Pressable>
                            )
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
                                    <Text className="text-6xl mb-4">📝</Text>
                                    <Text className="text-xl font-semibold text-gray-900 mb-1">No assessments found</Text>
                                    <Text className="text-gray-500 text-center">
                                        No Fact-G assessments match your current filter for this patient.
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
                                                Vist {o.weekNumber}
                                            </Text>
                                        </View>

                                        {/* Marker */}
                                        <View
                                            className={[
                                                "absolute left-6 top-3 w-4 h-4 rounded-full border-2 border-white",
                                                o.status === "Good QoL" && "bg-blue-500",
                                                o.status === "Excellent QoL" && "bg-green-500",
                                                o.status === "Moderate QoL" && "bg-amber-500",
                                                // o.status === "pending" && "bg-gray-500",
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
                                                            o.status === "Good QoL" && "bg-blue-500",
                                                            o.status === "Excellent QoL" && "bg-green-500",
                                                            o.status === "Moderate QoL" && "bg-amber-500",
                                                            // o.status === "pending" && "bg-gray-500",
                                                        ].filter(Boolean).join(" ")}
                                                    >
                                                        <Text className="text-white font-bold text-lg">{statusIcon(o.status)}</Text>
                                                    </View>
                                                    <View>
                                                        <Text
                                                            className={[
                                                                "text-sm font-semibold",
                                                                o.status === "Good QoL" && "text-blue-600",
                                                                o.status === "Excellent QoL" && "text-green-600",
                                                                o.status === "Moderate QoL" && "text-amber-600",
                                                                // o.status === "pending" && "text-gray-500",
                                                            ].filter(Boolean).join(" ")}
                                                        >
                                                            {o.status[0].toUpperCase() + o.status.slice(1)}
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
                                                    {o.alertsRaised > 0 && (
                                                        <Text className="text-xs px-2 py-1 rounded bg-red-50 text-red-800">
                                                            {o.alertsRaised} alerts
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>

                                            {/* Categories */}
                                            <View className="my-3">
                                                <Text className="text-sm font-medium text-gray-700 mb-3">Quality of Life Domains:</Text>
                                                <View className="grid grid-cols-4 gap-3">
                                                    {Object.entries(o.categories).map(([key, val]) => {
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
                                            {o.keyObservations.length > 0 && (
                                                <View className="my-3 rounded-xl border-l-4 border-teal-400 bg-slate-50 px-4 py-3">
                                                    <Text className="text-sm font-semibold text-gray-700 mb-1">Assessment Summary</Text>
                                                    {o.keyObservations.map((line, idx) => (
                                                        <View key={idx} className="flex-row">
                                                            <Text className="mr-2 text-teal-400">•</Text>
                                                            <Text className="text-[13px] text-gray-600 flex-1">{line}</Text>
                                                        </View>
                                                    ))}
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
    )
}

export default FactGAssessmentHistory

