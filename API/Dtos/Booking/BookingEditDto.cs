using API.Dtos.Room;
using API.Dtos.User;
using API.Enums;

namespace API.Dtos.Booking
{
    public class BookingEditDto : Dto
    {
        public required DateTime StartTime { get; set; }
        public required DateTime EndTime { get; set; }
        public int? BufferMinutes { get; set; }
        public RoomBookingStatus? Status { get; set; }
        public string? CalendarEventId { get; set; }
        public string? Summary { get; set; }
        public string? Description { get; set; }
        // Navigation properties
        public RoomDto? Room { get; set; }
        public UserDto? User { get; set; }
        public List<BookingAttendeeDto>? Attendees { get; set; }
    }
}