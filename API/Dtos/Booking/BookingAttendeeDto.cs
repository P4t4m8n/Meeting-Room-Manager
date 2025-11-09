namespace API.Dtos.Booking
{
    public class BookingAttendeeDto : Dto
    {
        public required string Email { get; set; }
        public string? Name { get; set; }
    }
}