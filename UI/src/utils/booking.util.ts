import type { IBookingDTO } from "@/models/BookingDTO";

const getEmpty = (): IBookingDTO => ({
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  bufferMinutes: 0,
  status: "Pending",
  summary: "",
  description: "",
  room: null,
  owner: null,
  attendees: [],
});

const bookingUtil = {
  getEmpty,
};

export default bookingUtil;
