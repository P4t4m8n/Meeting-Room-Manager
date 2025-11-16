import type { IBookingAttendeeDTO } from "@/models/BookingAttendeeDTO";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { EditIcon, PlusIcon } from "lucide-react";
import InputText from "../Form/InputText";
import { Button } from "../ui/button";
import { useState } from "react";
import handleInputChange from "@/utils/form.util";

interface IAttendeeEditProps {
  attendee: IBookingAttendeeDTO;
  saveAttendee: (attendee: IBookingAttendeeDTO) => void;
}

export default function AttendeeEdit({
  attendee,
  saveAttendee,
}: IAttendeeEditProps) {
  const [open, setOpen] = useState(false);
  const [attendeeToEdit, setAttendeeToEdit] =
    useState<IBookingAttendeeDTO>(attendee);
  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    saveAttendee(attendeeToEdit);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="h-5 w-5 leading-0">
        <DialogTrigger>{attendee ? <EditIcon className="h-full w-full" /> : <PlusIcon />}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{attendee ? "ערוך מוזמן" : "הוסף מוזמן"}</DialogTitle>
          </DialogHeader>
          <InputText
            inputProps={{
              name: "name",
              id: "name",
              defaultValue: attendee?.name || "",
              onChange: (e) => handleInputChange(e, setAttendeeToEdit),
            }}
            labelProps={{
              htmlFor: "name",
              children: "שם מוזמן",
            }}
          />
          <div className="">
            <label id="email" className="">
              אימייל
            </label>
            <input
              name="email"
              id="email"
              placeholder="אימייל"
              className=""
              type="email"
              onChange={(e) => handleInputChange(e, setAttendeeToEdit)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button onClick={onClick} type="button">
                Save changes
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </div>
    </Dialog>
  );
}
