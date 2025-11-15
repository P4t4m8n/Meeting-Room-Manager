import type { IRoomDTO } from "@/models/RoomDTO";
import RoomPreview from "./RoomPreview";

interface IRoomListProps {
  rooms?: IRoomDTO[];
  deleteRoom?: (itemId: string) => void;
}

export default function RoomsList({ rooms, deleteRoom }: IRoomListProps) {
  return (
    <ul className=" overflow-auto flex flex-col gap-4 p-4">
      {rooms?.map((room) => (
        <RoomPreview
          key={room.id}
          room={room}
          isAdmin={true}
          deleteItem={deleteRoom}
        />
      ))}
    </ul>
  );
}
