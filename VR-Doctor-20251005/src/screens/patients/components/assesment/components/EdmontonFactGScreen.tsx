import React, { useState, useMemo, useEffect, useContext } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import FormCard from "../../../../../components/FormCard";
import BottomBar from "../../../../../components/BottomBar";
import { Btn } from "../../../../../components/Button";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../../../../Navigation/types";
import { apiService } from "../../../../../services/api";
import Toast from "react-native-toast-message";
import { UserContext } from 'src/store/context/UserContext';
import { KeyboardAvoidingView } from "react-native";
import { Platform } from "react-native";
import { Field } from "@components/Field";
import DateField from "@components/DateField";

interface FactGQuestion {
  FactGCategoryId: string;
  FactGCategoryName: string;
  FactGQuestionId: string;
  FactGQuestion: string;
  TypeOfQuestion: string;
  ScaleValue: string | null;
}

interface FactGResponse {
  ResponseData: FactGQuestion[];
}

interface WeeklyDateItem {
  CreatedDate: string;
}

interface WeeklyDatesResponse {
  ResponseData: WeeklyDateItem[];
}

interface Subscale {
  key: string;
  label: string;
  shortCode: string;
  items: {
    code: string;
    text: string;
    value?: string;
    FactGCategoryId?: string;
    TypeOfQuestion?: string;
  }[];
}

interface ScoreResults {
  PWB: number;
  SWB: number;
  EWB: number;
  FWB: number;
  TOTAL: number;
}

interface FactGResponse {
  FinalScore?: number;
}


const formatTodayDateForAPI = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};


const formatDate = (dateString: string): string => {
  // Handle ISO datetime strings like "2025-09-12T12:25:48.000Z"
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const convertDateForAPI = (dateString: string): string => {
  // Convert DD-MM-YYYY to YYYY-MM-DD for API
  const [day, month, year] = dateString.split("-");
  return `${year}-${month}-${day}`;
};

const formatTodayDate = (): string => {
  const today = new Date();
  const dd = today.getDate().toString().padStart(2, "0");
  const mm = (today.getMonth() + 1).toString().padStart(2, "0");
  const yyyy = today.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};


// Handles direct (+) and reverse (-) scoring
const calculateItemScore = (
  response: number | null,
  type: string | undefined
): number | null => {
  if (response === null || response === undefined) return null;

  if (type === "-") {
    switch (response) {
      case 0: return 4;
      case 1: return 3;
      case 2: return 2;
      case 3: return 1;
      case 4: return 0;
      default: return null;
    }
  } else { // includes "+" and any other cases
    switch (response) {
      case 0: return 0;
      case 1: return 1;
      case 2: return 2;
      case 3: return 3;
      case 4: return 4;
      default: return null;
    }
  }
};


const calculateSubscaleScore = (
  answers: Record<string, number | null>,
  items: { code: string; TypeOfQuestion?: string }[]
): number => {
  const totalQuestions = items.length;
  const answeredScores: number[] = [];

  items.forEach((item) => {
    const response = answers[item.code];
    const itemScore = calculateItemScore(response, item.TypeOfQuestion); 
    if (itemScore !== null) {
      answeredScores.push(itemScore);
    }
  });

  if (answeredScores.length === 0 || totalQuestions === 0) return 0;
  const sumScores = answeredScores.reduce((acc, val) => acc + val, 0);
  const finalScore = (sumScores * totalQuestions) / answeredScores.length;
  return Math.round(finalScore);
};


const computeScores = (answers: Record<string, number | null>, subscales: Subscale[]): ScoreResults => {
  const getSubscaleScore = (key: string) => {
    const subscale = subscales.find((s) => s.key === key);
    return subscale ? calculateSubscaleScore(answers, subscale.items) : 0;
  };

  const PWB = getSubscaleScore("Physical well-being");
  const SWB = getSubscaleScore("Social/Family well-being");
  const EWB = getSubscaleScore("Emotional well-being");
  const FWB = getSubscaleScore("Functional well-being");
  const TOTAL = PWB + SWB + EWB + FWB;

  return {
    PWB,
    SWB,
    EWB,
    FWB,
    TOTAL
  };
};


export default function EdmontonFactGScreen() {
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [subscales, setSubscales] = useState<Subscale[]>([]);
  const [loading, setLoading] = useState(false);
  const [_saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [isDefaultForm, setIsDefaultForm] = useState(true);

  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  const [initialized, setInitialized] = useState(false);

  const { userId } = useContext(UserContext);

  const todayFormatted = formatTodayDate();
  const isTodayInAvailableDates = availableDates.includes(todayFormatted);

  const route = useRoute<RouteProp<RootStackParamList, "EdmontonFactGScreen">>();
  const navigation = useNavigation();
  const { patientId, age, studyId } = route.params as {
    patientId: number;
    age: number;
    studyId: number;
  };

  const score: ScoreResults = useMemo(() => computeScores(answers, subscales), [answers, subscales]);

  const categoryCodeMapping: Record<string, string> = {
    "Physical well-being": "P",
    "Social/Family well-being": "S",
    "Emotional well-being": "E",
    "Functional well-being": "F",
  };

  const setAnswer = (code: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [code]: value }));
    setFieldErrors((prev) => {
      if (prev[code]) {
        const newErrors = { ...prev };
        delete newErrors[code];
        return newErrors;
      }
      return prev;
    });
  };


const subscaleScoreMap: Record<string, number> = {
  "Physical well-being": score.PWB,
  "Social/Family well-being": score.SWB,
  "Emotional well-being": score.EWB,
  "Functional well-being": score.FWB,
};



  const handleClear = () => {
    setAnswers({});
    setSelectedDate("");
    setShowDateDropdown(false);
    setSubscales([]);
    setError(null);
    setFieldErrors({});
    setIsDefaultForm(true);
    fetchFactG(null);
  };


  const fetchAvailableDates = async () => {
    try {
      const participantId = `${patientId}`;
      const studyIdFormatted = studyId ? `${studyId}` : "CS-0001";

      const response = await apiService.post<WeeklyDatesResponse>(
        "/GetParticipantFactGQuestionsWeeklyWeeks",
        {
          ParticipantId: participantId,
          StudyId: studyIdFormatted,
        }
      );

      const weeklyData = response.data?.ResponseData ?? [];

      const uniqueDatesSet = new Set(weeklyData.map(item => item.CreatedDate));
      const formattedDates = Array.from(uniqueDatesSet)
        .filter(date => date) // filters out null/undefined
        .map(formatDate);

      const sortedDates = formattedDates.sort((a, b) => {
        const dateA = new Date(convertDateForAPI(a));
        const dateB = new Date(convertDateForAPI(b));
        return dateB.getTime() - dateA.getTime();
      });

      setAvailableDates(sortedDates);

      const todayFormatted = formatTodayDate();


      if (sortedDates.includes(todayFormatted)) {
        setSelectedDate(todayFormatted);
        setIsDefaultForm(false);
      } else {
        setSelectedDate("");
        setIsDefaultForm(true);
      }


    } catch (error) {
      console.error("Failed to fetch available dates:", error);
      setAvailableDates([]);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch available dates",
      });
    }
  };



  const fetchFactG = async (dateToUse?: string | null) => {
    try {
      setLoading(true);
      setError(null);

      setSubscales([]);
      setAnswers({});

      let apiDate: string | null = null;
      if (dateToUse) {
        if (dateToUse.includes("-") && dateToUse.split("-")[0].length === 2) {
          apiDate = convertDateForAPI(dateToUse);
        } else {
          apiDate = dateToUse;
        }
      }

      const participantId = `${patientId}`;
      const studyIdFormatted = studyId ? `${studyId}` : "CS-0001";

      const payload: any = {
        StudyId: studyIdFormatted,
        ParticipantId: participantId,
      };

      if (apiDate) {
        payload.CreatedDate = apiDate;
        setIsDefaultForm(false);
      } else {
        setIsDefaultForm(true);
      }

      const response = await apiService.post<FactGResponse>(
        "/getParticipantFactGQuestionWeekly",
        payload
      );

      const questions = response.data?.ResponseData ?? [];

      if (questions.length === 0) {
        setError(
          apiDate
            ? "No FACT-G questions found for selected date."
            : "No FACT-G questions found. Please try again."
        );
        setSubscales([]);
        setAnswers({});
        return;
      }

      // Improved grouping avoiding duplicate question codes
      const grouped: Record<string, Subscale> = {};

      questions.forEach((q) => {
        const catName = q.FactGCategoryName;
        if (!grouped[catName]) {
          grouped[catName] = {
            key: catName,
            label: catName,
            shortCode: categoryCodeMapping[catName] || catName.charAt(0),
            items: [],
          };
        }

        // Check if question code already added for this category
        const alreadyExists = grouped[catName].items.some((item) => item.code === q.FactGQuestionId);
        if (!alreadyExists) {
          grouped[catName].items.push({
            code: q.FactGQuestionId,
            text: q.FactGQuestion,
            FactGCategoryId: q.FactGCategoryId,
            TypeOfQuestion: q.TypeOfQuestion,
            value: q.ScaleValue || undefined,
          });
        }
      });


      const categoryOrder = [
        "Physical well-being",
        "Social/Family well-being",
        "Emotional well-being",
        "Functional well-being",
      ];

      const orderedSubscales = categoryOrder
        .filter((catName) => grouped[catName])
        .map((catName) => {
          grouped[catName].items.sort((a, b) => a.code.localeCompare(b.code));
          return grouped[catName];
        });

      setSubscales(orderedSubscales);


      const existingAnswers: Record<string, number | null> = {};
      questions.forEach((q) => {
        if (q.FactGQuestionId) {
          if (!dateToUse) {
            existingAnswers[q.FactGQuestionId] = null;  // force empty for new form
          } else {
            if (q.ScaleValue !== null && q.ScaleValue !== undefined) {
              const val = parseInt(q.ScaleValue, 10);
              existingAnswers[q.FactGQuestionId] = isNaN(val) ? null : val;
            } else {
              existingAnswers[q.FactGQuestionId] = null;
            }
          }
        }
      });

      setAnswers(existingAnswers);
    } catch (err: any) {
      console.error("Failed to fetch FACT-G questions:", err);
      setError("Failed to load FACT-G questions. Please try again.");
      setSubscales([]);
      setAnswers({});
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load FACT-G assessment data",
      });
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   if (patientId) {
  //     fetchAvailableDates();
  //     setSelectedDate("");
  //     setIsDefaultForm(true);
  //   }
  // }, [patientId]);

  // useEffect(() => {
  //   if (patientId && selectedDate) {
  //     fetchFactG(selectedDate);
  //   } else if (patientId && !selectedDate) {
  //     fetchFactG(null);
  //   }
  // }, [selectedDate, patientId]);


  useEffect(() => {
    if (patientId) {
      fetchAvailableDates().then(() => setInitialized(true));
      setSelectedDate("");
      setIsDefaultForm(true);
    }
  }, [patientId]);

  useEffect(() => {
    if (!initialized) return;
    if (patientId && selectedDate) {
      fetchFactG(selectedDate);
    } else if (patientId && !selectedDate) {
      fetchFactG(null);
    }
  }, [selectedDate, patientId, initialized]);



  const handleValidate = () => {
    // const totalQuestions = subscales.reduce((count, scale) => count + scale.items.length, 0);
    const answeredQuestions = Object.entries(answers).filter(([_, v]) => v !== null && v !== undefined).length;

    if (answeredQuestions === 0) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'No responses entered. Please fill at least one question.',
        position: 'top',
        topOffset: 50,
      });

      setFieldErrors(() => {
        // Mark all fields with error because none are answered
        const errors: Record<string, boolean> = {};
        subscales.forEach(scale => {
          scale.items.forEach(item => {
            errors[item.code] = true;
          });
        });
        return errors;
      });
      return;
    }

    Toast.show({
      type: 'success',
      text1: 'Validation Passed',
      text2: 'At least one question filled.',
      position: 'top',
      topOffset: 50,
    });

  };


  const handleSave = async () => {
    // const totalQuestions = subscales.reduce((acc, scale) => acc + scale.items.length, 0);
    const answeredQuestions = Object.entries(answers).filter(([_, v]) => v !== null && v !== undefined).length;


    if (answeredQuestions === 0) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'No responses entered. Please fill at least one question before saving.',
        position: 'top',
        topOffset: 50,
      });

      setFieldErrors(() => {
        const errors: Record<string, boolean> = {};
        subscales.forEach(scale => {
          scale.items.forEach(item => {
            errors[item.code] = true;
          });
        });
        return errors;
      });
      return;
    }


    setFieldErrors({});

    setSaving(true);
    try {

      const factGData = Object.entries(answers).map(([code, val]) => {
        const found = subscales.flatMap((s) => s.items).find((i) => i.code === code);
        return {
          FactGCategoryId: found?.FactGCategoryId || "FGC_0001",
          FactGQuestionId: code,
          ScaleValue: val !== null ? String(val) : "x",
          FlagStatus: "Yes",
          WeekNo: 1,
        };
      });

      let createdDate: string | null;
      if (selectedDate) {
        createdDate =
          selectedDate.includes("-") && selectedDate.split("-")[0].length === 2
            ? convertDateForAPI(selectedDate)
            : selectedDate;
      } else {
        createdDate = formatTodayDateForAPI();
      }

      const payload = {
        StudyId: studyId ?? "CS-0001",
        ParticipantId: String(patientId),
        SessionNo: "SessionNo-1",
        FactGData: factGData,
        CreatedBy: userId ?? "UID-1",
        CreatedDate: createdDate,
      };

      const isAdd = !selectedDate || !availableDates.includes(selectedDate);

      //  Save data
      const response = await apiService.post("/AddParticipantFactGQuestionsWeekly", payload);

      if (response.status === 200 || response.status === 201) {

        Toast.show({
          type: "success",
          text1: isAdd ? 'Added Successfully' : 'Updated Successfully',
          text2: isAdd ? "FactG Added successfully!" : "FactG Updated successfully!",
          position: 'top',
          topOffset: 50,
          visibilityTime: 1000,
          onHide: () => {
            navigation.goBack();
            const navState = navigation.getState();

            // Check if navState exists before using it
            if (navState && navState.routes) {
              navigation.reset({
                index: 0,
                routes: navState.routes.map((r) =>
                  r.name === "PatientScreening"
                    ? { ...r, params: { ...(r.params ?? {}), CreatedDate: createdDate, PatientId: patientId } }
                    : r
                ) as any,
              });
            }
          },

        });

        await fetchAvailableDates();
      } else {
        throw new Error(`Server returned status ${response.status}`);
      }
    } catch (error: any) {
      console.error("Save error:", error);
      Toast.show({
        type: "error",
        text1: "Error saving FACT-G",
        text2: error.message || "Failed to save FACT-G responses.",
      });
    } finally {
      setSaving(false);
    }
  };

  const RatingButtons = ({
    questionCode,
    currentValue,
  }: {
    questionCode: string;
    currentValue: number | null;
  }) => {
    return (
      <View
        style={{ backgroundColor: "white", borderColor: "#e6eeeb", borderWidth: 1, borderRadius: 12, overflow: "hidden" }}
      >
        <View style={{ flexDirection: "row" }}>
          {[0, 1, 2, 3, 4].map((value) => {
            const isSelected = currentValue === value;
            return (
              <React.Fragment key={value}>
                <Pressable
                  onPress={() => setAnswer(questionCode, value)}
                  style={{
                    width: 48,
                    paddingVertical: 8,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isSelected ? "#7ED321" : "white",
                  }}
                >
                  <Text style={{ fontWeight: "500", fontSize: 14, color: isSelected ? "white" : "#4b5f5a" }}>{value}</Text>
                </Pressable>
                {value < 4 && <View style={{ width: 1, backgroundColor: "#e6eeeb" }} />}
              </React.Fragment>
            );
          })}
        </View>
      </View>
    );
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
            borderBottomColor: "rgba(229, 231, 235, 1)",
            borderBottomWidth: 2,
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
            }}

          >
            Study ID: {studyId ? `${studyId}` : 'CS-0001'}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Text style={{ color: "#4a5568", fontSize: 16, fontWeight: "600" }}>Age: {age || "Not specified"}</Text>

            {/* Date Dropdown */}
            <View className="w-32">
              <Pressable
                className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 flex-row justify-between items-center"
                onPress={() => setShowDateDropdown(!showDateDropdown)}
                style={{
                  backgroundColor: '#f8f9fa',
                  borderColor: '#e5e7eb',
                  borderRadius: 8,
                }}
              >
                <Text className="text-sm text-gray-700">
                  {selectedDate || (isDefaultForm ? "Select Date" : "Select Date")}
                </Text>
                <Text className="text-gray-500 text-xs">▼</Text>
              </Pressable>
            </View>

          </View>
        </View>
      </View>

      {/* Date Dropdown Menu */}
      {showDateDropdown && (
        <>
          {/* Backdrop to close dropdown */}
          <Pressable
            className="absolute top-0 left-0 right-0 bottom-0 z-[9998]"
            onPress={() => setShowDateDropdown(false)}
          />
          <View className="absolute top-20 right-6 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] w-32 max-h-48"
            style={{ elevation: 10, maxHeight: 80, overflow: 'hidden' }}
          >
            <Pressable
              className="px-3 py-2 border-b border-gray-100"
              onPress={() => {
                setSelectedDate("");
                setShowDateDropdown(false);
                setIsDefaultForm(true);
                setSubscales([]);
                setAnswers({});
                fetchFactG(null);
              }}
            >
              <Text className="text-sm text-gray-700 font-semibold">New Form</Text>
            </Pressable>


            <ScrollView style={{ maxHeight: 140 }}>

              {availableDates.length > 0 ? (
                availableDates.map((date, index) => (
                  <Pressable
                    key={date}
                    className={`px-3 py-2 ${index < availableDates.length - 1 ? 'border-b border-gray-100' : ''}`}
                    onPress={() => {
                      setSelectedDate(date);
                      setShowDateDropdown(false);
                      setIsDefaultForm(false);
                    }}
                  >
                    <Text className="text-sm text-gray-700">{date}</Text>
                  </Pressable>
                ))
              ) : (
                <View className="px-3 py-2">
                  <Text className="text-sm text-gray-500">No saved dates</Text>
                </View>
              )}
            </ScrollView>

          </View>
        </>
      )}

      {/* <ScrollView style={{ flex: 1, paddingVertical: 5, paddingHorizontal: 16 }}> */}
      <ScrollView className="flex-1 px-4 bg-bg pb-[400px]" style={{ paddingTop: 5 }} keyboardShouldPersistTaps="handled">

        <FormCard icon="F" title="Fact G">
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
            <View style={{ flex: 1 }}>
              <Field label="Participant ID" placeholder={`Participant ID: ${patientId}`} value={`${patientId}`} onChangeText={() => { }} />
            </View>
            <View style={{ flex: 1 }}>
              <DateField label="Date" value={formatTodayDate()} onChange={() => { }} />
            </View>
          </View>
        </FormCard>

        <FormCard
          icon="FG"
          title={`FACT-G (Version 4) ${isDefaultForm ? "- New Assessment" : selectedDate ? `- ${selectedDate}` : ""}`}
          desc="Considering the past 7 days, choose one number per line. 0=Not at all ... 4=Very much."
        >
          {loading && (
            <View style={{ backgroundColor: "white", borderRadius: 12, padding: 32, marginBottom: 16, alignItems: "center" }}>
              <ActivityIndicator size="large" color="#2E7D32" />
              <Text style={{ marginTop: 8, color: "#6b7280" }}>Loading FACT-G questions...</Text>
            </View>
          )}

          {error && (
            <View style={{ backgroundColor: "#fee2e2", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <Text style={{ color: "#b91c1c", textAlign: "center", fontWeight: "600" }}>{error}</Text>
              <Pressable onPress={() => fetchFactG(selectedDate || null)} style={{ marginTop: 8 }}>
                <Text style={{ color: "#2563eb", textAlign: "center", fontWeight: "600" }}>Try Again</Text>
              </Pressable>
            </View>
          )}

          {!loading &&
            !error &&
            subscales.map((scale) => (
              <FormCard key={scale.key} icon={scale.shortCode} title={`${scale.label} (${subscaleScoreMap[scale.key]})`} >
                {scale.items.map((item, index) => (
                  <View key={item.code}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <Text
                        style={{
                          width: 64,
                          fontWeight: "700",
                          // color: fieldErrors[item.code] ? "#dc2626" : "#1f2937",
                          marginLeft: 13,
                        }}
                      >
                        {index + 1}
                      </Text>
                      <Text style={{ flex: 1, fontSize: "1rem", color: "#374151" }}>{item.text}
                            <Text style={{ color: "#dc2626" }}> {item.TypeOfQuestion === "-" ? "(-)" : ""}</Text>
                      </Text>
                      <RatingButtons questionCode={item.code} currentValue={answers[item.code] ?? null} />
                    </View>
                    {index < scale.items.length - 1 && <View style={{ borderBottomColor: "#e5e7eb", borderBottomWidth: 1, marginVertical: 8 }} />}
                  </View>
                ))}
              </FormCard>
            ))}
        </FormCard>

        {!loading && !error && subscales.length > 0 && (
          <View style={{ backgroundColor: "#dbeafe", borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <Text style={{ fontWeight: "600", fontSize: 14, color: "#1e40af", marginBottom: 8 }}>Rating Scale:</Text>
            <Text style={{ fontSize: 13, color: "#1e40af" }}>
              0 = Not at all &nbsp;•&nbsp; 1 = A little bit &nbsp;•&nbsp; 2 = Somewhat &nbsp;•&nbsp; 3 = Quite a bit &nbsp;•&nbsp; 4 = Very much
            </Text>
          </View>
        )}

        <View style={{ height: 150 }} />
      </ScrollView>

      <BottomBar>
        <Text style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: "#0b362c", color: "white", fontWeight: "700" }}>
          PWB {score.PWB}
        </Text>
        <Text style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: "#0b362c", color: "white", fontWeight: "700" }}>
          SWB {score.SWB}
        </Text>
        <Text style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: "#0b362c", color: "white", fontWeight: "700" }}>
          EWB {score.EWB}
        </Text>
        <Text style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: "#0b362c", color: "white", fontWeight: "700" }}>
          FWB {score.FWB}
        </Text>
        <Text style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: "#0b362c", color: "white", fontWeight: "800" }}>
          TOTAL {score.TOTAL}
        </Text>

        <Btn variant="light" onPress={handleClear}>
          Clear
        </Btn>
        <Btn onPress={handleSave} className="font-bold text-base">Save & Close</Btn>
      </BottomBar>
    </KeyboardAvoidingView>

  );
}
