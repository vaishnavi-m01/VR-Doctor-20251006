import BottomBar from "../../components/BottomBar";
import { Btn } from "../../components/Button";
import Formbox from "../../components/Formbox";
import FormCard from "../../components/FormCard";
import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../Navigation/types";

const DoctorDashboard = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [effect, setEffect] = useState<number | undefined>();
    const [clarity, setClarity] = useState<number | undefined>();
    const [confidence, setConfidence] = useState<number | undefined>();
    const [demo, setDemo] = useState('');
    const [controls, setControls] = useState('');
    const [guidance, setGuidance] = useState('');

    const [form, setForm] = useState({
        emailNotifications: true,
        pushNotifications: false,
    });

    const ready = (() => {
        const base = (effect && clarity && confidence) ? Math.round(((effect || 0) + (clarity || 0) + (confidence || 0)) / 3) : '—';
        const extras = Number(demo === 'Yes') + Number(controls === 'Yes') + Number(guidance === 'No');
        return base === '—' ? '—' : `${base}${extras ? ` (+${extras})` : ''}`;
    })();

    return (
        <>
            <View className="bg-white rounded-lg p-3 shadow">
                <View className="flex-row justify-between items-center">
                    <Text className="text-10  text-gray-600">🔎  Search participant,MRN, or session......</Text>

                    <View className="flex-row items-center space-x-2">
                        <Pressable 
                            onPress={() => navigation.navigate('Profile')}
                            className="w-8 h-8 rounded-lg bg-white border border-[#e6eeeb] items-center justify-center"
                        >
                            <Text className="text-lg">👤</Text>
                        </Pressable>
                    </View>
                </View>
            </View>

            <View className="flex-row justify-between mt-4  mx-1">

                <View className="flex-1 border border-gray-300 rounded-[25px] bg-green-50 py-2 mx-1 items-center justify-center">
                    <Text className="text-green-600 font-semibold">All Appointments</Text>
                </View>

                <View className="flex-1 border border-gray-300 rounded-[25px] bg-green-50 py-2 mx-1 items-center justify-center">
                    <Text className="text-green-600 font-semibold">Today</Text>
                </View>
            </View>


            <View className="bg-white rounded-2xl p-4 shadow mb-4 px-2 mx-2 mt-4 ">
                <View className="flex-row items-center">
                    <View className="w-14 h-14 bg-green-200 rounded-full mr-4" />
                    <View className="flex-1">
                        <Text className="text-lg font-semibold text-gray-900">
                            Dr. Rhea Ahuja
                        </Text>
                        <Text className="text-gray-600 text-sm">
                            Consultant Psycho-Oncologist • VR Therapy Lead
                        </Text>
                        <Text className="text-gray-500 text-xs">
                            Location: Out-patient Department • Room 204
                        </Text>
                    </View>
                    {/* <Switch /> */}
                    <View className="flex-row items-center space-x-2">
                        <Text className="text-gray-500 text-xs">Status</Text>
                        <Switch
                            onValueChange={emailNotifications =>
                                setForm({ ...form, emailNotifications })
                            }
                            className="scale-[0.95]"
                            value={form.emailNotifications}
                        />
                    </View>

                </View>
            </View>
            <View className="flex-row flex-wrap justify-between mb-2 mx-1">
                <Formbox icon="C">
                    <View className="bg-white rounded-lg w-16 h-16 p-1 items-center justify-center shadow">
                        <Text className="text-base font-bold text-gray-800">9</Text>
                        <Text
                            className="text-[10px] text-gray-500 text-center leading-tight"
                            numberOfLines={2}
                        >
                            Control Group
                        </Text>
                    </View>
                </Formbox>

                <Formbox icon="S">
                    <View className="bg-white rounded-lg w-16 h-16 p-1 items-center justify-center shadow">
                        <Text className="text-base font-bold text-gray-800">9</Text>
                        <Text
                            className="text-[10px] text-gray-500 text-center leading-tight"
                            numberOfLines={2}
                        >
                            Study Group
                        </Text>
                    </View>
                </Formbox>

                <Formbox icon="✔">
                    <View className="bg-white rounded-lg w-16 h-16 p-1 items-center justify-center shadow">
                        <Text className="text-base font-bold text-gray-800">4</Text>
                        <Text
                            className="text-[10px] text-gray-500 text-center leading-tight"
                            numberOfLines={2}
                        >
                            Completed VR
                        </Text>
                    </View>
                </Formbox>

                <Formbox icon="%">
                    <View className="bg-white rounded-lg w-16 h-16 p-1 items-center justify-center shadow">
                        <Text className="text-base font-bold text-green-600">22%</Text>
                        <Text
                            className="text-[10px] text-gray-500 text-center leading-tight"
                            numberOfLines={2}
                        >
                            Experience Rate
                        </Text>
                    </View>
                </Formbox>

                <Formbox icon="👥">
                    <View className="bg-white rounded-lg w-16 h-16 p-1 items-center justify-center shadow">
                        <Text className="text-base font-bold text-gray-800">18</Text>
                        <Text
                            className="text-[10px] text-gray-500 text-center leading-tight"
                            numberOfLines={2}
                        >
                            Total Participants
                        </Text>
                    </View>
                </Formbox>

                <Formbox icon="📅">
                    <View className="bg-white rounded-lg w-16 h-16 p-1 items-center justify-center shadow">
                        <Text className="text-base font-bold text-gray-800">8</Text>
                        <Text
                            className="text-[10px] text-gray-500 text-center leading-tight"
                            numberOfLines={2}
                        >
                            Today's Sessions
                        </Text>
                    </View>
                </Formbox>
            </View>




            <ScrollView className="flex-1 bg-white px-4 py-6 mt-2 pb-[200px]">
                <View className="flex-row mb-6">

                    <View className="flex-1 mr-2 bg-white rounded-2xl p-4 shadow border border-gray-200">
                        <Text className="text-base font-semibold text-gray-800 mb-3 ">
                            Today’s Schedule
                        </Text>

                        {[
                            { time: "09:10", name: "Samantha Ruth", status: "Arrived", text: "Open" },
                            { time: "09:40", name: "Akram", status: "Waiting", text: "Start" },
                            { time: "10:20", name: "Prashanthi", status: "Planned", text: "Open" },
                            { time: "11:00", name: "Kiran", status: "Planned", text: "Open" },
                        ].map((item, i) => (
                            <View
                                key={i}
                                className="flex-row justify-between items-center bg-white rounded-xl p-3 mb-3 border border-gray-300"
                            >
                                <View className="flex-row items-start flex-1">

                                    <Text className="font-semibold text-green-700 p-1 h-8 rounded-xl bg-[#F6F7F7] items-center">{item.time}</Text>

                                    <View className="items-start ml-1">
                                        <Text className="text-gray-800">{item.name}</Text>
                                        <Text className="text-xs text-gray-500">Room 204</Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center space-x-2">
                                    <Text
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === "Arrived"
                                            ? "bg-green-100 text-green-700"
                                            : item.status === "Waiting"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-gray-100 text-gray-600"
                                            }`}
                                    >
                                        {item.status}
                                    </Text>

                                    <Text className="ml-2 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                                        {item.text}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>


                    {/* Care Queue */}
                    <View className="ml-2 flex-1 bg-white rounded-2xl p-4 shadow border border-gray-200">
                        <Text className="text-base font-semibold text-gray-800 mb-3">Care Queue</Text>

                        {[
                            { name: "Anita", triage: "Green" },
                            { name: "Raghav", triage: "Amber" },
                            { name: "Mani", triage: "Red" },
                        ].map((item, i) => {
                            const triageColors = {
                                Green: { dot: "bg-green-500", bg: "bg-green-50", border: "border-green-500", text: "text-green-700" },
                                Amber: { dot: "bg-yellow-500", bg: "bg-yellow-50", border: "border-yellow-500", text: "text-yellow-700" },
                                Red: { dot: "bg-red-500", bg: "bg-red-50", border: "border-red-500", text: "text-red-700" },
                            };

                            const color = triageColors[item.triage as keyof typeof triageColors];

                            return (
                                <View
                                    key={i}
                                    className="flex-row justify-between items-center bg-white rounded-xl p-3 mb-3 border border-gray-300"
                                >
                                    <View className="flex-row items-start flex-1">
                                        {/* Dot */}
                                        <View className={`w-3 h-3 rounded-full mt-1 mr-2 ${color.dot}`} />

                                        <View>
                                            <Text className="text-gray-800 font-medium">Walk-in • {item.name}</Text>
                                            <Text className={`mt-1 px-2 py-0.5 text-xs`}>
                                                Triage: {item.triage}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Right: button */}
                                    <TouchableOpacity
                                        className={`px-3 py-1 rounded-full ${item.triage === "Red" ? "bg-red-100" : "bg-gray-100"}`}
                                    >
                                        <Text
                                            className={`text-xs font-semibold ${item.triage === "Red" ? "text-red-700" : "text-gray-600"}`}
                                        >
                                            {item.triage === "Red" ? "Prioritize" : "Add"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>

                </View>


                <BottomBar>
                    <Text className="px-3 py-2 rounded-xl bg-[#0b362c] text-white font-bold">Doctor Dashboard{String(ready)}</Text>
                    <Btn variant="light" onPress={() => { }}>Add Participant</Btn>
                    <Btn onPress={() => ""} className="min-w-[200]">
                        Start Quick Session
                    </Btn>

                </BottomBar>
            </ScrollView>
        </>

    );
};

export default DoctorDashboard;
