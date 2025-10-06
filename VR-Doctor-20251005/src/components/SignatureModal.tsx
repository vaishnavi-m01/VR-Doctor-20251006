import React, { useEffect, useMemo, useRef } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Modal } from 'react-native';
import { Dimensions } from 'react-native';
import ExpoDraw from "expo-draw";
import { captureRef as takeSnapshotAsync } from "react-native-view-shot";

const { width, height } = Dimensions.get("window");

type SignatureModalProps = {
  label?: string;
  error?: string;
  value?: string;
  visible: boolean;
  onClose: () => void;
  signatureData: string;                          // expects full data URI: data:image/png;base64,xxxx
  setSignatureData: (value: string) => void;
};

const SignatureModal: React.FC<SignatureModalProps> = ({
  visible,
  label,
  onClose,
  signatureData,
  setSignatureData,
}) => {
  console.log(`🎯 SignatureModal rendered for: ${label}`);
  console.log(`🎯 SignatureModal visible: ${visible}`);
  console.log(`🎯 SignatureModal signatureData length: ${signatureData?.length || 0}`);
  const drawRef = useRef<any>(null);              // for .clear()
  const captureRef = useRef<any>(null);          // wrapper we will snapshot
  // const [showError, setShowError] = useState<boolean>(!!error); // Unused for now

  // useEffect(() => {
  //   if (value?.trim()) setShowError(false);
  //   else if (error) setShowError(true);
  // }, [value, error]);

  // Render the background image only if it's a valid data URI
  const hasExistingSignature = useMemo(() => {
    if (!signatureData || typeof signatureData !== "string") {
      console.log("SignatureModal - No signature data or invalid type");
      return false;
    }
    
    // Check if it's already a data URI
    const isDataUri = signatureData.startsWith("data:image");
    // Check if it's raw base64 (starts with common base64 chars and has reasonable length)
    const isRawBase64 = signatureData.length > 100 && /^[A-Za-z0-9+/=]+$/.test(signatureData);
    
    const isValid = isDataUri || isRawBase64;
    const displayUri = isDataUri ? signatureData : `data:image/png;base64,${signatureData}`;
    
    console.log("SignatureModal - ===== HAS EXISTING SIGNATURE CHECK =====");
    console.log("SignatureModal - signatureData:", signatureData.substring(0, 100) + "...");
    console.log("SignatureModal - type:", typeof signatureData);
    console.log("SignatureModal - length:", signatureData.length);
    console.log("SignatureModal - isDataUri:", isDataUri);
    console.log("SignatureModal - isRawBase64:", isRawBase64);
    console.log("SignatureModal - isValid:", isValid);
    console.log("SignatureModal - displayUri:", displayUri.substring(0, 100) + "...");
    console.log("SignatureModal - ======================================");
    
    return isValid;
  }, [signatureData]);

  // Debug when component mounts or signatureData changes
  useEffect(() => {
    console.log("SignatureModal - ===== COMPONENT MOUNT/SIGNATURE DATA CHANGE =====");
    console.log("SignatureModal - signatureData received:", signatureData ? signatureData.substring(0, 50) + "..." : "null/empty");
    console.log("SignatureModal - signatureData type:", typeof signatureData);
    console.log("SignatureModal - signatureData length:", signatureData?.length);
    console.log("SignatureModal - ================================================");
  }, [signatureData]);

  const handleSave = async () => {
    console.log(`🔄 handleSave called for: ${label}`);
    if (!captureRef.current) {
      console.log(`❌ captureRef is null for: ${label}`);
      return;
    }
    try {
      const dataUri = await takeSnapshotAsync(captureRef.current, {
        format: "png",
        quality: 0.9,
        result: "data-uri",
      });
      if (typeof dataUri === "string" && dataUri.startsWith("data:image")) {
        console.log(`✅ Signature captured for: ${label}`);
        console.log(`✅ Data URI length for ${label}:`, dataUri.length);
        console.log(`✅ Data URI preview for ${label}:`, dataUri.substring(0, 100) + "...");
        setSignatureData(dataUri);
        console.log(`✅ setSignatureData called successfully for: ${label}`);
      } else {
        console.log(`⚠️ Snapshot did not return a data-uri image for: ${label}`);
        console.log(`⚠️ Data URI type for ${label}:`, typeof dataUri);
        console.log(`⚠️ Data URI preview for ${label}:`, dataUri);
      }
    } catch (e) {
      console.log("❌ Snapshot error:", e);
    }
  };

  const handleReset = () => {
    if (drawRef.current && typeof drawRef.current.clear === "function") {
      try {
        drawRef.current.clear();
      } catch (e) {
        console.log("clear() failed:", e);
      }
    }
    setSignatureData("");
    // setShowError(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" hardwareAccelerated>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 16 }}>
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 24,
            width: width * 0.85,
            maxWidth: 750,
            height: height * 0.6,
            padding: 20,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 6,
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" }}>
            {label ? <Text style={{ fontSize: 18, fontWeight: "700", color: "#1f2937" }}>{label}</Text> : <View />}
            <TouchableOpacity onPress={onClose} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 18, color: "#4b5563", fontWeight: "700" }}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 13, color: "#4b5563", marginBottom: 12 }}>
            Please sign in the box below using your finger or stylus
          </Text>


           {/* Capture wrapper - single clean layer */}
           <View
             ref={captureRef}
             style={{
               flex: 1,
               backgroundColor: "#ffffff",
               borderRadius: 16,
               borderWidth: 1,
               borderColor: "#d1d5db",
               marginBottom: 16,
               overflow: "hidden",
               position: "relative",
             }}
           >
             {/* Existing signature as background */}
             {hasExistingSignature && (
               <Image
                 source={{ uri: signatureData.startsWith("data:image") ? signatureData : `data:image/png;base64,${signatureData}` }}
                 style={{ 
                   position: "absolute", 
                   top: 0, 
                   left: 0, 
                   right: 0,
                   bottom: 0,
                   width: "100%", 
                   height: "100%",
                   zIndex: 1,
                   backgroundColor: "transparent"
                 }}
                 resizeMode="contain"
                 pointerEvents="none"
                 onLoad={() => {
                   console.log("✅ Signature image loaded successfully");
                 }}
                 onError={(error: any) => {
                   console.log("❌ Signature image failed to load:", error);
                   console.log("❌ Signature data:", signatureData ? signatureData.substring(0, 100) + "..." : "null/empty");
                 }}
               />
             )}

            {/* Draw surface - single layer */}
            <ExpoDraw
              ref={drawRef}
              containerStyle={{ 
                flex: 1, 
                backgroundColor: "transparent",
                zIndex: 2,
              }}
              color="#000000"
              strokeWidth={3}
              enabled
            />
          </View>

          {/* Actions */}
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <TouchableOpacity onPress={handleReset} style={{ backgroundColor: "#fff1f2", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, borderWidth: 2, borderColor: "#fecaca", marginRight: 10 }}>
              <Text style={{ color: "#dc2626", fontWeight: "700" }}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={async () => {
                console.log(`🔄 Save button pressed for: ${label}`);
                await handleSave();        // wait for snapshot
                console.log(`🔄 Save completed for: ${label} - closing modal`);
                onClose();
              }}
              style={{ backgroundColor: "#0ea06c", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Save Signature</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SignatureModal;
