import type { IUserDTO } from "../models/UserDTO";

export interface IAuthProvider {
  user: IUserDTO | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}
