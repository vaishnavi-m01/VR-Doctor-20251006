import { apiService, InformedConsentSignaturePayload, ApiService } from './api';

/**
 * Example usage of Informed Consent Signature Upload
 * 
 * This file demonstrates how to use the new uploadInformedConsentSignatures method
 * for uploading signature images in the Informed Consent Form.
 */

// Example payload matching the JSON structure you provided
export const createExamplePayload = (): InformedConsentSignaturePayload => {
  return {
    PICDID: "PICDID-7",
    StudyId: "CS-0001",
    ParticipantId: "PID-1",
    QuestionId: "ICMID-1",
    Response: 1,
    
    // Subject (Participant) Signature
    SubjectSignatoryName: "John Doe",
    SubjectSignature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",
    SubjectSignatureDate: "2024-09-10",
    
    // Co-Principal Investigator Signature
    CoPrincipalInvestigatorSignatoryName: "Dr. Sarah Smith",
    CoPrincipalInvestigatorSignature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC",
    CoPrincipalInvestigatorDate: "2024-09-10",
    
    // Study Investigator Signature
    StudyInvestigatorName: "Dr. Michael Johnson",
    WitnessSignature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAOUlEQVQoU2NkIBIwEqmOgRhFDP///2eEKWBkZPxPjCJCBaMKRhUQrYAYRQyMjIxEKSJGEVGhQIwiAPoVI2MnZPn9AAAAAElFTkSuQmCC",
    WitnessName: "Jane Witness",
    WitnessDate: "2024-09-10",
    
    // System fields
    Status: 1,
    CreatedBy: "UID-1"
  };
};

// Example function to upload signatures with validation
export const uploadInformedConsentSignatures = async (
  participantId: string,
  studyId: string,
  signatures: {
    subjectName: string;
    subjectSignature: string;
    subjectDate: string;
    coPIName: string;
    coPISignature: string;
    coPIDate: string;
    investigatorName: string;
    witnessName: string;
    witnessSignature: string;
    witnessDate: string;
  },
  questionIds: string[],
  userId: string,
  existingPICDID?: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    // Create payload
    const payload: InformedConsentSignaturePayload = {
      PICDID: existingPICDID, // For updates, leave undefined for new records
      StudyId: studyId,
      ParticipantId: participantId,
      QuestionId: questionIds.join(','),
      Response: 1,
      
      // Process signature data to ensure proper format
      SubjectSignatoryName: signatures.subjectName,
      SubjectSignature: ApiService.processSignatureData(signatures.subjectSignature),
      SubjectSignatureDate: signatures.subjectDate,
      
      CoPrincipalInvestigatorSignatoryName: signatures.coPIName,
      CoPrincipalInvestigatorSignature: ApiService.processSignatureData(signatures.coPISignature),
      CoPrincipalInvestigatorDate: signatures.coPIDate,
      
      StudyInvestigatorName: signatures.investigatorName,
      WitnessName: signatures.witnessName,
      WitnessSignature: ApiService.processSignatureData(signatures.witnessSignature),
      WitnessDate: signatures.witnessDate,
      
      Status: 1,
      CreatedBy: userId
    };

    // Validate payload
    const validation = ApiService.validateSignaturePayload(payload);
    if (!validation.isValid) {
      console.error('❌ Validation failed:', validation.errors);
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`
      };
    }

    // Upload signatures
    console.log('📤 Uploading Informed Consent Signatures...');
    const response = await apiService.uploadInformedConsentSignatures(payload);
    
    if (response.success) {
      console.log('✅ Informed Consent Signatures uploaded successfully');
      return {
        success: true,
        data: response.data
      };
    } else {
      console.error('❌ Upload failed:', response.message);
      return {
        success: false,
        error: response.message || 'Upload failed'
      };
    }
    
  } catch (error) {
    console.error('❌ Error uploading signatures:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Example function for processing signature from SignatureModal
export const processSignatureFromModal = (signatureData: string): string => {
  return ApiService.processSignatureData(signatureData);
};

// Example function to format date for API
export const formatDateForAPI = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Example usage in a React component:
/*
import { uploadInformedConsentSignatures, processSignatureFromModal, formatDateForAPI } from '../services/informedConsentExample';

const handleSaveInformedConsent = async () => {
  const result = await uploadInformedConsentSignatures(
    "PID-1",                    // participantId
    "CS-0001",                  // studyId
    {
      subjectName: "John Doe",
      subjectSignature: subjectSignaturePad,        // From SignatureModal
      subjectDate: formatDateForAPI(new Date()),
      coPIName: "Dr. Sarah Smith",
      coPISignature: coPISignaturePad,              // From SignatureModal
      coPIDate: formatDateForAPI(new Date()),
      investigatorName: "Dr. Michael Johnson",
      witnessName: "Jane Witness",
      witnessSignature: witnessSignaturePad,        // From SignatureModal
      witnessDate: formatDateForAPI(new Date())
    },
    ["ICMID-1", "ICMID-2"],     // questionIds
    "UID-1",                    // userId
    undefined                    // existingPICDID (for updates)
  );

  if (result.success) {
    console.log('Signatures uploaded successfully!');
    // Handle success
  } else {
    console.error('Upload failed:', result.error);
    // Handle error
  }
};
*/
