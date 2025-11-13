import { useEffect, useState } from "react";
import DateInput, {
  type IDateRange,
} from "../components/Calendar/DateInput/DateInput";
import type { IRoomDTO } from "../models/RoomDTO";
import { roomsService } from "../services/room.service";

export default function HomePage() {
  const [rooms, setRooms] = useState<IRoomDTO[]>([]);
  console.log("🚀 ~ HomePage ~ rooms:", rooms)

  useEffect(() => {
    const getRooms = async () => {
      const { data } = await roomsService.get();
      setRooms(data);
    };
    getRooms();
  }, []);
  const handleDateSelect = (range: IDateRange) => {
    console.log("🚀 ~ handleDateSelect ~ range:", range);
  };
  return (
    <main>
      <div>
        <DateInput handleDateSelect={handleDateSelect} />
      </div>
    </main>
  );
}
