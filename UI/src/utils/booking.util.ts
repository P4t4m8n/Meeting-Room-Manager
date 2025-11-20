import type { IBookingEditDTO } from "@/models/BookingDTO";

const getEmpty = (): IBookingEditDTO => ({
  startTime: "",
  endTime: "",
  bufferMinutes: 0,
  status: "Pending",
  description: "",
  room: null,
  owner: null,
  attendees: [],
  startTimeEdit: "",
  startDateEdit: "",
  endTimeEdit: "",
  endDateEdit: "",
  roomId: "",
  ownerId: "",
});

const bookingUtil = {
  getEmpty,
};

export default bookingUtil;
