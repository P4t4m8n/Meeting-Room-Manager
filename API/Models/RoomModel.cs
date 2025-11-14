using API.Enums;

namespace API.Models
{
    public class Room : Model
    {
        public required string Name { get; set; }
        public required int Capacity { get; set; }
        public required int Floor { get; set; }
        public required bool HasProjector { get; set; }
        public required bool HasTeamMeeting { get; set; }
        public required bool HasConferenceCall { get; set; }
        public string? ImageUrl { get; set; }
        public string? PublicCloudinaryId { get; set; }
        public string? Notes { get; set; }
        public required RoomStatus Status { get; set; }

    }
}