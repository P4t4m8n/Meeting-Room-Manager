import type { IDateRange } from "../../../../models/calendar.model";
import { calendarUtil } from "../../../../utils/calendar.util";

interface DateInputDateDisplayProps {
  mode: "single" | "range";
  dateRange?: IDateRange;
}

export default function DateInputDateDisplay({
  mode,
  dateRange,
}: DateInputDateDisplayProps) {
  const { start, end } = dateRange ?? {};
  const getDisplayText = () => {
    if (!start) {
      return "Select date" + (mode === "range" ? " range" : "");
    }
    if (mode === "single") {
      return calendarUtil.formatDate(start);
    }

    if (end) {
      return `${calendarUtil.getFormatDateRange(start, end)}`;
    }

    return `${calendarUtil.formatDate(start)} - Select end date`;
  };
  return <span className="">{getDisplayText()}</span>;
}
