import type { IDTO } from "./DTO.model";

export interface IBookingAttendeeDTO extends IDTO {
  email?: string | null;
  name?: string | null;
}
