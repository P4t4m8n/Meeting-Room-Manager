import { useState } from "react";
import { useModel } from "../../../hooks/useModel";
import { DAY_OF_WEEK, MONTHS } from "../../../consts/calendar";
import toTitle from "../../../utils/toTitle";
import { twMerge } from "tailwind-merge";
import IconCalendar from "../../Icons/IconCalendar";
import IconArrow from "../../Icons/IconArrow";

export interface IDateRange {
  startTime?: Date | null;
  endTime?: Date | null;
}

interface DateInputProps {
  handleDateSelect: (range: IDateRange) => void;
  disabled?: boolean;
  className?: string;
  selectedRange?: IDateRange | null;
  errorRange?: {
    startDate?: string | Date | null;
    endDate?: string | Date | null;
  } | null;
}

export default function DateInput({
  handleDateSelect,
  selectedRange,
  disabled = false,
  className = "",
  errorRange,
}: DateInputProps) {
  const { isOpen, modelRef, handleModel } = useModel<HTMLDivElement>({});
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  //TODO?? Refactor logic to handle edit and not just create new date
  // This is a workaround to handle the case where the selectedRange is null
  const handleDateClick = (day: number | undefined) => {
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );

    if (!selectedRange?.startTime || selectedRange?.endTime) {
      handleDateSelect({ startTime: clickedDate, endTime: null });
    } else {
      const startTime = selectedRange.startTime;
      const endTime = clickedDate;
      handleDateSelect({
        startTime: startTime! <= endTime ? startTime : endTime,
        endTime: startTime! <= endTime ? endTime : startTime,
      });
    }
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleDateSelect({ startTime: null, endTime: null });
  };

  const weekDays: string[] = DAY_OF_WEEK.map((day) =>
    toTitle(day.substring(0, 3))
  );

  const buildError = () => {
    if (!errorRange) return null;
    const { startDate, endDate } = errorRange;
    return (
      <div className="text-error-red text-sm flex gap-4">
        {startDate && (
          <span className="inline-flex">
            <h6 className=" ">Start Date</h6>
            <p className=" ">:invalid Date</p>
          </span>
        )}
        {endDate && (
          <span className="inline-flex">
            <h6 className=" ">End Date</h6>
            <p className=" ">:invalid Date</p>
          </span>
        )}
      </div>
    );
  };

  const isError = errorRange?.startDate || errorRange?.endDate;

  const divStyle = twMerge("relative w-full", className);
  const buttonStyle = twMerge(
    "p-2 rounded w-full h-10 flex justify-between items-center cursor-pointer border",
    isError ? "border border-error-red text-error-red" : ""
  );

  const { startTime, endTime } = selectedRange ?? {};

  const formatDate = (
    date?: Date | string | null,
    options?: Intl.DateTimeFormatOptions
  ): string => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-IL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      ...options,
    });
  };

  const navigateYear = (direction: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setFullYear(prev.getFullYear() + direction);
      return newDate;
    });
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getHeaderText = () => {
    return `${toTitle(
      MONTHS[currentDate.getMonth()]
    )} ${currentDate.getFullYear()}`;
  };

  const getDatesDisplayText = () => {
    if (!startTime) {
      return "בחר תאריך התחלה";
    }

    return `${formatDate(startTime)} - ${
      endTime ? formatDate(endTime) : "בחר תאריך סיום"
    }`;
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateInRange = (date: Date) => {
    if (!startTime || !endTime) return false;
    return date >= startTime && date <= endTime;
  };

  const isDateInHoverRange = (date: Date) => {
    if (!startTime || !hoverDate || !endTime) return false;

    return (
      date.getTime() >= Math.min(startTime.getTime(), hoverDate.getTime()) &&
      date.getTime() <= Math.max(startTime.getTime(), hoverDate.getTime())
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
        (startTime && dateString === startTime?.toDateString()) ||
        (endTime && dateString === endTime?.toDateString());

      const isInRange = isDateInRange(date);
      const isInHoverRange = isDateInHoverRange(date);
      const isStartTime =
        startTime && date.toDateString() === startTime.toDateString();
      const isEndTime =
        endTime && date.toDateString() === endTime.toDateString();

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
            ${isStartTime ? "rounded-r-none" : ""}
            ${isEndTime ? "rounded-l-none" : ""}
            ${
              (isInRange || isInHoverRange) && !isStartTime && !isEndTime
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

  return (
    <div className={divStyle} ref={modelRef}>
      {buildError()}
      <button onClick={handleModel} className={buttonStyle}>
        {getDatesDisplayText()}
        <IconCalendar
          className="bg-main-black rounded stroke-amber fill-none
           hover:bg-amber hover:stroke-main-black transition-all 
           duration-300 group border-2 w-6 h-6 border-transparent
           hover:border-main-black cursor-pointer"
        />
      </button>

      {isOpen && !disabled && (
        <div
          className="absolute top-[calc(100%+.25rem)] left-0 grid gap-2
         bg-black-500 border rounded-xl z-50 p-4 w-full"
        >
          {startTime ? (
            <button
              onClick={clearSelection}
              className="px-3 py-1 text-xs bg-main-orange hover:bg-main-orange/90  text-red-700 rounded-md transition-colors"
            >
              Clear
            </button>
          ) : null}
          <div className="flex items-center justify-between">
            <DateInputDateControlButton
              navigateMonth={navigateMonth}
              navigateYear={navigateYear}
              direction={-1}
            />

            <h2 className="text-lg font-semibold">{getHeaderText()}</h2>

            <DateInputDateControlButton
              navigateMonth={navigateMonth}
              navigateYear={navigateYear}
              direction={1}
            />
          </div>
          <ul className="grid grid-cols-7 justify-around ">
            {weekDays.map((day) => (
              <li
                key={day}
                className="text-center text-sm font-medium text-gray-500 "
              >
                {day}
              </li>
            ))}
          </ul>
          <ul className="grid grid-cols-7 ">{renderCalendarDays()}</ul>
          <button
            className={`bg-inherit border p-2 hover:bg-main-orange h-10
                                  hover:text-white rounded transition-all duration-300
                                  hover:cursor-pointer  `}
            onClick={handleModel}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

interface DateInputDateControlButtonProps {
  navigateYear: (direction: number) => void;
  navigateMonth: (direction: number) => void;
  direction: number;
}

function DateInputDateControlButton({
  navigateYear,
  navigateMonth,
  direction,
}: DateInputDateControlButtonProps) {
  const arrowStyle = `w-4 h-4 ${direction === -1 ? "-rotate-90" : "rotate-90"}`;
  const buttonStyle = `p-1 hover:bg-gray-100 rounded-md transition-colors flex bg-gray-100 hover:bg-gray-200 transition-colors duration-300 cursor-pointer`;

  const onClick = (
    e: React.MouseEvent,
    navigateFunction: (direction: number) => void
  ) => {
    e.preventDefault();
    navigateFunction(direction);
  };
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={(e) => onClick(e, navigateYear)}
        className={buttonStyle}
        title="Previous Year"
      >
        <IconArrow className={arrowStyle} />
        <IconArrow className={arrowStyle} />
      </button>
      <button
        onClick={(e) => onClick(e, navigateMonth)}
        className={buttonStyle}
        title="Previous Month"
      >
        <IconArrow className={arrowStyle} />
      </button>
    </div>
  );
}
