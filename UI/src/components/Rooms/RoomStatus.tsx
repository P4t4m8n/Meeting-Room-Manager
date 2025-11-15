import { cn } from "@/lib/utils";
import { ROOM_STATUS_LABELS, type TRoomStatus } from "@/models/RoomDTO";

interface RoomStatusProps {
  status: TRoomStatus;
}
export default function RoomStatus({ status }: RoomStatusProps) {
  const statusColorClass = {
    Active: "bg-green-500",
    Inactive: "bg-red-500",
    Maintenance: "bg-yellow-500",
  };

  const statusStyle = cn(
    " font-sm w-fit rounded-xl py-1 px-2",
    statusColorClass[status ?? "Active"]
  );
  return (
    <p className={statusStyle}> {ROOM_STATUS_LABELS[status ?? "Active"]}</p>
  );
}
