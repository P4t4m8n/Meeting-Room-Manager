import { DAY_OF_WEEK, MONTHS, MONTHS_HEBREW } from "@/consts/calendar";
import { useModel } from "@/hooks/useModel";
import { cleanClassName } from "@/utils/clsx";
import toTitle from "@/utils/toTitle";
import { useMemo, useState } from "react";
import IconCalendar from "../Icons/IconCalendar";
import CalendarNavigation from "./CalendarNavigation";
import type { ITimeSlotConfig } from "@/interfaces/ITimeSlotConfig";
import CalenderTimeModel from "./CalenderTimeModel";
import type { IBookedDateValue } from "@/interfaces/IBookedDateValue";

interface ICalendarProps {
  handleDateChange?: (value: string, id: string, type: "date" | "time") => void;
  timeSlotsConfig: ITimeSlotConfig;
  bookedValues?: IBookedDateValue[];
  dateId?: string;
  selectedDate?: Date | null;
  selectedTime?: string | null;
  disabled?: boolean;
  startDateSelectedTime?: string;
}
export default function Calendar({
  handleDateChange,
  timeSlotsConfig,
  dateId,
  selectedDate,
  selectedTime,
  startDateSelectedTime,
  bookedValues,
  disabled,
}: ICalendarProps) {
  const { isOpen, modelRef, handleModel } = useModel<HTMLDivElement>({});
  const [currentDate, setCurrentDate] = useState<Date>(
    selectedDate ?? new Date()
  );

  const onSelectDate = (day: number) => {
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );

    if (!handleDateChange) return;

    handleDateChange(clickedDate.toISOString(), dateId || "", "date");
    return;
  };

  const selectTime = (time: string) => {
    if (!handleDateChange) return;
    handleDateChange(time, dateId || "", "time");
    return;
  };

  const onClearSelection = () => {
    if (!handleDateChange) return;

    handleDateChange("", dateId || "", "date");
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
      MONTHS_HEBREW[MONTHS[currentDate.getMonth()]]
    )} ${currentDate.getFullYear()}`;
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
        selectedDate === null
          ? false
          : selectedDate?.toDateString() === dateString;

      const baseStyle =
        " w-full h-8 text-sm rounded-md transition-all duration-200 hover:bg-main-orange/50 place-self-center";

      const isTodayStyle = isToday ? "border border-main-bg font-semibold" : "";
      const isSelectedStyle = isSelected
        ? "bg-main-bg text-main-white hover:bg-main-orange"
        : "";
      const className = cleanClassName(
        baseStyle,
        isTodayStyle,
        isSelectedStyle
      );

      days.push(
        <button
          type="button"
          key={day}
          onClick={() => {
            onSelectDate(day);
          }}
          className={className}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  // const renderDayTimeSlots = () => {
  //   const bookedTimes =
  //     bookedValues
  //       ?.filter((val) => {
  //         const valDay = new Date(
  //           val.startValue.getFullYear(),
  //           val.startValue.getMonth(),
  //           val.startValue.getDate()
  //         );
  //         return (
  //           selectedDate &&
  //           valDay.toDateString() === selectedDate.toDateString()
  //         );
  //       })
  //       .map((val) => ({
  //         startTime: getTimeFromDate(val.startValue),
  //         endTime: getTimeFromDate(val.endValue),
  //       })) ?? [];

  //   const timeSlots = Array.from(
  //     {
  //       length:
  //         (timeSlotsConfig.endHour - timeSlotsConfig.startHour) *
  //         (60 / timeSlotsConfig.intervalMinutes),
  //     },
  //     (_, i) => {
  //       const totalMinutes = i * timeSlotsConfig.intervalMinutes;
  //       const hour = Math.floor(totalMinutes / 60) + timeSlotsConfig.startHour;
  //       const minute = totalMinutes % 60;
  //       return `${hour.toString().padStart(2, "0")}:${minute
  //         .toString()
  //         .padStart(2, "0")}`;
  //     }
  //   );

  //   bookedTimes.forEach((element) => {
  //     const startIdx = timeSlots.findIndex(
  //       (time) => time === element.startTime
  //     );
  //     const endIdx = timeSlots.findIndex((time) => time === element.endTime);

  //     if (startIdx === -1 || endIdx === -1) return;

  //     for (let i = startIdx; i <= endIdx; i++) {
  //       timeSlots[i] += "--booked";
  //     }
  //   });

  //   return timeSlots.map((time) => {
  //     const isBooked = time.endsWith("--booked");
  //     const displayTime = isBooked ? time.replace("--booked", "") : time;
  //     const baseStyle =
  //       " w-full h-8 text-sm rounded-md transition-all duration-200  place-self-center";
  //     const className = cleanClassName(
  //       baseStyle,
  //       isBooked
  //         ? "line-through text-gray-400 cursor-not-allowed hover:bg-transparent"
  //         : ""
  //     );
  //     return (
  //       <li key={time}>
  //         <button
  //           key={time}
  //           onClick={(e) => {
  //             e.preventDefault();
  //             if (isBooked) return;
  //             onSelectTime(displayTime);
  //           }}
  //           className={className}
  //         >
  //           {displayTime}
  //         </button>
  //       </li>
  //     );
  //   });
  // };

  const weekDaysTitles: string[] = DAY_OF_WEEK.map((day) =>
    toTitle(day.substring(0, 3))
  );

  const bookedTimes = useMemo(() => {
    return (
      bookedValues
        ?.filter((val) => {
          const valDay = new Date(
            val.startValue.getFullYear(),
            val.startValue.getMonth(),
            val.startValue.getDate()
          );
          return (
            selectedDate &&
            valDay.toDateString() === selectedDate.toDateString()
          );
        })
        .map((val) => ({
          startTime: getTimeFromDate(val.startValue),
          endTime: getTimeFromDate(val.endValue),
        })) ?? []
    );
  }, [bookedValues, selectedDate]);

  const getCalendarButtonText = () => {
    if (!selectedDate && !selectedTime) {
      return "בחר תאריך ושעה";
    }
    if (selectedDate && !selectedTime) {
      return `${selectedDate.getDate()}/${
        selectedDate.getMonth() + 1
      }/${selectedDate.getFullYear()}`;
    }

    //If we got here, selectedDate is defined
    return `${selectedDate!.getDate()}/${
      selectedDate!.getMonth() + 1
    }/${selectedDate!.getFullYear()} - ${selectedTime}`;
  };

  return (
    <div className="relative w-full" ref={modelRef}>
      <button
        className="p-2 rounded-lg bg-main-white w-full h-10 flex justify-between items-center text-center cursor-pointer border"
        onClick={handleModel}
      >
        {getCalendarButtonText()}
        <IconCalendar
          className=" rounded stroke-main-bg fill-none
        transition-all 
           duration-300 group border-2 w-6 h-6 border-transparent
           hover:border-main-black cursor-pointer"
        />
      </button>

      {isOpen && !disabled && (
        <div
          className="absolute top-[calc(100%+.25rem)]  grid gap-2
         bg-main-white border rounded-xl z-50 p-4 w-[calc(100svw-2rem)]"
        >
          {selectedDate ? (
            <button
              onClick={onClearSelection}
              className="px-3 py-1 text-xs bg-main-orange hover:bg-main-orange/90  text-red-700 rounded-md transition-colors"
            >
              Clear
            </button>
          ) : null}

          <div className="flex items-center justify-between">
            <CalendarNavigation
              navigateMonth={navigateMonth}
              navigateYear={navigateYear}
              direction={-1}
            />

            <h2 className="text-lg font-semibold">{getHeaderText()}</h2>

            <CalendarNavigation
              navigateMonth={navigateMonth}
              navigateYear={navigateYear}
              direction={1}
            />
          </div>
          <div className="grid gap-2">
            <ul className="grid grid-cols-7 justify-around ">
              {weekDaysTitles.map((day) => (
                <li
                  key={day}
                  className="text-center text-sm font-medium text-gray-500 "
                >
                  {day}
                </li>
              ))}
            </ul>
            <ul className="grid grid-cols-7 ">{renderCalendarDays()}</ul>
            <CalenderTimeModel
              bookedTimes={bookedTimes}
              selectedTime={selectedTime}
              selectTime={selectTime}
              timeSlotsConfig={timeSlotsConfig}
              startDateSelectedTime={startDateSelectedTime}
            />
          </div>
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

const getDaysInMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getFirstDayOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

const getTimeFromDate = (date: Date) => {
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};
