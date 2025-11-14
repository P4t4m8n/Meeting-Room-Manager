import { useEffect, useState } from "react";

import { type IRoomFilter, type IRoomDTO } from "../models/RoomDTO";
import { roomsService } from "../services/room.service";
import RoomsFilter from "../components/Rooms/RoomsFilter";

export default function HomePage() {
  const [rooms, setRooms] = useState<IRoomDTO[]>([]);

  useEffect(() => {
    const getRooms = async () => {
      const { data } = await roomsService.get();
      setRooms(data);
    };
    getRooms();
  }, []);

  const searchRooms = async (filter: IRoomFilter) => {
    console.log("🚀 ~ searchRooms ~ filter:", filter);
  };

  return (
    <main>
      <RoomsFilter searchRooms={searchRooms} />
      <div>
        <ul>
          {rooms?.map((room) => (
            <li key={room.id}>{room.name}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}
