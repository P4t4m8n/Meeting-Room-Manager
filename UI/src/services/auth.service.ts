import type { THttpResponse } from "../models/Http.model";
import type { IUserDTO } from "../models/UserDTO";
import { apiService } from "./api.service";

const ROOT_PATH = "/auth" as const;

const signOut = (): Promise<THttpResponse<void>> => {
  return apiService.post<void>(`${ROOT_PATH}/sign-out`);
};

const getSessionUser = (): Promise<THttpResponse<IUserDTO | null>> => {
  return apiService.get<IUserDTO | null>(`${ROOT_PATH}/check-session`);
};

export const authService = {
  signOut,
  getSessionUser,
};
