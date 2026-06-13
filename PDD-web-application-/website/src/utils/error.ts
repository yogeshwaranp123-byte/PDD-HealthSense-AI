export const formatError = (e: any, fallback: string): string => {
  const detail = e?.response?.data?.detail;
  if (!detail) {
    return e?.message || fallback;
  }
  if (typeof detail === 'string') {
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
  }
  if (typeof detail === 'object') {
    return detail.message || JSON.stringify(detail);
  }
  return fallback;
};
