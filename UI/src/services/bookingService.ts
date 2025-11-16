import type { IBookingDTO, IBookingFilter } from "../models/BookingDTO";
import { genericServiceFactory } from "../utils/genericServiceFactory";

const ROOT_PATH = "/bookings";

export const bookingsService = genericServiceFactory<
  IBookingDTO,
  IBookingDTO,
  IBookingFilter
>({
  rootPath: ROOT_PATH,
});
