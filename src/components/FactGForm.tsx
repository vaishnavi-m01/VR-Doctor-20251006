import React, { useState, useMemo, useEffect, useContext } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import Toast from "react-native-toast-message";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { Field } from "@components/Field"; // If needed for participant ID display
import DateField from "@components/DateField";
import FormCard from "./FormCard";
import BottomBar from "./BottomBar";
import { Btn } from "./Button";
import { RootStackParamList } from "src/Navigation/types";
import { apiService } from "src/services";
import { UserContext } from "src/store/context/UserContext";

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

const categoryCodeMapping: Record<string, string> = {
  "Physical well-being": "P",
  "Social/Family well-being": "S",
  "Emotional well-being": "E",
  "Functional well-being": "F",
};

const formatTodayDate = (): string => {
  const today = new Date();
  const dd = today.getDate().toString().padStart(2, "0");
  const mm = (today.getMonth() + 1).toString().padStart(2, "0");
  const yyyy = today.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const convertDateForAPI = (dateString: string): string => {
  // Convert DD-MM-YYYY to YYYY-MM-DD for API
  const [day, month, year] = dateString.split("-");
  return `${year}-${month}-${day}`;
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

interface FactGFormProps {
  closeFactGModal: () => void;
  onScoreCalculated?: (score: number) => void;
}



  export default function FactGForm({ closeFactGModal, onScoreCalculated }: FactGFormProps) {
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [subscales, setSubscales] = useState<Subscale[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(formatTodayDate());
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  const { userId } = useContext(UserContext);
  const route = useRoute<RouteProp<RootStackParamList, "EdmontonFactGScreen">>();
  const navigation = useNavigation();

  const { patientId, age, studyId } = route.params ?? {};

  const score: ScoreResults = useMemo(() => computeScores(answers, subscales), [answers, subscales]);

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
 

  const fetchFactG = async () => {
  try {
    setLoading(true);
    setError(null);
    setSubscales([]);
    setAnswers({});

    const participantId = `${patientId}`;
    const studyIdFormatted = studyId ? `${studyId}` : "CS-0001";

    const payload: any = {
      StudyId: studyIdFormatted,
      ParticipantId: participantId,
    };

    const response = await apiService.post<FactGResponse>(
      "/getParticipantFactGQuestionBaseline",
      payload
    );

    const questions = response.data?.ResponseData ?? [];

    if (questions.length === 0) {
      setError("No FACT-G questions found. Please try again.");
      setSubscales([]);
      setAnswers({});
      return;
    }

    // Group questions by category:
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

      // Avoid duplicates
      const alreadyExists = grouped[catName].items.some(
        (item) => item.code === q.FactGQuestionId
      );
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
      .filter((cat) => grouped[cat])
      .map((cat) => {
        grouped[cat].items.sort((a, b) => a.code.localeCompare(b.code));
        return grouped[cat];
      });

    setSubscales(orderedSubscales);

    const existingAnswers: Record<string, number | null> = {};
    questions.forEach((q) => {
      let val: number | null = null;
      if (
        q.ScaleValue !== null &&
        q.ScaleValue !== undefined &&
        q.ScaleValue !== "x"
      ) {
        val = parseInt(q.ScaleValue, 10);
        if (isNaN(val)) val = null;
      }
      existingAnswers[q.FactGQuestionId] = val;
      console.log(
        `QuestionId: ${q.FactGQuestionId}, ScaleValue: ${q.ScaleValue}, Parsed: ${val}`
      );
    });
    setAnswers(existingAnswers);
  } catch (err) {
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


  useEffect(() => {
    fetchFactG();
  }, [patientId, studyId]);

  const handleValidate = () => {
    const answeredQuestions = Object.entries(answers).filter(([_, v]) => v !== null && v !== undefined).length;

    if (answeredQuestions === 0) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "No responses entered. Please fill at least one question.",
        position: "top",
        topOffset: 50,
      });
      setFieldErrors(() => {
        const errors: Record<string, boolean> = {};
        subscales.forEach((scale) => {
          scale.items.forEach((item) => {
            errors[item.code] = true;
          });
        });
        return errors;
      });
      return false;
    }

    Toast.show({
      type: "success",
      text1: "Validation Passed",
      text2: "At least one question filled.",
      position: "top",
      topOffset: 50,
    });
    setFieldErrors({});
    return true;
  };

  const handleSave = async () => {
    if (!handleValidate()) return;

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

      const payload = {
        StudyId: studyId ?? "CS-0001",
        ParticipantId: String(patientId ?? ""),
        SessionNo: "SessionNo-1",
        FactGData: factGData,
        CreatedBy: userId ?? "UID-1",
        CreatedDate: selectedDate ? convertDateForAPI(selectedDate) : undefined,
      };

      const response = await apiService.post("/AddParticipantFactGQuestionsBaseline", payload);

      if (response.status === 200 || response.status === 201) {
        // Call the callback with the calculated score
        if (onScoreCalculated) {
          onScoreCalculated(score.TOTAL);
        }
        
        Toast.show({
          type: "success",
          text1: "Saved Successfully",
          text2: "FactG form saved successfully!",
          position: "top",
          topOffset: 50,
          visibilityTime: 1000,
       
         onHide: () => {
        closeFactGModal(); 
      
      }
     });
      } else {
        throw new Error(`Server returned status ${response.status}`);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error saving FACT-G",
        text2: error.message || "Failed to save FACT-G responses.",
        position: "top",
        topOffset: 50,
      });
    } finally {
      setSaving(false);
    }
  };

    const handleClear = () => {
    setAnswers({});
    // setSelectedDate("");
    // setSubscales([]);
    setError(null);
    setFieldErrors({});
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

  if (loading) {
    return (
      <View style={{ padding: 32, alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={{ marginTop: 8, color: "#6b7280" }}>Loading FACT-G questions...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View style={{ paddingHorizontal: 0, paddingTop: 8 }}>
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
            borderLeftWidth: 4,
            borderLeftColor: "#059669",
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ 
                backgroundColor: "#059669", 
                borderRadius: 20, 
                width: 40, 
                height: 40, 
                justifyContent: "center", 
                alignItems: "center",
                marginRight: 12 
              }}>
                <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>F</Text>
              </View>
              <View>
                <Text style={{ color: "#059669", fontWeight: "700", fontSize: 18 }}>
                  FACT-G Assessment
                </Text>
                <Text style={{ color: "#6b7280", fontSize: 14, marginTop: 2 }}>
                  Quality of Life Questionnaire
                </Text>
              </View>
            </View>
          </View>
          
          <View style={{ 
            flexDirection: "row", 
            justifyContent: "space-between", 
            alignItems: "center",
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb"
          }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: "#374151", fontWeight: "600", fontSize: 16 }}>
                Participant: 
              </Text>
              <Text style={{ color: "#059669", fontWeight: "700", fontSize: 16, marginLeft: 4 }}>
                {patientId ?? "N/A"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: "#374151", fontWeight: "600", fontSize: 16 }}>
                Study: 
              </Text>
              <Text style={{ color: "#059669", fontWeight: "700", fontSize: 16, marginLeft: 4 }}>
                {studyId ? `${studyId}` : "CS-0001"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: "#374151", fontWeight: "600", fontSize: 16 }}>
                Age: 
              </Text>
              <Text style={{ color: "#059669", fontWeight: "700", fontSize: 16, marginLeft: 4 }}>
                {age || "N/A"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1, paddingTop: 5, paddingHorizontal: 0, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        <FormCard icon="F" title="Fact G">
          <View style={{ flexDirection: "row", gap: 12, marginTop: 6 }}>
            <View style={{ flex: 1 }}>
              <Field label="Participant ID" placeholder={`Participant ID: ${patientId ?? "N/A"}`} value={`${patientId ?? ""}`} editable={false} />
            </View>
            <View style={{ flex: 1 }}>
              <DateField label="Date" value={selectedDate} onChange={setSelectedDate} mode="date" placeholder="DD-MM-YYYY" />
            </View>
          </View>
        </FormCard>

        <FormCard
          icon="FG"
          title={`FACT-G (Version 4)${selectedDate ? ` - ${selectedDate}` : ""}`}
          desc="Considering the past 7 days, choose one number per line. 0=Not at all ... 4=Very much."
        >
          {!loading && !error && subscales.length === 0 && (
            <Text style={{ textAlign: "center", marginVertical: 20, color: "#6b7280" }}>
              No FACT-G questions available for this date.
            </Text>
          )}

          {subscales.map((scale) => (
            <FormCard key={scale.key} icon={scale.shortCode} title={`${scale.label} (${subscaleScoreMap[scale.key]})`}>
              {scale.items.map((item, index) => (
                <View key={item.code}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <Text
                      style={{
                        width: 64,
                        fontWeight: "700",
                        marginLeft: 13,
                      }}
                    >
                      {index + 1}
                    </Text>
                    <Text style={{ flex: 1, fontSize: "1rem", color: "#374151" }}>
                      {item.text}
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
      </ScrollView>

      <BottomBar>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
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
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <Btn variant="light" onPress={handleClear} style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
              Clear
            </Btn>
            <Btn onPress={handleSave} disabled={saving} style={{ paddingHorizontal: 16, paddingVertical: 8 }} className="font-bold text-base">
              {saving ? "Saving..." : "Save & Close"}
            </Btn>
          </View>
        </View>
      </BottomBar>
    </KeyboardAvoidingView>
  );
}
