import { useNavigate, useParams } from "react-router";
import { usePageBack } from "../../../hooks/usePageBack";
import { useEffect, useState } from "react";
import { roomsService } from "../../../services/room.service";
import roomUtil from "../../../utils/room.util";
import {
  ROOM_STATUS,
  ROOM_STATUS_LABELS,
  type IRoomEditDTO,
} from "../../../models/RoomDTO";
import handleInputChange from "../../../utils/form.util";
import IconCheck from "../../../components/Icons/IconCheck";
import InputImage from "../../../components/Form/InputImage";

export default function AdminRoomEditPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { navBack } = usePageBack();
  const navigate = useNavigate();

  const [roomToEdit, setRoomToEdit] = useState<IRoomEditDTO | null>(null);
  console.log("🚀 ~ AdminRoomEditPage ~ roomToEdit:", roomToEdit);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const initRoomToEdit = async () => {
      try {
        setIsFetching(true);
        const _roomToEdit = roomId
          ? (await roomsService.getById(roomId)).data
          : roomUtil.getEmpty();

        setRoomToEdit(_roomToEdit);
      } catch (error) {
        console.log("🚀 ~ initRoomToEdit ~ error:", error);
      } finally {
        setIsFetching(false);
      }
    };
    initRoomToEdit();
  }, [roomId]);

  if (isFetching) {
    return <div>Loading...</div>;
  }

  if (!roomToEdit) {
    return <div>Room not found</div>;
  }

  const onSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setIsSaving(true);
      const formData = new FormData();
      const {
        name,
        status,
        capacity,
        floor,
        hasProjector,
        hasTeamMeeting,
        hasConferenceCall,
        notes,
      } = roomToEdit;

      if (name) {
        formData.append("name", name);
      }
      if (capacity) {
        formData.append("capacity", capacity.toString());
      }
      if (floor) {
        formData.append("floor", floor.toString());
      }
      if (hasProjector) {
        formData.append("hasProjector", hasProjector.toString());
      }
      if (hasTeamMeeting) {
        formData.append("hasTeamMeeting", hasTeamMeeting.toString());
      }
      if (hasConferenceCall) {
        formData.append("hasConferenceCall", hasConferenceCall.toString());
      }
      if (status) {
        formData.append("status", status);
      }
      if (notes) {
        formData.append("notes", notes);
      }

      const form = e.target as HTMLFormElement;
      const fileInput = form.querySelector(
        'input[name="rawImgFile"]'
      ) as HTMLInputElement;
      if (fileInput?.files?.[0]) {
        formData.append("image", fileInput.files[0]);
      }

      const savedRoomId = (await roomsService.save(formData)).data.id;
      console.log("🚀 ~ onSubmit ~ savedRoomId:", savedRoomId);

      if (!savedRoomId) throw new Error("Failed to save room");
      navigate(`/admin/rooms/${savedRoomId}`);
    } catch (error) {
      console.log("🚀 ~ onSubmit ~ error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const headerText = roomId ? "ערוך חדר" : "הוסף חדר";

  const {
    name,
    status,
    capacity,
    floor,
    hasProjector,
    hasTeamMeeting,
    hasConferenceCall,
    imageUrl,
    notes,
  } = roomToEdit;

  const numberInputs = [
    { label: "קיבולת", key: "capacity", value: capacity || 0 },
    { label: "קומה", key: "floor", value: floor || 0 },
  ];

  const checkboxInputs = [
    {
      label: "מקרן",
      key: "hasProjector",
      value: hasProjector || false,
    },
    {
      label: "חיבור לטימס",
      key: "hasTeamMeeting",
      value: hasTeamMeeting || false,
    },
    {
      label: "חיבור לשיחת ועידה",
      key: "hasConferenceCall",
      value: hasConferenceCall || false,
    },
  ];
  return (
    <div className="px-4 pt-4 flex flex-col gap-4 bg-main-blue h-full">
      <div>
        <button
          className=" float-end bg-main-blue-dark p-1 text-main-white rounded font-semibold"
          onClick={navBack}
        >
          {" "}
          חזור
        </button>
        <h1 className="text-center text-xl font-bold">{headerText}</h1>
      </div>
      <form
        onSubmit={onSubmit}
        className="grid gap-4 transition-all duration-300"
      >
        <div>
          <label htmlFor="name" className="font-semibold">
            שם החדר
          </label>
          <input
            onChange={(e) => handleInputChange(e, setRoomToEdit)}
            type="text"
            name="name"
            value={name}
            className="w-full px-4 h-10 bg-main-white border-2 border-main-bg outline-0  focus:shadow-[4px_4px_0px__0px_rgba(0,0,0,0.25)] transition-all duration-300"
          />
        </div>
        <InputImage imageUrl={imageUrl} itemId={roomToEdit.id} />
        <ul className="flex justify-center gap-8">
          {numberInputs.map((input) => (
            <li key={input.key} className="grid justify-items-center gap-1">
              <label className="font-semibold" htmlFor={input.key}>
                {input.label}
              </label>
              <input
                onChange={(e) => handleInputChange(e, setRoomToEdit)}
                type="number"
                name={input.key}
                value={input.value}
                className=" p-1 w-9 text-center bg-main-white border-2 border-main-bg outline-0  focus:shadow-[4px_4px_0px__0px_rgba(0,0,0,0.25)] transition-all duration-300"
              />
            </li>
          ))}
        </ul>
        <ul className="flex flex-wrap justify-center gap-8">
          {checkboxInputs.map((input) => (
            <li key={input.key} className="relative group">
              <input
                onChange={(e) => handleInputChange(e, setRoomToEdit)}
                type="checkbox"
                name={input.key}
                id={input.key}
                checked={input.value}
                hidden
                className="peer"
              />
              <label
                htmlFor={input.key}
                className="peer-checked:border-main-bg peer-checked:[&>svg]:w-5 peer-checked:[&>svg]:h-5 peer-checked:gap-2 peer-checked:[&>svg]:p-1 border border-gray-400 transition-all px-2 py-1 rounded flex items-center duration-500 w-fit cursor-pointer"
              >
                {input.label}
                <IconCheck className="w-0 h-0  stroke-black-900 bg-green-500 rounded-full transition-all " />
              </label>
            </li>
          ))}
        </ul>
        <textarea
          onChange={(e) => handleInputChange(e, setRoomToEdit)}
          name="notes"
          placeholder="הערות"
          value={notes}
          className="w-full h-full block peer outline-offset-0 p-2 resize-none border rounded  "
        ></textarea>
        <div className="flex gap-1 items-center">
          <p>סטטוס החדר</p>
          <select
            name="status"
            value={status}
            className="bg-main-blue-dark p-1 text-main-white"
            onChange={(e) => handleInputChange(e, setRoomToEdit)}
          >
            {ROOM_STATUS.map((option) => (
              <option key={option} value={option}>
                {ROOM_STATUS_LABELS[option]}
              </option>
            ))}
          </select>
        </div>
        <button
          className=" float-end bg-main-blue-dark p-1 text-main-white rounded font-semibold"
          type="submit"
          disabled={isSaving}
        >
          שמור
        </button>
      </form>
    </div>
  );
}
