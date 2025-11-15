import { Button } from "@/components/ui/button";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { IDateTimePickerProps } from "@/interfaces/IDateTimePickerProps";
import DateTimePicker from "./DateTimePicker";

export default function DateTimePickerPopover(props: IDateTimePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full">
          <p>
            {props.date
              ? new Date(props.date).toLocaleDateString()
              : "בחר תאריך"}
          </p>
          -
          <p>
            {props.selectedTime
              ? props.selectedTime
              : "בחר שעה"}
          </p>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <DateTimePicker {...props} />
      </PopoverContent>
    </Popover>
  );
}
