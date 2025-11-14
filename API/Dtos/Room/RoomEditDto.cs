using API.Enums;

namespace API.Dtos.Room
{
    public class RoomEditDto : Dto
    {
        public string? Name { get; set; }
        public int? Capacity { get; set; }
        public int? Floor { get; set; }
        public bool? HasProjector { get; set; }
        public bool? HasTeamMeeting { get; set; }
        public bool? HasConferenceCall { get; set; }
        public string? ImageUrl { get; set; }
        public string? PublicCloudinaryId { get; set; }
        public string? Notes { get; set; }
        public RoomStatus? Status { get; set; }

    }
}