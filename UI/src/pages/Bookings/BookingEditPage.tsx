import { useEffect, useState } from "react";
import { useParams } from "react-router";

import { bookingsService } from "@/services/bookingService";
import { roomsService } from "@/services/room.service";

import { AppError } from "@/utils/AppError";
import bookingUtil from "@/utils/booking.util";
import handleInputChange from "@/utils/form.util";
import toTitle from "@/utils/toTitle";

import AttendeeEdit from "@/components/Bookings/AttendeeEdit";
import InputText from "@/components/Form/InputText";
import RadioGroup from "@/components/Form/RadioGroup";
import TextArea from "@/components/Form/TextArea";
import RoomPreview from "@/components/Rooms/RoomPreview";

import BackButton from "@/components/ui/BackButton";

import {
  BOOKING_STATUS,
  BOOKING_STATUS_LABELS,
  type IBookingDTO,
  type IBookingEditDTO,
} from "@/models/BookingDTO";
import { useAuth } from "@/hooks/useAuth";
import Calendar from "@/components/Calendar/Calendar";
import type { IBookingAttendeeDTO } from "@/models/BookingAttendeeDTO";
import { IconTrash } from "@/components/Icons/IconTrash";
import type { IBookedDateValue } from "@/interfaces/IBookedDateValue";

export default function BookingEditPage() {
  const { bookingId, roomId } = useParams<{
    bookingId: string;
    roomId: string;
  }>();
  const [bookingToEdit, setBookingToEdit] = useState<IBookingEditDTO | null>(
    null
  );
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

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

          const [startDateEdit, startTimeEdit] = (
            booking?.startTime ?? ""
          ).split("T");
          const [endDateEdit, endTimeEdit] = (booking?.endTime ?? "").split(
            "T"
          );

          const bookingEdit: IBookingEditDTO = {
            ...booking,
            startDateEdit,
            startTimeEdit,
            endDateEdit,
            endTimeEdit,
          };
          setBookingToEdit(bookingEdit);
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
    const key = (id + toTitle(type) + "Edit") as keyof IBookingDTO;
    const normalized = type === "date" ? toYMD(value) : value;
    setBookingToEdit((prev) => ({ ...prev, [key]: normalized || null }));
  };

  const upsetAttendee = (attendee: IBookingAttendeeDTO) => {
    setBookingToEdit((prev) => {
      if (!prev) return prev;

      const attendees = prev.attendees ? [...prev.attendees] : [];

      const idx = attendees?.findIndex((a) => a.email === attendee.email);
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

  const onSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!bookingToEdit) return;
      setIsSaving(true);
      console.log(
        "🚀 ~ onSubmit ~ bookingToEdit.startDateEdit :",
        bookingToEdit.startDateEdit
      );
      console.log(
        "🚀 ~ onSubmit ~ bookingToEdit.startTimeEdit:",
        bookingToEdit.startTimeEdit
      );
      if (bookingToEdit.startDateEdit || bookingToEdit.startTimeEdit) {
        const datePart = toYMD(
          bookingToEdit.startDateEdit ||
            bookingToEdit.startTime?.split("T")[0] ||
            ""
        );
        const timePart =
          bookingToEdit.startTimeEdit ||
          (bookingToEdit.startTime?.slice(11, 16) ?? "");
        bookingToEdit.startTime = `${datePart}T${timePart}`;
        console.log("startTime", new Date(bookingToEdit.startTime));
      }

      if (bookingToEdit.endDateEdit || bookingToEdit.endTimeEdit) {
        const datePart = toYMD(
          bookingToEdit.endDateEdit ||
            bookingToEdit.endTime?.split("T")[0] ||
            ""
        );
        const timePart =
          bookingToEdit.endTimeEdit ||
          (bookingToEdit.endTime?.slice(11, 16) ?? "");
        bookingToEdit.endTime = `${datePart}T${timePart}`;
        console.log("endTime", new Date(bookingToEdit.endTime));
      }

      bookingToEdit.roomId = bookingToEdit.room?.id || null;

      delete bookingToEdit.startDateEdit;
      delete bookingToEdit.startTimeEdit;
      delete bookingToEdit.endDateEdit;
      delete bookingToEdit.endTimeEdit;
      delete bookingToEdit.room;
      delete bookingToEdit.owner;

      console.log(bookingToEdit);
    } catch (error) {
      console.error("Failed to save booking:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!bookingToEdit) {
    return <div>No booking data available.</div>;
  }

  const {
    startDateEdit,
    startTimeEdit,
    endDateEdit,
    endTimeEdit,
    status,
    title,
    room,
  } = bookingToEdit;

  const titleText = title
    ? title
    : `פגישה בחדר ${bookingToEdit.room?.name || ""}`;

  const isAdmin = user?.role === "Admin";

  const bookedValues: IBookedDateValue[] =
    bookingToEdit?.room?.bookings?.map((b) => ({
      startValue: new Date(b.startTime ?? ""),
      endValue: new Date(b.endTime ?? ""),
    })) || [];

  const timeSlotsConfig = {
    startHour: 8,
    endHour: 18,
    intervalMinutes: 10,
  };

  const startDateSelectedTime =
    startDateEdit &&
    endDateEdit &&
    startTimeEdit &&
    new Date(startDateEdit).toDateString() ===
      new Date(endDateEdit).toDateString()
      ? addMinutes(startTimeEdit, timeSlotsConfig.intervalMinutes)
      : undefined;
  return (
    <main className="h-mobile-main flex flex-col gap-4 p-4">
      <header className="inline-flex items-center">
        <BackButton />
        <h2 className="text-center pl-12 w-full text-main-white font-semibold text-xl">
          {bookingId === "new" ? "הזמן חדר" : "ערוך הזמנת חדר"}
        </h2>
      </header>

      <form className="flex flex-col gap-4 h-full" onSubmit={onSubmit}>
        <div className="grid  gap-4">
          <Calendar
            dateId="start"
            timeSlotsConfig={timeSlotsConfig}
            handleDateChange={handleDateChange}
            selectedTime={startTimeEdit}
            selectedDate={startDateEdit ? new Date(startDateEdit) : undefined}
            bookedValues={bookedValues}
          />

          <Calendar
            dateId="end"
            timeSlotsConfig={timeSlotsConfig}
            handleDateChange={handleDateChange}
            selectedTime={endTimeEdit}
            selectedDate={endDateEdit ? new Date(endDateEdit) : undefined}
            bookedValues={bookedValues}
            startDateSelectedTime={startDateSelectedTime}
          />
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

        <div className="border  p-1 rounded-lg text-main-white">
          <h3 className="font-semibold">מוזמנים</h3>
          <ul className="flex flex-col gap-2 p-1 h-28 overflow-auto">
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
                    <p className="inline-flex gap-1">
                      <span>אימייל:</span>
                      <span className="text-main-white-border">
                        {attendee.email}
                      </span>
                    </p>
                    <div className="flex items-center gap-2">
                      <AttendeeEdit
                        attendee={attendee}
                        saveAttendee={upsetAttendee}
                      />
                      <button className="bg-inherit p-0">
                        <IconTrash className="bg-inherit h-5 w-5 leading-0" />
                      </button>
                    </div>
                  </li>
                ))
              : null}
          </ul>
        </div>

        {room ? <RoomPreview room={room} isRoomList={false} /> : null}

        <button
          disabled={isSaving}
          className="mt-auto bg-main-white rounded-lg py-1 "
        >
          {bookingId ? "שמור שינויים" : "צור פגישה"}
        </button>
      </form>
    </main>
  );
}
const addMinutes = (time: string, minutes: number) => {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
};

const toYMD = (value: string) => {
  if (!value) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  return value.split("T")[0];
};
