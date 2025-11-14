import type { IRoomEditDTO } from "../models/RoomDTO";

const getEmpty = (): IRoomEditDTO => ({
  name: "",
  capacity: 0,
  floor: 0,
  hasProjector: false,
  hasTeamMeeting: false,
  hasConferenceCall: false,
  imageUrl: "",
  status: "Active",
  notes:""
});

const roomUtil = {
  getEmpty,
};

export default roomUtil;
