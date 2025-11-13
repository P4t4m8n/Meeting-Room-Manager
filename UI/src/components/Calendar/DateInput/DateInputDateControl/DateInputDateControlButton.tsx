import type { MouseEvent } from "react";
import Button from "../../../Button";
import IconArrow from "../../../Icons/IconArrow";

interface DateInputDateControlButtonProps {
  navigateYear: (direction: number) => void;
  navigateMonth: (direction: number) => void;
  direction: number;
}

export default function DateInputDateControlButton({
  navigateYear,
  navigateMonth,
  direction,
}: DateInputDateControlButtonProps) {
  const arrowStyle = `w-4 h-4 ${direction === -1 ? "-rotate-90" : "rotate-90"}`;
  const buttonStyle = `p-1 hover:bg-gray-100 rounded-md transition-colors flex bg-gray-100 hover:bg-gray-200 transition-colors duration-300 cursor-pointer`;

  const onClick = (
    e: MouseEvent,
    navigateFunction: (direction: number) => void
  ) => {
    e.preventDefault();
    navigateFunction(direction);
  };
  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={(e) => onClick(e, navigateYear)}
        className={buttonStyle}
        title="Previous Year"
      >
        <IconArrow className={arrowStyle} />
        <IconArrow className={arrowStyle} />
      </Button>
      <Button
        onClick={(e) => onClick(e, navigateMonth)}
        className={buttonStyle}
        title="Previous Month"
      >
        <IconArrow className={arrowStyle} />
      </Button>
    </div>
  );
}
