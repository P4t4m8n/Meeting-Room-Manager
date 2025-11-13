import type { IBookingAttendeeDTO } from "./BookingAttendeeDTO";
import type { IDTO } from "./DTO.model";
import type { IRoomDTO } from "./RoomDTO";
import type { IUserDTO } from "./UserDTO";

export const BOOKING_STATUS = [
  "Active",
  "Pending",
  "Completed",
  "Cancelled",
] as const;
export type BookingStatus = (typeof BOOKING_STATUS)[number];
export interface IBookingDTO extends IDTO {
  startTime?: string;
  endTime?: string;
  bufferMinutes?: number;
  status?: BookingStatus;
  summary?: string;
  description?: string;
  room?: IRoomDTO | null;
  owner?: IUserDTO | null;
  attendees?: IBookingAttendeeDTO[] | null;
}
