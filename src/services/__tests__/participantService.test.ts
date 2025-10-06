import { UserContext } from 'src/store/context/UserContext';
import { participantService } from '../participantService';
import { useContext } from 'react';
    const { userId, setUserId } = useContext(UserContext);



// Mock fetch globally
global.fetch = jest.fn();

describe('ParticipantService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch all participants successfully', async () => {
    const mockParticipants = [
      {
        ParticipantId: 'PID-1',
        MRNumber: 'H-0001',
        Age: 31,
        Gender: 'Male',
        MaritalStatus: 'Yes',
        NumberOfChildren: '2',
        EducationLevel: 'Master',
        EmploymentStatus: 'Yes',
        KnowledgeIn: 'English, Hindi, Telugu',
        PracticeAnyReligion: 'Yes',
        FaithContributeToWellBeing: 'Yes',
        CriteriaStatus: 'Included',
        GroupType: null,
        PhoneNumber: null,
        SortKey: 0,
        StudyId: 'CS-0001',
        Status: 1,
        CreatedBy: userId,
        CreatedDate: '2025-08-05T09:14:49.000Z',
        ModifiedBy: userId,
        ModifiedDate: '2025-08-07T15:07:47.000Z',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockParticipants,
    });

    const result = await participantService.getAllParticipants();

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockParticipants);
    expect(result.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://103.146.234.88:3007/api/participant-socio-demographics',
      expect.any(Object)
    );
  });

  it('should handle API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    await expect(participantService.getAllParticipants()).rejects.toThrow(
      'Network error'
    );
  });

  it('should fetch participants with filters', async () => {
    const mockParticipants = [
      {
        ParticipantId: 'PID-1',
        CriteriaStatus: 'Included',
        // ... other fields
      } as any,
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockParticipants,
    });

    const result = await participantService.getParticipants({
      criteriaStatus: 'Included',
    });

    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://103.146.234.88:3007/api/participant-socio-demographics?criteriaStatus=Included',
      expect.any(Object)
    );
  });
});
