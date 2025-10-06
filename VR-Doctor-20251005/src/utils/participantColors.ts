/**
 * Utility function to get background color based on participant GroupType and creation date
 * @param groupType - The participant's group type ('Study', 'Controlled', or null)
 * @param createdDate - The participant's creation date (optional)
 * @returns Tailwind CSS class for background color
 */
export const getParticipantBackgroundColor = (groupType: string | null, createdDate?: string): string => {
  // Check if participant is newly added (within last 7 days)
  const isNewlyAdded = createdDate && isParticipantNewlyAdded(createdDate);
  
  if (isNewlyAdded) {
    return 'bg-[#F3E8FF]'; // New participant color (light purple/lavender)
  }
  
  if (groupType === 'Study') {
    return 'bg-[#EBF6D6]'; // Study Group color
  } else if (groupType === 'Controlled') {
    return 'bg-[#FFE8DA]'; // Controlled Group color
  } else {
    return 'bg-[#D2EBF8]'; // Null/Unassign color
  }
};

/**
 * Helper function to check if a participant is newly added (within last 7 days)
 * @param createdDate - The participant's creation date
 * @returns boolean indicating if participant is newly added
 */
export const isParticipantNewlyAdded = (createdDate: string): boolean => {
  try {
    const created = new Date(createdDate);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays <= 7; // Consider "new" if created within last 7 days
  } catch (error) {
    console.error('Error parsing created date:', error);
    return false;
  }
};

/**
 * Color mapping for reference:
 * - Newly Added (≤7 days): bg-[#F3E8FF] (light purple/lavender)
 * - Study Group: bg-[#EBF6D6] (light green)
 * - Controlled Group: bg-[#FFE8DA] (light orange/peach)
 * - Null/Unassign: bg-[#D2EBF8] (light blue)
 */
