import { useModel } from "@/hooks/useModel";
import type { ITimeSlotConfig } from "@/interfaces/ITimeSlotConfig";
import { cleanClassName } from "@/utils/clsx";

interface ICalenderTimeModelProps {
  bookedTimes: { startTime: string; endTime: string }[];
  timeSlotsConfig: ITimeSlotConfig;
  selectTime: (time: string) => void;
  selectedTime?: string | null;
  startDateSelectedTime?: string | null; // In case start time selected to filter the times before it
}

export default function CalenderTimeModel({
  bookedTimes,
  timeSlotsConfig,
  selectTime,
  selectedTime,
  startDateSelectedTime,
}: ICalenderTimeModelProps) {
  const { isOpen, modelRef, handleModel, setIsOpen } = useModel<HTMLDivElement>(
    {}
  );

  const onSelectTime = (e: React.MouseEvent, time: string) => {
    e.preventDefault();
    selectTime(time);
    setIsOpen(false);
  };

  const renderDayTimeSlots = () => {
    const timeSlots = Array.from(
      {
        length:
          (timeSlotsConfig.endHour - timeSlotsConfig.startHour) *
          (60 / timeSlotsConfig.intervalMinutes),
      },
      (_, i) => {
        const totalMinutes = i * timeSlotsConfig.intervalMinutes;
        const hour = Math.floor(totalMinutes / 60) + timeSlotsConfig.startHour;
        const minute = totalMinutes % 60;
        return `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
      }
    );

    bookedTimes.forEach((element) => {
      const startIdx = timeSlots.findIndex(
        (time) => time === element.startTime
      );
      const endIdx = timeSlots.findIndex((time) => time === element.endTime);

      if (startIdx === -1 || endIdx === -1) return;

      for (let i = startIdx; i <= endIdx; i++) {
        timeSlots[i] += "--booked";
      }
    });

    const firstSelectableIndex = startDateSelectedTime
      ? Math.max(
          0,
          timeSlots.findIndex(
            (t) =>
              toMinutes(t.replace("--booked", "")) >=
              toMinutes(startDateSelectedTime)
          )
        )
      : 0;

    const visible =
      firstSelectableIndex > 0
        ? timeSlots.slice(firstSelectableIndex)
        : timeSlots;

    return visible.map((time) => {
      const isBooked = time.endsWith("--booked");
      const displayTime = isBooked ? time.replace("--booked", "") : time;
      const baseStyle =
        " w-full h-8 text-sm rounded-md transition-all duration-200  place-self-center";
      const className = cleanClassName(
        baseStyle,
        isBooked
          ? "line-through text-gray-400 cursor-not-allowed hover:bg-transparent"
          : ""
      );
      return (
        <li key={time}>
          <button
            onClick={(e) => onSelectTime(e, displayTime)}
            className={className}
            disabled={isBooked}
          >
            {displayTime}
          </button>
        </li>
      );
    });
  };
  return (
    <div
      ref={modelRef}
      className={`border  border-black ${
        isOpen ? "border-b-0 rounded-b-none" : ""
      } rounded w-full relative`}
    >
      <button
        type="button"
        className={` w-full py-1 mb-1  ${isOpen ? "border-b" : ""}`}
        onClick={handleModel}
      >
        {selectedTime ? selectedTime : "בחר זמן"}
      </button>
      {isOpen && (
        <ul className="h-24 overflow-auto absolute top-full left-1/2 -translate-x-1/2 w-[calc(100%+2px)] border-black bg-main-white rounded border border-t-0 rounded-t-none">
          {renderDayTimeSlots()}
        </ul>
      )}
    </div>
  );
}

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};
