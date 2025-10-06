import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "src/Navigation/types";

type ObservationStatus = "Moderate Distress" | "High Distress" | "Low Distress";

type Observation = {
  id: string;
  weekNumber: number;
  observationDate: Date;
  status: ObservationStatus;
  observerName: string;
  // categories: ObservationCategories;
  // keyObservations: string[];
  actionItems?: Array<"Physical" | "Emotional" | "Practical" | "Social">;
  notes?: string;
  duration: number;
  alertsRaised: number;
};

const OBSERVATIONS: Observation[] = [
  {
    id: "12",
    weekNumber: 7,
    observationDate: new Date("2024-01-15T14:30:00"),
    status: "Moderate Distress",

    observerName: "Dr. Raghavender",
    actionItems: ["Physical", "Emotional"],
    notes:
      "Moderate distress levels improving. Patient responding well to new treatment protocol. Physical symptoms manageable.",
    duration: 15,
    alertsRaised: 1,
  },
  {
    id: "11",
    weekNumber: 6,
    observationDate: new Date("2024-01-08T11:20:00"),
    status: "Moderate Distress",
    observerName: "Dr. Smith",


    actionItems: ["Physical", "Emotional", "Practical"],
    notes:
      "Patient experiencing moderate distress. Concerns about work arrangements and treatment schedule conflicts.",
    duration: 18,
    alertsRaised: 0,
  },
  {
    id: "10",
    weekNumber: 5,
    observationDate: new Date("2024-01-01T16:45:00"),
    status: "Moderate Distress",
    observerName: "Dr. Johnson",


    actionItems: ["Emotional"],
    notes:
      "Low-moderate distress. Patient coping well emotionally. Minor anxiety about upcoming scans.",
    duration: 12,
    alertsRaised: 3,
  },
  {
    id: "9",
    weekNumber: 4,
    observationDate: new Date("2023-12-25T09:15:00"),
    status: "High Distress",
    observerName: "Dr. Wilson",

    actionItems: ["Physical", "Emotional", "Social", "Practical"],
    notes:
      "High distress during holiday period. Multiple stressors including treatment side effects and family concerns.",
    duration: 25,
    alertsRaised: 1,
  },
  {
    id: "8",
    weekNumber: 3,
    observationDate: new Date("2023-12-18T13:30:00"),
    status: "Low Distress",
    observerName: "Dr. Brown",

    actionItems: ["Physical"],
    notes:
      "Low distress levels. Patient adapting well to treatment routine. Minor physical discomfort only.",
    duration: 10,
    alertsRaised: 1,
  },
  {
    id: "7",
    weekNumber: 7,
    observationDate: new Date("2023-12-11T10:45:00"),
    status: "Low Distress",
    observerName: "Dr. Davis",
    // actionItems: ["Monitor"],
    notes:
      "Very low distress. Patient feeling optimistic and well-supported by family and medical team.",
    duration: 8,
    alertsRaised: 2,
  },

  {
    id: "6",
    weekNumber: 1,
    observationDate: new Date("2023-12-11T10:45:00"),
    status: "Moderate Distress",
    observerName: "Dr. Davis",
    actionItems: ["Emotional", "Practical"],
    notes:
      "Initial assessment. Moderate distress related to diagnosis and treatment planning. Good family support present.",
    duration: 20,
    alertsRaised: 2,
  },
];


function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function formatTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

// function statusIcon(s: ObservationStatus) {
//   switch (s) {
//     case "complete":
//       return "✓";
//     case "incomplete":
//       return "◑";
//     case "flagged":
//       return "⚠";
//     case "pending":
//       return "○";
//     default:
//       return "○";
//   }
// }

type FilterKey = "all" | "Last 30 Days" | "High Distress" | "Improving" | "Concerning";

export default function DistressThermometerList() {

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { patientId, age } = route.params as { patientId: number, age: number };
  const [filter, setFilter] = useState<FilterKey>("all");



  const filtered = useMemo(() => {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    return OBSERVATIONS.filter((o) => {
      switch (filter) {
        case "Last 30 Days":
          return o.observationDate.getTime() >= thirtyDaysAgo;
        case "High Distress":
          return o.status === "High Distress";
        case "Improving":
          return o.status === "Moderate Distress" || o.status === "Low Distress";
        case "Concerning":
          return o.status === "High Distress";
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


      "High Distress": OBSERVATIONS.filter(
        (o) => o.status === "High Distress"
      ).length,

      "Improving": OBSERVATIONS.filter(
        (o) => o.status === "Moderate Distress" || o.status === "Low Distress"
      ).length,

      Concerning: OBSERVATIONS.filter(
        (o) => o.status === "Moderate Distress"
      ).length,
    };
  }, [OBSERVATIONS]);

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
                <Text className="text-lg font-medium text-gray-700">🌡️</Text>
                <Text className="text-lg font-medium text-gray-700">Distress Thermometer History</Text>
              </View>
            </View>
            <TouchableOpacity
              className="bg-teal-400 px-4 py-3 rounded-lg"
              onPress={() => navigation.navigate('DistressThermometerScreen', { patientId, age, studyId: 1 })}
            >
              <Text className="text-white font-semibold">+ New Assessment</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Patient status */}
        <View className="bg-white px-6 py-5 border-b border-gray-100">
          <View className="flex-row justify-between">
            <View className="flex-1 items-center p-4 rounded-xl bg-blue-50 border border-blue-200 mx-1">
              <Text className="text-xl font-extrabold text-gray-900">5</Text>
              <Text className="text-[11px] uppercase tracking-wide text-gray-500">Current Score</Text>
              <Text className="text-xs text-gray-500">Last visit</Text>
            </View>

            <View className="flex-1 items-center p-4 rounded-xl bg-yellow-50 border border-yellow-200 mx-1">
              <Text className="text-xl font-extrabold text-gray-900">4.1</Text>
              <Text className="text-[11px] uppercase tracking-wide text-gray-500">Average Score</Text>
              <Text className="text-xs text-gray-500">Over 7 visits</Text>
            </View>

            <View className="flex-1 items-center p-4 rounded-xl bg-red-50 border border-red-200 mx-1">
              <Text className="text-xl font-extrabold text-gray-900">-1</Text>
              <Text className="text-[11px] uppercase tracking-wide text-gray-500">Trend</Text>
              <Text className="text-xs text-gray-500">↓ Since last month</Text>
            </View>

            <View className="flex-1 items-center p-4 rounded-xl bg-green-50 border border-green-200 mx-1">
              <Text className="text-xl font-extrabold text-gray-900">2</Text>
              <Text className="text-[11px] uppercase tracking-wide text-gray-500">Problem Areas</Text>
              <Text className="text-xs text-gray-500">↓ From 4 areas</Text>
            </View>
          </View>
        </View>

        <View className="w-full  border-t border-b border-gray-200 m-0 p-2 bg-white" >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
            {(["all", "Last 30 Days", "High Distress", "Improving", "Concerning"] as FilterKey[]).map((k) => {
              const active = filter === k;
              return (
                <Pressable
                  key={k}
                  onPress={() => setFilter(k)}
                  className={`mr-3 flex-row items-center gap-2 px-4 py-2 rounded-full border ${active ? "bg-teal-400 border-teal-400" : "bg-gray-50 border-gray-200"}`}
                >
                  <Text className={`text-sm font-medium ${active ? "text-white" : "text-gray-500"}`}>
                    {k === "all" ? "All Forms" : k[0].toUpperCase() + k.slice(1)}
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
                  <Text className="text-6xl mb-4">🌡️</Text>
                  <Text className="text-xl font-semibold text-gray-900 mb-1">No assessments found</Text>
                  <Text className="text-gray-500 text-center">
                    No distress thermometer assessments match your current filter for this patient.
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
                        o.status === "Moderate Distress" && "bg-amber-500",
                        o.status === "High Distress" && "bg-emerald-500",
                        o.status === "Low Distress" && "bg-green-500",
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
                              o.status === "Moderate Distress" && "bg-amber-500",
                              o.status === "High Distress" && "bg-emerald-500",
                              o.status === "Low Distress" && "bg-green-500",
                            ].filter(Boolean).join(" ")}
                          >
                            <Text className="text-white font-bold text-lg">{(o.id)}</Text>
                          </View>
                          <View>
                            <Text
                              className={[
                                "text-sm font-semibold",
                                o.status === "Moderate Distress" && "text-amber-600",
                                o.status === "High Distress" && "text-emerald-600",
                                o.status === "Low Distress" && "text-green-600",
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




                      {/* Action items */}
                      {o.actionItems && o.actionItems.length > 0 && (
                        <View className="my-2">
                          <Text className="text-sm font-bold text-gray-700 mb-2">
                            Problem Areas: ({o.actionItems.length})
                          </Text>

                          <View className="flex-row flex-wrap gap-2">
                            {o.actionItems.map((a) => {
                              const cls =
                                a === "Practical" ? "bg-amber-100 border-amber-300 text-amber-900" :
                                  a === "Physical" ? "bg-blue-100 border-blue-300 text-blue-900" :
                                    a === "Social" ? "bg-green-200 border-green-300 text-green-900" :
                                      a === "Emotional" ? "bg-purple-100 border-purple-300 text-purple-900" :
                                        "bg-purple-100 border-purple-300 text-purple-900";

                              return (
                                <Text key={a} className={`text-xs font-medium px-3 py-1 rounded-xl border ${cls}`}>
                                  {a}
                                </Text>
                              );
                            })}

                            <View className="w-full mt-1">
                              {o.actionItems.length === 0 && (
                                <Text className="text-[16px] font-medium text-gray-700">
                                  No problem areas identified
                                </Text>
                              )}
                              {(o.actionItems.length === 1 || o.actionItems.length === 2) && (
                                <Text className="text-[16px] font-medium text-gray-700">
                                  Fewer areas than last visit
                                </Text>
                              )}
                              {o.actionItems.length > 2 && (
                                <Text className="text-[16px] font-medium text-gray-700">
                                  More areas than last visit
                                </Text>
                              )}
                            </View>
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
