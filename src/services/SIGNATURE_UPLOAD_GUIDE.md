# Informed Consent Signature Upload Guide

## Overview
This guide explains how to use the new `uploadInformedConsentSignatures` method for uploading signature images in the Informed Consent Form.

## API Method

### Endpoint
```
POST /AddUpdateParticipantInformedConsent
```

### Method Signature
```typescript
async uploadInformedConsentSignatures(payload: InformedConsentSignaturePayload): Promise<ApiResponse<any>>
```

## Payload Structure

The payload matches exactly the JSON structure you provided:

```typescript
interface InformedConsentSignaturePayload {
  PICDID?: string;                                    // Informed Consent ID (for updates)
  StudyId: string;                                    // Study identifier
  ParticipantId: string;                              // Participant ID
  QuestionId: string;                                 // Comma-separated question IDs
  Response: number;                                   // Response status (1 = acknowledged)
  
  // Subject (Participant) Signature
  SubjectSignatoryName: string;                       // Subject's name
  SubjectSignature: string;                           // Base64 signature data
  SubjectSignatureDate: string;                       // Signature date (YYYY-MM-DD)
  
  // Co-Principal Investigator Signature
  CoPrincipalInvestigatorSignatoryName: string;      // Co-PI's name
  CoPrincipalInvestigatorSignature: string;          // Base64 signature data
  CoPrincipalInvestigatorDate: string;               // Co-PI signature date
  
  // Study Investigator Signature
  StudyInvestigatorName: string;                      // Investigator's name
  WitnessSignature: string;                           // Base64 signature data
  WitnessName: string;                                // Witness name
  WitnessDate: string;                                // Witness signature date
  
  // System fields
  Status: number;                                     // Active status (1)
  CreatedBy: string;                                  // User ID who created the record
}
```

## Example Usage

### 1. Basic Usage
```typescript
import { apiService, InformedConsentSignaturePayload } from './api';

const payload: InformedConsentSignaturePayload = {
  PICDID: "PICDID-7",
  StudyId: "CS-0001",
  ParticipantId: "PID-1",
  QuestionId: "ICMID-1",
  Response: 1,
  SubjectSignatoryName: "John Doe",
  SubjectSignature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",
  SubjectSignatureDate: "2024-09-10",
  CoPrincipalInvestigatorSignatoryName: "Dr. Sarah Smith",
  CoPrincipalInvestigatorSignature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC",
  CoPrincipalInvestigatorDate: "2024-09-10",
  StudyInvestigatorName: "Dr. Michael Johnson",
  WitnessSignature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAOUlEQVQoU2NkIBIwEqmOgRhFDP///2eEKWBkZPxPjCJCBaMKRhUQrYAYRQyMjIxEKSJGEVGhQIwiAPoVI2MnZPn9AAAAAElFTkSuQmCC",
  WitnessName: "Jane Witness",
  WitnessDate: "2024-09-10",
  Status: 1,
  CreatedBy: "UID-1"
};

const response = await apiService.uploadInformedConsentSignatures(payload);
```

### 2. With Validation and Error Handling
```typescript
import { apiService, ApiService } from './api';

const uploadSignatures = async (payload: InformedConsentSignaturePayload) => {
  try {
    // Validate payload
    const validation = ApiService.validateSignaturePayload(payload);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Process signature data
    payload.SubjectSignature = ApiService.processSignatureData(payload.SubjectSignature);
    payload.CoPrincipalInvestigatorSignature = ApiService.processSignatureData(payload.CoPrincipalInvestigatorSignature);
    payload.WitnessSignature = ApiService.processSignatureData(payload.WitnessSignature);

    // Upload
    const response = await apiService.uploadInformedConsentSignatures(payload);
    
    if (response.success) {
      console.log('✅ Signatures uploaded successfully');
      return response.data;
    } else {
      throw new Error(response.message || 'Upload failed');
    }
  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw error;
  }
};
```

### 3. Integration with SignatureModal
```typescript
import { uploadInformedConsentSignatures } from '../services/informedConsentExample';

const handleSaveInformedConsent = async () => {
  const result = await uploadInformedConsentSignatures(
    participantId,                    // string
    studyId,                         // string
    {
      subjectName: signatures.subjectName,
      subjectSignature: subjectSignaturePad,        // From SignatureModal
      subjectDate: formatDateForAPI(new Date()),
      coPIName: signatures.coPIName,
      coPISignature: coPISignaturePad,              // From SignatureModal
      coPIDate: formatDateForAPI(new Date()),
      investigatorName: signatures.investigatorName,
      witnessName: signatures.witnessName,
      witnessSignature: witnessSignaturePad,        // From SignatureModal
      witnessDate: formatDateForAPI(new Date())
    },
    acknowledgedQuestionIds,         // string[]
    userId,                         // string
    existingPICDID                  // string | undefined (for updates)
  );

  if (result.success) {
    // Handle success
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: 'Informed consent signatures saved successfully!'
    });
  } else {
    // Handle error
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: result.error || 'Failed to save signatures'
    });
  }
};
```

## Utility Methods

### 1. Process Signature Data
```typescript
// Converts raw base64 to data URI if needed
const processedSignature = ApiService.processSignatureData(signatureData);
```

### 2. Validate Payload
```typescript
// Validates all required fields
const validation = ApiService.validateSignaturePayload(payload);
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}
```

### 3. Format Date
```typescript
// Formats date for API (YYYY-MM-DD)
const formattedDate = formatDateForAPI(new Date());
```

## Signature Data Format

The method expects signature data in one of these formats:

1. **Data URI format** (preferred):
   ```
   data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==
   ```

2. **Raw base64** (automatically converted):
   ```
   iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==
   ```

## Error Handling

The method includes comprehensive error handling:

- **Validation errors**: Checks all required fields
- **Network errors**: Handles API communication issues
- **Signature processing**: Automatically processes signature data format
- **Response validation**: Checks API response success status

## Integration Points

This method integrates with:

1. **SignatureModal component**: For capturing signatures
2. **Informed Consent Form**: For form submission
3. **Authentication service**: For user identification
4. **Date utilities**: For proper date formatting

## Files Modified

1. `src/services/api.ts` - Added main method and interfaces
2. `src/services/informedConsentExample.ts` - Example usage and utilities
3. `src/services/SIGNATURE_UPLOAD_GUIDE.md` - This documentation

## Testing

Use the example payload in `informedConsentExample.ts` to test the functionality:

```typescript
import { createExamplePayload } from './informedConsentExample';

const testPayload = createExamplePayload();
const response = await apiService.uploadInformedConsentSignatures(testPayload);
```
