export interface IDateTimePickerProps {
  timeSlotsConfig: {
    startHour: number;
    endHour: number;
    intervalMinutes: number;
  };
  bookedDates?: Date[];
  bookedTimes?: string[];
  id?: string;
  handleDateChange?: (value: string, id: string, type: "date" | "time") => void;
  date?: Date | null;
  selectedTime?: string | null;
}
