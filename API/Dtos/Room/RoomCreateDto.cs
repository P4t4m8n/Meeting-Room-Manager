namespace API.Dtos.Room
{
    public class RoomCreateDto 
    {
        public required string Name { get; set; }
        public required int Capacity { get; set; }
        public required int Floor { get; set; }
        public required bool HasProjector { get; set; }
        public required bool HasTeamMeeting { get; set; }
        public required bool HasConferenceCall { get; set; }
        public required string ImageUrl { get; set; }
    }
}