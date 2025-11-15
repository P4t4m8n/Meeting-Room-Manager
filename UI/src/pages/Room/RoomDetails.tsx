import type { IRoomDTO } from "@/models/RoomDTO";
import { roomsService } from "@/services/room.service";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

export default function RoomDetails() {
  const [room, setRoom] = useState<IRoomDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { roomId } = useParams<{ roomId: string }>();

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        const { data } = await roomsService.getById(roomId!);
        setRoom(data);
      } catch (error) {
        console.error("Failed to fetch room details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (roomId) init();
  }, [roomId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!room) {
    return <div>Room not found</div>;
  }
  return <div>AdminRoomDetailsPage</div>;
}
