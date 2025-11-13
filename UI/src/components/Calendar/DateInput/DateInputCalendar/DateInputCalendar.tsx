import { useState } from "react";

interface DateInputDateDisplayProps {
  mode: "single" | "range";
  startDate?: Date | null;
  endDate?: Date | null;
  currentDate: Date;
  handleDateClick: (day?: number) => void;
}

export default function DateInputCalendar({
  mode,
  startDate,
  endDate,
  currentDate,
  handleDateClick,
}: DateInputDateDisplayProps) {
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateInRange = (date: Date) => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const isDateInHoverRange = (date: Date) => {
    if (!startDate || !hoverDate || !endDate) return false;

    return (
      date.getTime() >= Math.min(startDate.getTime(), hoverDate.getTime()) &&
      date.getTime() <= Math.max(startDate.getTime(), hoverDate.getTime())
    );
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<li key={`empty-${i}`} className="w-full h-8"></li>);
    }

    const today = new Date().toDateString();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const dateString = date.toDateString();
      const isToday = today === date.toDateString();

      const isSelected =
        (startDate && dateString === startDate?.toDateString()) ||
        (endDate && dateString === endDate?.toDateString());

      const isInRange = isDateInRange(date);
      const isInHoverRange = isDateInHoverRange(date);
      const isStartDate =
        startDate && date.toDateString() === startDate.toDateString();
      const isEndDate =
        endDate && date.toDateString() === endDate.toDateString();

      days.push(
        <button
          key={day}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDateClick(day);
          }}
          onMouseEnter={() => setHoverDate(date)}
          onMouseLeave={() => setHoverDate(null)}
          className={`
            w-full h-8 text-sm rounded-md transition-all duration-200 hover:bg-main-orange/50 place-self-center
            ${isToday ? "border border-amber font-semibold" : ""}
            ${
              isSelected
                ? "bg-main-orange/80 text-white hover:bg-main-orange"
                : ""
            }
            ${
              (isInRange || isInHoverRange) && !isSelected
                ? "bg-main-orange/10"
                : ""
            }
            ${isStartDate && mode === "range" ? "rounded-r-none" : ""}
            ${isEndDate && mode === "range" ? "rounded-l-none" : ""}
            ${
              (isInRange || isInHoverRange) &&
              !isStartDate &&
              !isEndDate &&
              mode === "range"
                ? "rounded-none"
                : ""
            }
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return <ul className="grid grid-cols-7 ">{renderCalendarDays()}</ul>;
}
