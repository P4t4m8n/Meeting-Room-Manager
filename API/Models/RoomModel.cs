namespace API.Models
{
    public class Room : Model
    {
        public required string Name { get; set; }
        public int Floor { get; set; }
        public int Capacity { get; set; }
        public bool HasProjector { get; set; }
        public bool HasZoom { get; set; }
        public bool HasConferenceCall { get; set; }
        public string? ImageUrl { get; set; }
        public string Status { get; set; } = "Active";

    }
}