import { Link } from "react-router";
import type { IRoomDTO } from "../../models/RoomDTO";
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
    <li>
      <img
        src={imageUrl || DEFAULT_IMAGE}
        alt={name || "Room Image"}
        onError={(e) => {
          (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
        }}
      />
      <h3>{name}</h3>
      <p>Status: {status}</p>
      <p>Capacity: {capacity}</p>
      <p>Floor: {floor}</p>
      <Link to={`rooms/${id}`}>View Details</Link>
      {isAdmin ? <Link to={`rooms/edit/${id}`}>Edit Room</Link> : null}
      {isAdmin && deleteItem && (
        <button onClick={() => deleteItem(id!)}>Delete</button>
      )}
    </li>
  );
}
