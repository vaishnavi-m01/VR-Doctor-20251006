
// Convert YYYY-MM-DD → DD-MM-YYYY
export const formatForUI = (dateStr: string): string => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}-${m}-${y}`;
};

// Convert DD-MM-YYYY → YYYY-MM-DD
export const formatForDB = (dateStr: string): string => {
  if (!dateStr) return "";
  const [d, m, y] = dateStr.split("-");
  return `${y}-${m}-${d}`;
};


export const formatDateDDMMYYYY = (dateStr: string): string => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

export const format = (dateStr: string): string => {
  if (!dateStr) return "";
  // Take only the date part before the space
  const [datePart] = dateStr.split(" "); // "2025-09-25"
  const [y, m, d] = datePart.split("-");
  return `${d}-${m}-${y}`;
};