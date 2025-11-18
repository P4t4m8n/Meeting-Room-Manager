export const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;

export const MONTHS_HEBREW: Record<(typeof MONTHS)[number], string> = {
  "january": "ינואר",
  february: "פברואר",
  march: "מרץ",
  april: "אפריל",
  may: "מאי",
  june: "יוני",
  july: "יולי",
  august: "אוגוסט",
  september: "ספטמבר",
  october: "אוקטובר",
  "november": "נובמבר",
  december: "דצמבר",
};

export const DAY_OF_WEEK = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export const CRUD_OPERATIONS = [
  "create",
  "update",
  "edit",
  "delete",
  "read",
] as const;
