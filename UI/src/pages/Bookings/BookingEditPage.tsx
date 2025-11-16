import { useEffect, useState } from "react";
import { useParams } from "react-router";

import { bookingsService } from "@/services/bookingService";
import { roomsService } from "@/services/room.service";

import { AppError } from "@/utils/AppError";
import bookingUtil from "@/utils/booking.util";
import handleInputChange from "@/utils/form.util";
import toTitle from "@/utils/toTitle";

import AttendeeEdit from "@/components/Bookings/AttendeeEdit";
import DateTimePickerPopover from "@/components/Calendar/DateTimePickerPopover";
import InputText from "@/components/Form/InputText";
import RadioGroup from "@/components/Form/RadioGroup";
import TextArea from "@/components/Form/TextArea";
import RoomPreview from "@/components/Rooms/RoomPreview";
import BackButton from "@/components/ui/BackButton";

import type { IBookingAttendeeDTO } from "@/models/BookingAttendeeDTO";
import {
  BOOKING_STATUS,
  BOOKING_STATUS_LABELS,
  type IBookingDTO,
} from "@/models/BookingDTO";
import { useAuth } from "@/hooks/useAuth";
import { TrashIcon } from "lucide-react";

export default function BookingEditPage() {
  const { bookingId, roomId } = useParams<{
    bookingId: string;
    roomId: string;
  }>();
  const [bookingToEdit, setBookingToEdit] = useState<IBookingDTO | null>(null);
  const { user } = useAuth();

  console.log("🚀 ~ BookingEditPage ~ bookingToEdit:", bookingToEdit);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      try {
        if (!bookingId && !roomId) {
          throw AppError.create(
            "Either bookingId or roomId must be provided",
            400
          );
        }

        if (bookingId === "new" || !bookingId) {
          const { data: room } = await roomsService.getById(roomId);
          if (!room) {
            throw AppError.create("Room not found", 404);
          }
          const emptyBooking = bookingUtil.getEmpty();
          emptyBooking.room = room;
          setBookingToEdit(emptyBooking);
          return;
        }

        if (bookingId) {
          const { data: booking } = await bookingsService.getById(bookingId);
          if (!booking) {
            throw AppError.create("Booking not found", 404);
          }
          setBookingToEdit(booking);
          return;
        }
      } catch (error) {
        console.error("Failed to fetch booking data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [bookingId, roomId]);

  const handleDateChange = (
    value: string,
    id: string,
    type: "date" | "time"
  ) => {
    const key = (id + toTitle(type)) as keyof IBookingDTO;

    setBookingToEdit((prev) => ({ ...prev, [key]: value || null }));
  };

  const upsetAttendee = (attendee: IBookingAttendeeDTO) => {
    setBookingToEdit((prev) => {
      if (!prev) return prev;

      const attendees = prev.attendees ? [...prev.attendees] : [];

      const idx = attendees?.findIndex((a) => a.id === attendee.id);
      if (idx > -1) {
        return {
          ...prev,
          attendees: attendees.map((a) =>
            a.email === attendee.email ? attendee : a
          ),
        };
      }

      return { ...prev, attendees: [...attendees, attendee] };
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!bookingToEdit) {
    return <div>No booking data available.</div>;
  }

  const { startTime, startDate, endTime, endDate, status, title, room } =
    bookingToEdit;

  const titleText = title
    ? title
    : `פגישה בחדר ${bookingToEdit.room?.name || ""}`;

  const isAdmin = user?.role === "Admin";
  return (
    <main className="h-mobile-main flex flex-col gap-4 p-4">
      <header className="inline-flex items-center">
        <BackButton />
        <h2 className="text-center pl-12 w-full text-main-white font-semibold text-xl">
          {bookingId === "new" ? "הזמן חדר" : "ערוך הזמנת חדר"}
        </h2>
      </header>

      <form className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="w-full">
            <DateTimePickerPopover
              id="start"
              timeSlotsConfig={{
                startHour: 8,
                endHour: 18,
                intervalMinutes: 10,
              }}
              handleDateChange={handleDateChange}
              selectedTime={startTime}
              date={startDate ? new Date(startDate) : undefined}
            />
          </div>

          <div className="w-full">
            <DateTimePickerPopover
              id="end"
              timeSlotsConfig={{
                startHour: 8,
                endHour: 18,
                intervalMinutes: 10,
              }}
              handleDateChange={handleDateChange}
              selectedTime={endTime}
              date={endDate ? new Date(endDate) : undefined}
            />
          </div>
        </div>

        <InputText
          inputProps={{
            name: "title",
            id: "title",
            value: titleText,
            onChange: (e) => handleInputChange(e, setBookingToEdit),
          }}
          labelProps={{
            htmlFor: "title",
            children: "כותרת",
          }}
        />

        <TextArea
          onChange={(e) => handleInputChange(e, setBookingToEdit)}
          name="description"
          placeholder="פרטים נוספים על הפגישה"
          value={bookingToEdit.description || ""}
        />

        {isAdmin ? (
          <RadioGroup
            items={BOOKING_STATUS}
            onChange={(e) => handleInputChange(e, setBookingToEdit)}
            isCheckedFn={(item) => item === status}
            itemsLabels={BOOKING_STATUS_LABELS}
          />
        ) : (
          <div>
            <h3 className="font-semibold text-main-white mb-1">סטטוס</h3>
            <p className="p-2 bg-main-white rounded">
              {BOOKING_STATUS_LABELS[status ?? "Pending"]}
            </p>
          </div>
        )}
        <div className="shadow-[0_0_0_1px_var(--color-main-white-border)] p-1 rounded text-main-white">
          <h3 className="font-semibold">מוזמנים</h3>
          <ul className="flex flex-col gap-2 p-1">
            <li className="flex items-center justify-between">
              <p>הוסף מוזמן</p>
              <AttendeeEdit
                attendee={{ name: "", email: "" }}
                saveAttendee={upsetAttendee}
              />
            </li>
            {bookingToEdit.attendees && bookingToEdit.attendees.length > 0
              ? bookingToEdit.attendees.map((attendee) => (
                  <li
                    key={attendee.email}
                    className="flex items-center justify-between"
                  >
                    <div className="flex flex-col gap-1">
                      <p>
                        <span>שם:</span>
                        <span>{attendee.name}</span>
                      </p>
                      <p>
                        <span>אימייל:</span>
                        <span>{attendee.email}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <AttendeeEdit
                        attendee={attendee}
                        saveAttendee={upsetAttendee}
                      />
                      <button className="bg-inherit p-0">
                        <TrashIcon className="bg-inherit h-5 w-5 leading-0" />
                      </button>
                    </div>
                  </li>
                ))
              : null}
          </ul>
        </div>

        {room ? <RoomPreview room={room} /> : null}
      </form>
    </main>
  );
}
