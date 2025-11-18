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
  endTime?: string;
  bufferMinutes?: number;
  status?: BookingStatus;
  title?: string;
  description?: string;
  room?: IRoomDTO | null;
  owner?: IUserDTO | null;
  attendees?: IBookingAttendeeDTO[] | null;
}

export interface IBookingEditDTO extends IBookingDTO {
  startTimeEdit?: string;
  startDateEdit?: string;
  endTimeEdit?: string;
  endDateEdit?: string;
  roomId?: string | null;
  ownerId?: string;
}

export interface IBookingFilter extends IFilterDTO {
  roomName?: string;
}
