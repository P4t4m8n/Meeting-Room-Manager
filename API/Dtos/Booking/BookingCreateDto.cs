
using API.Enums;

namespace API.Dtos.Booking
{
    public class BookingCreateDto : Dto
    {
        public required DateTime StartTime { get; set; }
        public required DateTime EndTime { get; set; }
        public int? BufferMinutes { get; set; }
        public RoomBookingStatus? Status { get; set; }
        public string? CalendarEventId { get; set; }
        public string? Summary { get; set; }
        public string? Description { get; set; }
        // Navigation properties
        public Guid RoomId { get; set; }
        public Guid UserId { get; set; }
        public List<BookingAttendeeDto>? Attendees { get; set; }
    }
}