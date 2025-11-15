interface IRoomAmenityProps {
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  available?: boolean;
  name: string;
}
export default function RoomAmenity({
  Icon,
  available,
  name,
}: IRoomAmenityProps) {
  return (
    <li className={` flex items-center gap-1 w-full`}>
      <Icon
        className={`aspect-square w-8 h-full rounded p-1  ${
          available
            ? "stroke-green-900 fill-none bg-green-400"
            : "stroke-main-white-border fill-none bg-none"
        }`}
      />
      <p
        className={` h-full rounded p-1  ${
          available ? "text-green-400" : " text-main-white-border"
        }`}
      >
        {name}
      </p>
    </li>
  );
}
