import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import type { IRoomDTO, IRoomFilter } from "../../../models/RoomDTO";
import { roomsService } from "../../../services/room.service";
import RoomsFilter from "../../../components/Rooms/RoomsFilter";
import RoomsList from "@/components/Rooms/RoomsList";

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<IRoomDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const searchRooms = useCallback(async (filter: IRoomFilter = {}) => {
    setIsLoading(true);
    try {
      const { data } = await roomsService.get(filter);
      setRooms(data);
    } catch (error) {
      console.error("Failed to fetch rooms with filter:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    searchRooms({});
  }, [searchRooms]);

  const deleteRoom = async (itemId: string) => {
    console.log("🚀 ~ deleteRoom ~ itemId:", itemId);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <main className="grid grid-rows-[auto_auto_1fr] gap-4  h-mobile-admin">
      <div className="px-4">
        <Link className="bg-gray-600 p-2" to="edit">
          הוספת חדר
        </Link>
      </div>

      <RoomsFilter searchRooms={searchRooms} />

      <RoomsList rooms={rooms} deleteRoom={deleteRoom} />
    </main>
  );
}
