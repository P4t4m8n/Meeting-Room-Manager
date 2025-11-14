import React, { useState } from "react";
import { ROOM_STATUS, type IRoomFilter } from "../../models/RoomDTO";
import DateInput, { type IDateRange } from "../Calendar/DateInput/DateInput";
import handleInputChange from "../../utils/form.util";
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
interface IRoomsFilterProps {
  searchRooms: (filter: IRoomFilter) => void;
}

export default function RoomsFilter({ searchRooms }: IRoomsFilterProps) {
  const [filter, setFilter] = useState<IRoomFilter>(INITIAL_FILTER);

  const handleDateSelect = (range: IDateRange) => {
    console.log("🚀 ~ handleDateSelect ~ range:", range)
    setFilter((prev) => ({
      ...prev,
      startTime: range?.startTime,
      endTime: range?.endTime,
    }));
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchRooms(filter);
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

  const { startTime, endTime } = filter;

  return (
    <form className="p-4" onSubmit={onSearch}>
      <DateInput
        handleDateSelect={handleDateSelect}
        selectedRange={{
          startTime,
          endTime,
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

      <button type="submit">Apply Filters</button>
    </form>
  );
}
