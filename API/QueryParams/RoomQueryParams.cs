namespace API.QueryParams
{
    public class RoomQueryParams : QueryParams
    {
        public string? Name { get; set; }
        public int? Capacity { get; set; }
        public bool? HasProjector { get; set; }
        public bool? HasTeamMeeting { get; set; }
        public bool? HasConferenceCall { get; set; }
        public int? BufferMinutes { get; set; }
        public int? Floor { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }

    }
}