namespace API.Models
{
    public class Booking : Model
    {
        public Guid RoomId { get; set; }
        public Guid UserId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int BufferMinutes { get; set; }
        public string Status { get; set; } = "Active";
        public string? CalendarEventId { get; set; }
        // Navigation properties
        public Room? Room { get; set; }
        public User? User { get; set; }
        public List<BookingAttendee>? Attendees { get; set; }
    }
}