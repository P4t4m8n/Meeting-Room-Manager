import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { IRoomDTO } from "../../../models/RoomDTO";
import { roomsService } from "../../../services/room.service";
import RoomPreview from "../../../components/Rooms/RoomPreview";
import RoomsFilter from "../../../components/Rooms/RoomsFilter";

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<IRoomDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initRooms = async () => {
      try {
        const { data } = await roomsService.get({});
        setRooms(data);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initRooms();
  }, []);

  const deleteRoom = async (itemId: string) => {
    console.log("🚀 ~ deleteRoom ~ itemId:", itemId);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <main className="grid">
      <div>
        <Link className="bg-gray-600 p-2" to="edit">
          {" "}
          הוספת חדר
        </Link>
      </div>
      <RoomsFilter searchRooms={() => {}} />
      <div>
        <ul>
          {rooms?.map((room) => (
            <RoomPreview
              key={room.id}
              room={room}
              isAdmin={true}
              deleteItem={deleteRoom}
            />
          ))}
        </ul>
      </div>
    </main>
  );
}
