import type { IFilterDTO } from "./base.model";
import type { IBookingDTO } from "./BookingDTO";
import type { IDTO } from "./DTO.model";

export const ROOM_STATUS = ["Active", "Inactive", "Maintenance"] as const;
export type RoomStatus = (typeof ROOM_STATUS)[number];
export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  Active: "פעיל",
  Inactive: "לא פעיל",
  Maintenance: "תחזוקה",
};

export interface IRoomDTO extends IDTO {
  name?: string;

  status?: RoomStatus;
  capacity?: number;
  floor?: number;
  hasProjector?: boolean;
  hasTeamMeeting?: boolean;
  hasConferenceCall?: boolean;
  bookings?: IBookingDTO[] | null;
  imageUrl?: string;
  notes?: string;
}
export interface IRoomEditDTO extends Omit<IRoomDTO, "bookings"> {
  rawImgFile?: File | null;
}

export interface IRoomFilter extends IFilterDTO {
  startTime?: string | null | Date;
  endTime?: string | null | Date;
  capacity?: number | null;
  floor?: number | null;
  hasProjector?: boolean | null;
  hasTeamMeeting?: boolean | null;
  hasConferenceCall?: boolean | null;
  status?: RoomStatus | null;
}
