import type { IDTO } from "./DTO.model";

export interface IUserDTO extends IDTO {
  name?: string;
  email?: string;
  role: TUserRole;
  imgUrl?: string;
}

export const USER_ROLES = ["Admin", "User", "Maintenance"] as const;
export type TUserRole = (typeof USER_ROLES)[number];
