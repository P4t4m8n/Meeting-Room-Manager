import { useState, type MouseEvent } from "react";
;

export const useDateInput = (
  handleDateSelect: (range: IDateRange) => void,
  initialMode: TDateInputMode,
  selectedRange?: IDateRange
) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [mode, setMode] = useState<TDateInputMode>(initialMode);

  //TODO?? Refactor logic to handle edit and not just create new date
  // This is a workaround to handle the case where the selectedRange is null
  const handleDateClick = (day: number | undefined) => {
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );

    if (mode === "single") {
      handleDateSelect({ start: clickedDate, end: clickedDate });
    } else {
      if (!selectedRange?.start || selectedRange?.end) {
        handleDateSelect({ start: clickedDate, end: null });
      } else {
        const start = selectedRange.start;
        const end = clickedDate;
        handleDateSelect({
          start: start! <= end ? start : end,
          end: start! <= end ? end : start,
        });
      }
    }
  };

  const clearSelection = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleDateSelect({ start: null, end: null });
  };

  return {
    currentDate,
    setCurrentDate,
    mode,
    setMode,
    handleDateClick,
    clearSelection,
  };
};
