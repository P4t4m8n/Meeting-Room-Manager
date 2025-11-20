import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import type { IRoomDTO, IRoomFilter } from "../../models/RoomDTO";
import { roomsService } from "../../services/room.service";
import RoomsFilter from "../../components/Rooms/RoomsFilter";
import RoomsList from "@/components/Rooms/RoomsList";
import { IsDeletingContext } from "@/context/isDeletingContext";
import { useAuth } from "@/hooks/useAuth";


export default function RoomListPage() {
  const [rooms, setRooms] = useState<IRoomDTO[]>([]);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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
    try {
      setIsDeleting(true);
      await roomsService.remove(itemId);
      //Lazy Refresh the room list after deletion refactor later when decide how to handle global state or caching
      searchRooms({});
    } catch (error) {
      console.error("Failed to delete room:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const isAdmin = user?.role === "Admin";
  return (
    <main className="grid grid-rows-[auto_auto_1fr] gap-4 pt-4  h-mobile-main">
      {isAdmin && (
        <Link
          className="bg-main-white p-2 h-10 w-fit mr-4 rounded-lg"
          to="edit"
        >
          הוספת חדר
        </Link>
      )}
      <RoomsFilter searchRooms={searchRooms} />

      <IsDeletingContext.Provider value={isDeleting}>
        <RoomsList rooms={rooms} deleteRoom={deleteRoom} />
      </IsDeletingContext.Provider>
    </main>
  );
}
