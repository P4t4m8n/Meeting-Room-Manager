import type { IBookingAttendeeDTO } from "@/models/BookingAttendeeDTO";

import { EditIcon, PlusIcon } from "lucide-react";
import InputText from "../Form/InputText";
import { useState } from "react";
import handleInputChange from "@/utils/form.util";
import { useModel } from "@/hooks/useModel";
import ModelOverlay from "../ui/ModelOverlay";

interface IAttendeeEditProps {
  attendee: IBookingAttendeeDTO;
  saveAttendee: (attendee: IBookingAttendeeDTO) => void;
}

export default function AttendeeEdit({
  attendee,
  saveAttendee,
}: IAttendeeEditProps) {
  const { isOpen, modelRef, setIsOpen, handleModel } = useModel<HTMLDivElement>(
    {}
  );

  const [attendeeToEdit, setAttendeeToEdit] =
    useState<IBookingAttendeeDTO>(attendee);
  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    saveAttendee(attendeeToEdit);
    setIsOpen(false);
  };

  return (
    <div className="h-5 w-5">
      <button onClick={handleModel} type="button">
        {attendee ? <EditIcon className="h-full w-full" /> : <PlusIcon />}
      </button>

      <ModelOverlay isOpen={isOpen}>

        <div
          ref={modelRef}
          className={` ${
            isOpen ? "opacity-100" : " opacity-0"
          } transition-opacity duration-300  z-10 bg-main-white rounded-lg border-8 border-main-bg grid gap-4 text-main-bg  p-4 `}
        >
          <header>
            <h3 className="text-lg font-semibold">
              {attendee.email ? "ערוך מוזמן" : "הוסף מוזמן"}
            </h3>
          </header>

          <InputText
            inputProps={{
              name: "name",
              id: "name",
              defaultValue: attendee?.name || "",
              onChange: (e) => handleInputChange(e, setAttendeeToEdit),
              placeholder: "שם מוזמן",
            }}
            labelProps={{
              htmlFor: "name",
              children: "שם מוזמן",
            }}
          />

          <InputText
            inputProps={{
              name: "email",
              id: "email",
              defaultValue: attendee?.email || "",
              onChange: (e) => handleInputChange(e, setAttendeeToEdit),
              placeholder: "אימייל",
              type: "email",
            }}
            labelProps={{
              htmlFor: "email",
              children: "אימייל",
            }}
          />

          <div className="grid grid-cols-2 gap-4">
            <button className="bg-green-900 text-main-white rounded-lg" onClick={onClick} type="button">
              שמור
            </button>
            <button className="bg-main-bg text-main-white rounded-lg" onClick={handleModel} type="button">
              בטל
            </button>
          </div>

        </div>
      </ModelOverlay>
    </div>
  );
}
