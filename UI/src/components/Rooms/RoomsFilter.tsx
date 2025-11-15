import React, { Fragment, useState } from "react";
import {
  ROOM_STATUS,
  ROOM_STATUS_LABELS,
  type IRoomFilter,
} from "../../models/RoomDTO";
import handleInputChange from "../../utils/form.util";
import DateTimePickerPopover from "../Calendar/DateTimePickerPopover";
import toTitle from "@/utils/toTitle";
import CheckBox from "../Form/CheckBox";
import NumberInput from "../Form/NumberInput";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "../ui/drawer";
import IconFilter from "../Icons/IconFilter";
const INITIAL_FILTER: IRoomFilter = {
  startTime: null,
  startDate: null,
  endTime: null,
  endDate: null,
  capacity: null,
  floor: null,
  hasProjector: null,
  hasTeamMeeting: null,
  hasConferenceCall: null,
  status: "Active",
  roomName: null,
};
interface IRoomsFilterProps {
  searchRooms: (filter: IRoomFilter) => void;
}

export default function RoomsFilter({ searchRooms }: IRoomsFilterProps) {
  const [filter, setFilter] = useState<IRoomFilter>(INITIAL_FILTER);
  console.log("🚀 ~ RoomsFilter ~ filter:", filter);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchRooms(filter);
  };
  const checkboxInputs = [
    { label: "חיבור לטימס", key: "hasTeamMeeting" },
    { label: " שיחת ועידה", key: "hasConferenceCall" },
    { label: "מקרן", key: "hasProjector" },
  ];

  const numberInputs = [
    { label: "קיבולת", key: "capacity" },
    { label: "קומה", key: "floor" },
  ];

  const handleDateChange = (
    value: string,
    id: string,
    type: "date" | "time"
  ) => {
    console.log("🚀 ~ handleDateChange ~ value:", value);
    const filterKey = (id + toTitle(type)) as keyof IRoomFilter;

    setFilter((prev) => ({ ...prev, [filterKey]: value || null }));
  };

  const { startTime, startDate, endTime, endDate, roomName } = filter;

  return (
    <form
      className="px-4 grid grid-cols-[1fr_auto] gap-x-2 gap-y-4"
      onSubmit={onSearch}
    >
      <div className=" bg-main-white grid grid-cols-[auto_1fr] gap-1 w-full rounded items-center p-2 h-14">
        <label htmlFor="roomName">שם חדר</label>
        <input
          className="outline-0 border-2 border-main-bg rounded p-1 focus:shadow-[4px_4px_0px__0px_rgba(0,0,0,0.75)] transition-all duration-300"
          type="text"
          id="roomName"
          value={roomName ?? ""}
          onChange={(e) =>
            setFilter((prev) => ({ ...prev, roomName: e.target.value }))
          }
        />
      </div>
      <Drawer direction="top">
        <DrawerTrigger className="bg-main-white w-14 h-14 rounded p-3 text-center">
          <IconFilter className="stroke-black fill-none w-full h-full" />
        </DrawerTrigger>
        <DrawerContent className="px-4 py-8 grid grid-cols-2 gap-x-2 gap-y-4 bg-main-bg rounded-none">
          <h4 className="col-span-2 text-center text-main-white text-2xl">
            חיפוש מתקדם
          </h4>
          <div className="w-full">
            <DateTimePickerPopover
              id="start"
              timeSlotsConfig={{
                startHour: 8,
                endHour: 18,
                intervalMinutes: 10,
              }}
              handleDateChange={handleDateChange}
              selectedTime={startTime}
              date={startDate ? new Date(startDate) : undefined}
            />
          </div>
          <div className="w-full">
            <DateTimePickerPopover
              id="end"
              timeSlotsConfig={{
                startHour: 8,
                endHour: 18,
                intervalMinutes: 10,
              }}
              handleDateChange={handleDateChange}
              selectedTime={endTime}
              date={endDate ? new Date(endDate) : undefined}
            />
          </div>
          <div className="col-span-2 flex flex-wrap gap-4 justify-center">
            {checkboxInputs.map((input) => (
              <Fragment key={input.key}>
                <CheckBox
                  inputProps={{
                    id: input.key,
                    name: input.key,
                    checked: filter[input.key as keyof IRoomFilter] as boolean,
                    onChange: (e) => handleInputChange(e, setFilter),
                  }}
                  labelProps={{ children: input.label, htmlFor: input.key }}
                />
              </Fragment>
            ))}
          </div>
          <ul className="flex gap-4 justify-center w-full col-span-2">
            {numberInputs.map((input) => (
              <li key={input.key}>
                <NumberInput
                  inputProps={{
                    value: filter[input.key as keyof IRoomFilter] as number,
                    onChange: (e) => handleInputChange(e, setFilter),
                    name: input.key,
                    id: input.key,
                  }}
                  labelProps={{
                    children: input.label,
                    htmlFor: input.key,
                  }}
                />
              </li>
            ))}
          </ul>

          <ul className="flex gap-2 col-span-2 justify-self-center">
            {ROOM_STATUS.map((status) => (
              <li
                key={status}
                className="flex text-main-white items-center gap-2"
              >
                <input
                  type="radio"
                  id={status}
                  name="status"
                  value={status}
                  checked={filter.status === status}
                  onChange={(e) => handleInputChange(e, setFilter)}
                  className=" appearance-none rounded-1/2 w-4 h-4 border-2 border-main-white transition-all duration-200 checked:border-6 "
                />
                <label htmlFor={status} className="">
                  {ROOM_STATUS_LABELS[status]}
                </label>
              </li>
            ))}
          </ul>
          <DrawerClose
            asChild
            className="bg-main-white rounded col-span-2 w-fit justify-self-center px-6"
          >
            <button>סגור</button>
          </DrawerClose>
        </DrawerContent>
      </Drawer>

      <button
        type="submit"
        className="bg-main-white rounded col-span-2 w-fit justify-self-center px-6"
      >
        חפש
      </button>
    </form>
  );
}
