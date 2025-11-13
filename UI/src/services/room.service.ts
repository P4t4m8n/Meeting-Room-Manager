import type { IRoomDTO, IRoomFilter } from "../models/RoomDTO";
import { genericServiceFactory } from "../utils/genericServiceFactory";

const ROOT_PATH = "rooms";

export const roomsService = genericServiceFactory<
  IRoomDTO,
  IRoomDTO,
  IRoomFilter
>({
  rootPath: ROOT_PATH,
});
