import { useEffect, useState } from "react";
import DateInput, {
  type IDateRange,
} from "../components/Calendar/DateInput/DateInput";
import {
  type IRoomFilter,
  type IRoomDTO,
  ROOM_STATUS,
} from "../models/RoomDTO";
import { roomsService } from "../services/room.service";
import handleInputChange from "../utils/form.util";

const INITIAL_FILTER: IRoomFilter = {
  startTime: null,
  endTime: null,
  capacity: null,
  floor: null,
  hasProjector: null,
  hasTeamMeeting: null,
  hasConferenceCall: null,
  status: null,
};

export default function HomePage() {
  const [rooms, setRooms] = useState<IRoomDTO[]>([]);
  const [filter, setFilter] = useState<IRoomFilter>(INITIAL_FILTER);
  console.log("🚀 ~ HomePage ~ rooms:", rooms);

  useEffect(() => {
    const getRooms = async () => {
      const { data } = await roomsService.get();
      setRooms(data);
    };
    getRooms();
  }, []);
  const handleDateSelect = (range: IDateRange) => {
    setFilter((prev) => ({
      ...prev,
      startTime: range?.startTime,
      endTime: range?.endTime,
    }));
  };

  const checkboxInputs = [
    { label: "Has Projector", key: "hasProjector" },
    { label: "Has Team Meeting", key: "hasTeamMeeting" },
    { label: "Has Conference Call", key: "hasConferenceCall" },
  ];

  const numberInputs = [
    { label: "Capacity", key: "capacity" },
    { label: "Floor", key: "floor" },
  ];

  const selectInputs = [
    { label: "Status", key: "status", options: ROOM_STATUS },
  ];

  const { startTime, endTime } = INITIAL_FILTER;
  return (
    <main>
      <form className="p-4">
        <DateInput
          handleDateSelect={handleDateSelect}
          selectedRange={{
            startTime: new Date(startTime ?? ""),
            endTime: new Date(endTime ?? ""),
          }}
        />
        {checkboxInputs.map((input) => (
          <div key={input.key}>
            <label>
              <input
                type="checkbox"
                checked={filter[input.key as keyof IRoomFilter] as boolean}
                onChange={(e) => handleInputChange(e, setFilter)}
              />
              {input.label}
            </label>
          </div>
        ))}
        {numberInputs.map((input) => (
          <div key={input.key}>
            <label>
              {input.label}
              <input
                type="number"
                value={filter[input.key as keyof IRoomFilter] as number}
                onChange={(e) => handleInputChange(e, setFilter)}
              />
            </label>
          </div>
        ))}
        {selectInputs.map((input) => (
          <div key={input.key}>
            <label>
              {input.label}
              <select
                value={filter[input.key as keyof IRoomFilter] as string}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    [input.key]: e.target.value || null,
                  }))
                }
              >
                <option value="">Select {input.label}</option>
                {input.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ))}
      </form>
      <div>
        <ul>
          {rooms?.map((room) => (
            <li key={room.id}>{room.name}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}
