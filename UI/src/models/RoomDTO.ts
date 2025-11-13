import type { IBookingDTO } from "./BookingDTO";
import type { IDTO } from "./DTO.model";

export const ROOM_STATUS = ["Active", "Inactive", "Maintenance"] as const;
export type RoomStatus = (typeof ROOM_STATUS)[number];

export interface IRoomDTO extends IDTO {
  name?: string;
  capacity?: number;
  floor?: number;
  hasProjector?: boolean;
  hasTeamMeeting?: boolean;
  hasConferenceCall?: boolean;
  imageUrl?: string;
  status?: RoomStatus;
  bookings?: IBookingDTO[] | null;
}

export interface IRoomFilter {
  startTime?: string | null|Date;
  endTime?: string | null|Date;
  capacity?: number | null;
  floor?: number | null;
  hasProjector?: boolean | null;
  hasTeamMeeting?: boolean | null;
  hasConferenceCall?: boolean | null;
  status?: RoomStatus | null;
}
