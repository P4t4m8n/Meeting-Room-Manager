import IconLocation from "../Icons/IconLocation";

export default function RoomFloor({ floor }: { floor: number }) {
  return (
    <div className="text-main-white/75 flex items-center gap-1">
      <IconLocation className="aspect-square w-4 h-full stroke-main-white/75 fill-main-bg" />
      <p>קומה</p>
      <p>{floor}</p>
    </div>
  );
}
