import { Link } from "react-router";
import { type IRoomDTO } from "../../models/RoomDTO";
import IconPeople from "../Icons/IconPeople";
import RoomStatus from "./RoomStatus";
import RoomFloor from "./RoomFloor";
const DEFAULT_IMAGE =
  "https://res.cloudinary.com/dyzqa6uuu/image/upload/v1742384690/hof/yeq1yyvb1tdfyuwuxfga.avif";
interface IRoomPreviewProps {
  room: IRoomDTO;
  deleteItem?: (itemId: string) => void;
  isAdmin?: boolean;
}
export default function RoomPreview({
  room,
  deleteItem,
  isAdmin,
}: IRoomPreviewProps) {
  const { id, name, status, capacity, floor, imageUrl } = room;

  return (
    <li className="rounded-2xl shadow-[0_0_0_1px_var(--color-main-white)]">
      <img
        className="rounded-t-2xl"
        src={imageUrl || DEFAULT_IMAGE}
        alt={name || "Room Image"}
        onError={(e) => {
          (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
        }}
      />
      <div className="p-4 text-main-white flex  flex-col gap-1">
        <div className="flex justify-between">
          <h3 className="text-xl font-semibold">{name}</h3>
          <RoomStatus status={status ?? "Active"} />
        </div>
        <RoomFloor floor={floor ?? 0} />
        <div className="text-main-white/75 flex items-center gap-1">
          <IconPeople className="aspect-square w-4 h-full stroke-main-white/75 fill-main-bg" />
          <p>{capacity}</p>
          <p>אנשים </p>
        </div>
        <div className="flex justify-center gap-2 text-main-bg font-semibold pt-4">
          <Link className="px-2 py-1 bg-main-white rounded" to={`/rooms/${id}`}>
            פרטים
          </Link>
          {isAdmin ? (
            <Link
              className="px-2 py-1 bg-main-white rounded"
              to={`rooms/edit/${id}`}
            >
              ערוך חדר
            </Link>
          ) : null}
          {isAdmin && deleteItem && (
            <button
              className="px-2 py-1 bg-main-white rounded"
              onClick={() => deleteItem(id!)}
            >
              מחק
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
