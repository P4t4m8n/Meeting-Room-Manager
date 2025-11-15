import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import type { IDateTimePickerProps } from "@/interfaces/IDateTimePickerProps";


export default function DateTimePicker({
  timeSlotsConfig,
  bookedDates,
  id,
  date,
  selectedTime,
  handleDateChange,
}: IDateTimePickerProps) {
  // const [date, setDate] = useState<Date | undefined>(initialDate || new Date());

  // const [selectedTime, setSelectedTime] = useState<string | null>(
  //   initialTime || "10:00"
  // );
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

  const onSelectDate = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    if (!handleDateChange) return;

    handleDateChange(selectedDate.toISOString(), id || "", "date");
    return;
  };
  const setSelectedTime = (time: string) => {
    if (!handleDateChange) return;
    handleDateChange(time, id || "", "time");
    return;
  };

  return (
    <Card className="gap-0 p-0">
      <CardContent className="relative p-0 md:pr-48">
        <div className="p-6">
          <Calendar
            mode="single"
            selected={date ? date : undefined}
            onSelect={onSelectDate}
            defaultMonth={date ? date : undefined}
            disabled={bookedDates}
            showOutsideDays={false}
            modifiers={{
              booked: bookedDates,
            }}
            modifiersClassNames={{
              booked: "[&>button]:line-through opacity-100",
            }}
            className="bg-transparent p-0 [--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)]"
            formatters={{
              formatWeekdayName: (date) => {
                return date.toLocaleString("en-US", { weekday: "short" });
              },
            }}
          />
        </div>
        <div className="no-scrollbar inset-y-0 right-0 flex max-h-72 w-full scroll-pb-6 flex-col gap-4 overflow-y-auto border-t p-6 md:absolute md:max-h-none md:w-48 md:border-t-0 md:border-l">
          <div className="grid gap-2">
            {timeSlots.map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? "default" : "outline"}
                onClick={() => setSelectedTime(time)}
                className="w-full shadow-none"
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
