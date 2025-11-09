using API.Dtos.Room;
using API.Dtos.User;
using API.Enums;

namespace API.Dtos.Booking
{
    public class BookingDto : Dto
    {
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int BufferMinutes { get; set; }
        public RoomBookingStatus Status { get; set; } = RoomBookingStatus.Active;
        public string? CalendarEventId { get; set; }
        // Navigation properties
        public RoomDto? Room { get; set; }
        public UserDto? User { get; set; }
        public List<BookingAttendeeDto>? Attendees { get; set; }
    }
}