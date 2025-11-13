const buildQueryParams = <T>(filter?: T): string => {
  if (!filter) return "";

  const params = new URLSearchParams();
  Object.entries(filter).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, String(value));
    }
  });

  return params.toString() ? `${params.toString()}` : "";
};

export default buildQueryParams;
