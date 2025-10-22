// Helper function to parse YYYY-MM date format or ISO date strings
export const parseDate = (val: string): Date => {
  // Handle YYYY-MM format (e.g., "2023-12")
  if (/^\d{4}-\d{1,2}$/.test(val)) {
    const parts = val.split('-');
    if (parts.length === 2) {
      const year = parts[0] ?? '2000';
      const month = parts[1] ?? '1';
      return new Date(parseInt(year), parseInt(month) - 1, 1);
    }
  }

  // Handle ISO date strings (e.g., "2024-03-21T15:44:06Z")
  const isoDate = new Date(val);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  throw new Error(
    `Invalid date format. Expected YYYY-MM format (e.g., "2023-12") or ISO date string. Got: ${val}`,
  );
};

// Duration calculation function
export const calculateDuration = (startDate: Date, endDate?: Date): string => {
  if (!endDate) {
    return 'Pågående';
  }

  const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  const months =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

  if (months === 0) {
    return '1 måned';
  } else if (months === 1) {
    return '1 måned';
  } else if (months < 12) {
    return `${months} måneder`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (remainingMonths === 0) {
      return years === 1 ? '1 år' : `${years} år`;
    } else {
      const yearText = years === 1 ? '1 år' : `${years} år`;
      const monthText = remainingMonths === 1 ? '1 måned' : `${remainingMonths} måneder`;
      return `${yearText}, ${monthText}`;
    }
  }
};

// Helper to add duration to project data
export const addDurationToProject = <
  T extends { startDate?: Date | undefined; endDate?: Date | undefined },
>(
  project: T,
): T & { duration: string } => ({
  ...project,
  duration: project.startDate
    ? calculateDuration(project.startDate, project.endDate)
    : 'No start date',
});
