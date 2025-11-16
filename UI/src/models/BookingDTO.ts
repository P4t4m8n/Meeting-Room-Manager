import type { IFilterDTO } from "./base.model";
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
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  Active: "פעיל",
  Pending: "ממתין",
  Completed: "הושלם",
  Cancelled: "בוטל",
};
export interface IBookingDTO extends IDTO {
  startTime?: string;
  startDate?: string;
  endTime?: string;
  endDate?: string;
  bufferMinutes?: number;
  status?: BookingStatus;
  title?: string;
  description?: string;
  room?: IRoomDTO | null;
  owner?: IUserDTO | null;
  attendees?: IBookingAttendeeDTO[] | null;
}

export interface IBookingFilter extends IFilterDTO {
  roomName?: string;
}
