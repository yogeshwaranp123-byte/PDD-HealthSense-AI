/**
 * Formats a disease key to a display label
 */
export const formatDiseaseName = (disease: string): string =>
  disease.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Returns a color for a probability value
 */
export const probabilityColor = (prob: number): string => {
  if (prob >= 70) return '#EF4444'; // danger
  if (prob >= 40) return '#F59E0B'; // warning
  return '#10B981'; // success
};

/**
 * Formats a date string to a readable format
 */
export const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return 'Unknown date';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Truncates text to a given character limit
 */
export const truncate = (text: string, limit = 80): string =>
  text.length > limit ? text.slice(0, limit) + '...' : text;

/**
 * Converts SHAP dict to sorted array
 */
export const shapToArray = (
  shap: Record<string, number>
): Array<{ feature: string; value: number }> =>
  Object.entries(shap)
    .map(([feature, value]) => ({ feature, value }))
    .sort((a, b) => b.value - a.value);

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * Validates password strength
 */
export const isValidPassword = (password: string): boolean =>
  password.length >= 6;

/**
 * Returns confidence label color
 */
export const confidenceColor = (confidence: string): string => {
  switch (confidence) {
    case 'high':   return '#EF4444';
    case 'medium': return '#F59E0B';
    default:       return '#10B981';
  }
};
