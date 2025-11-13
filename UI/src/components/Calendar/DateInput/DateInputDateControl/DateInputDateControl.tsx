import type { Dispatch } from "react";
import toTitle  from "../../../../../utils/toTitle";
import DateInputDateControlButton from "./DateInputDateControlButton";
import { MONTHS } from "../../../../../../../shared/consts/app.consts";

interface DateInputDateControlProps {
  setCurrentDate: Dispatch<React.SetStateAction<Date>>;
  currentDate: Date;
}
export default function DateInputDateControl({
  setCurrentDate,
  currentDate,
}: DateInputDateControlProps) {
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
  return (
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
  );
}
