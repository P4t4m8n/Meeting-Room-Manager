const toTitle = (str?: string | null | unknown): string => {
  return str && typeof str === "string"
    ? str
        .replace(/([A-Z])/g, " $1")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/_/g, " ")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .trim()
    : "";
};

export default toTitle;
