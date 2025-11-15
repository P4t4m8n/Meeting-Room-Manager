import IconConference from "@/components/Icons/IconConfrenace";
import IconPeople from "@/components/Icons/IconPeople";
import IconVideoConf from "@/components/Icons/IconVideoConf";
import RoomAmenity from "@/components/Rooms/RoomAmenity";
import RoomFloor from "@/components/Rooms/RoomFloor";
import RoomStatus from "@/components/Rooms/RoomStatus";
import { useAuth } from "@/hooks/useAuth";
import { usePageBack } from "@/hooks/usePageBack";
import type { IRoomDTO } from "@/models/RoomDTO";
import { roomsService } from "@/services/room.service";
import { ArrowRight, ProjectorIcon } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { Link, useParams } from "react-router";

export default function RoomDetails() {
  const [room, setRoom] = useState<IRoomDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const { roomId } = useParams<{ roomId: string }>();
  const { onBack } = usePageBack();
  const { user } = useAuth();

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

  const onDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      e.preventDefault();
      if (!room) return;
      setIsDeleting(true);
      await roomsService.remove(id!);
      onBack();
    } catch (error) {
      console.error("Failed to delete room:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!room) {
    return <div>Room not found</div>;
  }

  const {
    id,
    imageUrl,
    name,
    capacity,
    floor,
    hasProjector,
    hasTeamMeeting,
    hasConferenceCall,
    status,
    notes,
    bookings,
  } = room;

  const amities = [
    { name: "מקרן", available: hasProjector, Icon: ProjectorIcon },
    { name: "חיבור לטימס", available: hasTeamMeeting, Icon: IconVideoConf },
    { name: "שיחות ועידה", available: hasConferenceCall, Icon: IconConference },
  ];

  const isAdmin = user?.role === "Admin";
  return (
    <main className="flex flex-col h-mobile-main overflow-auto gap-4 p-4">
      <button
        onClick={onBack}
        className="text-main-white flex gap-1 items-center mb-4 w-fit hover:cursor-pointer"
      >
        <ArrowRight className=" w-4 h-4  stroke-main-white/75 fill-main-bg" />
        <p>חזור</p>
      </button>

      <img className="rounded-xl shadow-2xs" src={imageUrl} alt={name} />

      <div className="grid grid-cols-[1fr_auto] items-center gap-y-2">
        <h2 className="text-main-white text-4xl font-semibold">{name}</h2>
        <RoomStatus status={status ?? "Active"} />
        <RoomFloor floor={floor ?? 0} />
      </div>

      <div className=" shadow-[0_0_0_1px_var(--color-main-white-border)] p-4 rounded grid grid-cols-[3rem_1fr] grid-rows-[auto_auto] gap-x-4">
        <IconPeople className="aspect-square w-full h-full bg-main-white stroke-main-bg fill-none row-span-2 rounded-lg p-1" />
        <span className="text-sm  text-main-white-border">קיבולת</span>
        <p className="text-xl font-semibold text-main-white">
          {capacity} אנשים
        </p>
      </div>

      <ul className=" shadow-[0_0_0_1px_var(--color-main-white-border)] rounded p-4  grid gap-2 ">
        {amities.map((amenity) => (
          <Fragment key={amenity.name}>
            <RoomAmenity {...amenity} />
          </Fragment>
        ))}
      </ul>

      <article className="shadow-[0_0_0_1px_var(--color-main-white-border)] p-4 inline-flex flex-col gap-8 rounded">
        <h3 className="text-main-white text-lg font-semibold ">הערות</h3>
        <p className="text-gray-300">{notes || "אין הערות נוספות"}</p>
      </article>

      <div className="shadow-[0_0_0_1px_var(--color-main-white-border)] p-4 min-h-96 rounded ">
        <div className="inline-flex items-center  text-lg gap-2 font-semibold">
          <h4 className="text-main-white">הזמנות</h4>
          <p className="text-main-white-border">({bookings?.length ?? 0})</p>
        </div>

        <ul>
          {bookings && bookings.length > 0 ? (
            bookings.map((booking) => <li key={booking.id}>{booking.id}</li>)
          ) : (
            <p className="text-main-white-border">אין הזמנות לחדר זה</p>
          )}
        </ul>
      </div>

      <div className="flex justify-center gap-2 text-main-bg font-semibold pt-4">
        <Link
          className="p-2 bg-main-white rounded w-full text-center "
          to={`/booking/new/${id}`}
        >
          הזמן חדר{" "}
        </Link>
        {isAdmin ? (
          <Link
            className="p-2 bg-main-white rounded w-full text-center"
            to={`rooms/edit/${id}`}
          >
            ערוך חדר
          </Link>
        ) : null}
        {isAdmin && (
          <button
            className="p-2 bg-main-white rounded w-full text-center"
            onClick={onDelete}
            disabled={isDeleting}
          >
            מחק
          </button>
        )}
      </div>
    </main>
  );
}
