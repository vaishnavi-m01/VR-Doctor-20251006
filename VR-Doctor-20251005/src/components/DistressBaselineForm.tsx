import { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import BottomBar from "@components/BottomBar";
import { Btn } from "@components/Button";
import Toast from "react-native-toast-message";
import { UserContext } from "src/store/context/UserContext";
import Checkbox from "./Checkbox";
import FormCard from "./FormCard";
import Thermometer from "./Thermometer";
import { apiService } from "src/services";
import { RootStackParamList } from "src/Navigation/types";

type Question = {
  id: string;
  label: string;
  PDTWQID?: string;
};

type Category = {
  categoryName: string;
  questions: Question[];
};

interface SaveScoreResponse {
  PDWSID?: string;
}

interface SaveScoreRequest {
  ParticipantId: string;
  StudyId: string;
  ScaleValue: string;
  Notes: string;
  CreatedBy: string;
  ModifiedBy: string | null;
  CreatedDate: string;
  ModifiedDate: string;
  PDWSID?: string;
}

interface DistressBaselineFormProps {
  closeDistressBaselineForm: () => void;
  onScoreCalculated?: (score: number) => void;
}

export default function DistressBaselineForm({ closeDistressBaselineForm, onScoreCalculated }: DistressBaselineFormProps) {
  const [v, setV] = useState(0); // distress rating 0-10
  const [notes, setNotes] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otherProblems, setOtherProblems] = useState<string>("");
  const [PDWSID, setPDWSID] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [isDefaultForm, setIsDefaultForm] = useState(true);
  const [errors, setErrors] = useState<{ distressScore?: string; selectedProblems?: string }>({});

  const navigation = useNavigation<any>();
  const { userId } = useContext(UserContext);
  const route = useRoute<RouteProp<RootStackParamList, "DistressBaselineForm">>();
  const { patientId, age, studyId } = route.params as {
    patientId: number;
    age: number;
    studyId: number | string;
  };
  const [enteredPatientId, setEnteredPatientId] = useState<string>(`${patientId}`);

  const convertDateForAPI = (dateString: string): string => {
    if (!dateString) return "";
    const parts = dateString.split("-");
    if (parts.length !== 3) return dateString;
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  };

  const getData = async () => {
    console.log("DistressBaselineForm - getData called, current value:", v);
    try {
      setLoading(true);
      setError(null);
      setCategories([]);
      setOtherProblems("");
      setPDWSID(null);
      setSelectedProblems({});
      setNotes("");

      const participantId = enteredPatientId || `${patientId}`;
      const studyIdFormatted = typeof studyId === "string" ? studyId : `${studyId}`;

      // Fetch baseline distress thermometer questions and answers using API
      const res = await apiService.post<{ ResponseData: any[] }>(
        "/GetParticipantDistressThermometerBaselineQA",
        { ParticipantId: participantId }
      );

      const responseData = res.data?.ResponseData || [];

      if (responseData.length === 0) {
        setCategories([]);
        setError("No distress thermometer questions found.");
        return;
      }

      // Group questions by category and deduplicate
      const grouped: Record<string, Category> = {};
      const seenQuestions = new Set<string>();

      responseData.forEach((item) => {
        if (item.CategoryName && item.QuestionId) {
          const questionKey = `${item.CategoryName}-${item.QuestionId}`;
          if (!seenQuestions.has(questionKey)) {
            seenQuestions.add(questionKey);
            if (!grouped[item.CategoryName]) {
              grouped[item.CategoryName] = { categoryName: item.CategoryName, questions: [] };
            }
            grouped[item.CategoryName].questions.push({
              id: item.QuestionId,
              label: item.Question,
            });
          }
        }
      });

      setCategories(Object.values(grouped));

      // Set selected checkbox states from API (IsAnswered === "Yes")
      const selectedAnswers: Record<string, boolean> = {};
      responseData.forEach((item) => {
        if (item.QuestionId && item.IsAnswered) {
          selectedAnswers[item.QuestionId] = item.IsAnswered === "Yes";
        }
      });
      setSelectedProblems(selectedAnswers);

      try {
        const scoreRes = await apiService.post<{ ResponseData: any[] }>(
          "/GetParticipantDistressWeeklyScore",
          {
            ParticipantId: participantId,
            StudyId: studyIdFormatted,
          }
        );
        console.log("DistressBaselineForm - Full API response:", scoreRes.data);
        const scoreData = scoreRes.data?.ResponseData?.[0];
        console.log("DistressBaselineForm - Score data:", scoreData);
        if (scoreData) {
          const scaleValue = Number(scoreData.ScaleValue);
          console.log("DistressBaselineForm - Setting value to:", scaleValue);
          setV(scaleValue);
          setPDWSID(scoreData.PDWSID || null);
          setNotes(scoreData.Notes || "");
          setIsDefaultForm(false); // Mark as not default form since we have data
        } else {
          console.log("DistressBaselineForm - No score data found, isDefaultForm:", isDefaultForm);
          // Only reset to 0 if no existing data and this is a new form
          if (isDefaultForm) {
            console.log("DistressBaselineForm - Resetting value to 0 because no data found");
            setV(0);
          } else {
            console.log("DistressBaselineForm - Not resetting value, keeping current value:", v);
          }
        }
      } catch (err) {
        console.error("Failed to fetch distress score data:", err);
        console.log("DistressBaselineForm - API call failed, keeping current value:", v);
      }
    } catch (err) {
      console.error("Failed to fetch distress thermometer baseline data:", err);
      setError("Failed to load distress thermometer data. Please try again.");
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load distress thermometer data",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("DistressBaselineForm - useEffect triggered, enteredPatientId:", enteredPatientId);
    getData();
  }, [enteredPatientId]);

  const handleValidate = (showSuccessToast = true) => {
    const newErrors: typeof errors = {};
    const hasDistressScore = v > 0;
    const hasSelectedProblem = Object.values(selectedProblems).some((val) => val === true);

    if (!hasDistressScore && !hasSelectedProblem) {
      newErrors.distressScore = "Please rate your distress (0-10).";
      newErrors.selectedProblems = "Please select at least one problem.";
    } else {
      if (!hasDistressScore) {
        newErrors.distressScore = "Please rate your distress (0-10).";
      }
      if (!hasSelectedProblem) {
        newErrors.selectedProblems = "Please select at least one problem.";
      }
    }
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please correct the highlighted fields",
        position: "top",
        topOffset: 50,
      });
      return false;
    }

    if (showSuccessToast) {
      Toast.show({
        type: "success",
        text1: "Validation Passed",
        text2: "All required fields are valid",
        position: "top",
        topOffset: 50,
      });
    }
    return true;
  };

  const handleSave = async () => {
    if (!handleValidate(false)) return;
    try {
      setLoading(true);

      const distressData = categories.flatMap((cat) =>
        cat.questions.map((q) => ({
          DistressQuestionId: q.id,
          IsAnswered: selectedProblems[q.id] ? "Yes" : "No",
        }))
      );

      const createdDate = new Date().toISOString().split("T")[0];
      const studyIdFormatted = typeof studyId === "string" ? studyId : `${studyId}`;

      const reqObj: any = {
        ParticipantId: enteredPatientId,
        StudyId: studyIdFormatted,
        CreatedBy: userId || "UH-1000",
        ModifiedBy: userId || "UH-1000",
        CreatedDate: createdDate,
        ModifiedDate: createdDate,
        DistressData: distressData,
        OtherProblems: otherProblems || "",
      };

      // Call backend to add or update distress thermometer problems
      await apiService.post("/AddUpdateParticipantDistressThermometerBaselineQA", reqObj);

      const scoreObj: SaveScoreRequest = {
        ParticipantId: enteredPatientId,
        StudyId: studyIdFormatted,
        ScaleValue: v.toString(),
        Notes: notes || "",
        CreatedBy: userId || "UH-1000",
        ModifiedBy: userId || "UH-1000",
        CreatedDate: createdDate,
        ModifiedDate: createdDate,
      };

      console.log("DistressBaselineForm - Saving value:", v, "as string:", v.toString());

      if (PDWSID) {
        scoreObj.PDWSID = PDWSID;
      }
      const isAdd = PDWSID === null;

      // Call backend to add or update distress score
      const scoreRes = await apiService.post<SaveScoreResponse>(
        "/AddUpdateParticipantDistressThermometerScore",
        scoreObj
      );

      console.log("DistressBaselineForm - Save response:", scoreRes.data);

      if (scoreRes.data?.PDWSID) {
        setPDWSID(scoreRes.data.PDWSID);
        setIsDefaultForm(false); // Mark as not default form since we have data
      }

      // Call the callback with the calculated score
      if (onScoreCalculated) {
        onScoreCalculated(v);
      }

      Toast.show({
        type: "success",
        text1: isAdd ? "Added Successfully" : "Updated Successfully",
        text2: isAdd
          ? "Distress thermometer added successfully!"
          : "Distress thermometer updated successfully!",
      });
      
      // Close the form after successful save
      setTimeout(() => {
        closeDistressBaselineForm();
      }, 1000);
    } catch (err: any) {
      console.error("Save error:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.message || "Failed to save distress thermometer data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onChangeDistress = (value: number) => {
    console.log("DistressBaselineForm - Value changed to:", value);
    setV(value);
    setErrors((prevErrors) => ({ ...prevErrors, distressScore: undefined }));
  };

  const toggleProblem = (questionId: string) => {
    setSelectedProblems((prev) => {
      const newSelected = { ...prev, [questionId]: !prev[questionId] };
      setErrors((prevErrors) => ({ ...prevErrors, selectedProblems: undefined }));
      return newSelected;
    });
  };

  const handleClear = () => {
    setV(0);
    setNotes("");
    setSelectedProblems({});
    setOtherProblems("");
    setSelectedDate("");
    setShowDateDropdown(false);
    setIsDefaultForm(true);
    setCategories([]);
    getData();
    setErrors({});
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <View
          style={{
            backgroundColor: "white",
            borderBottomColor: "rgba(229, 231, 235, 1)",
            borderBottomWidth: 1,
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
            Participant ID: {enteredPatientId}
          </Text>
          <Text
            style={{
              color: "rgba(22, 163, 74, 1)",
              fontWeight: "600",
              fontSize: 16,
              lineHeight: 24,
            }}
          >
            Study ID: {studyId ? (typeof studyId === "string" ? studyId : `${studyId}`) : "CS-0001"}
          </Text>
          <Text style={{ color: "#4a5568", fontSize: 16, fontWeight: "600" }}>Age: {age || "N/A"}</Text>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#149943" />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1, padding: 16, backgroundColor: "#f9fafb" }}
          keyboardShouldPersistTaps="handled"
        >
          <FormCard icon="DT" title="Distress Thermometer">
            <Text style={{ fontWeight: "700", fontSize: 16, marginBottom: 12 }}>
              Rate Your Distress (0-10)
            </Text>
            <Thermometer value={v} onChange={onChangeDistress} />
            {errors.distressScore && (
              <Text style={{ color: "red", marginTop: 8 }}>{errors.distressScore}</Text>
            )}
          </FormCard>

          <FormCard icon="P" title="Problem List">
            {errors.selectedProblems && (
              <Text style={{ color: "red", marginVertical: 8 }}>{errors.selectedProblems}</Text>
            )}
            {categories.map((cat, i) => (
              <View key={cat.categoryName + i} style={{ marginBottom: 20 }}>
                <Text style={{ fontWeight: "700", fontSize: 16, marginBottom: 8 }}>
                  {cat.categoryName}
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {cat.questions.map((q) => (
                    <Checkbox
                      key={q.id}
                      label={q.label}
                      isChecked={!!selectedProblems[q.id]}
                      onToggle={() => toggleProblem(q.id)}
                      style={{ marginRight: 10, marginBottom: 10 }}
                    />
                  ))}
                </View>
              </View>
            ))}
          </FormCard>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      <BottomBar>
        <Text
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
            backgroundColor: "#0b362c",
            color: "white",
            fontWeight: "700",
          }}
        >
          Distress: {v}
        </Text>
        <Btn variant="light" onPress={handleClear}>
          Clear
        </Btn>
        <Btn onPress={handleSave} className="font-bold text-base">Save & Close</Btn>
      </BottomBar>
    </KeyboardAvoidingView>
  );
}
