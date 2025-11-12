namespace API.Dtos.Booking
{
    public class GoogleCalendarReqDTO
    {
        public string? Summary { get; set; }
        public string? Description { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string? CalendarId { get; set; }
        public string? RefreshToken { get; set; }
        public BookingAttendeeDto[]? Attendees { get; set; }
    }
}

