namespace API.Models
{
    public class BookingAttendee : Model
    {
        public Guid BookingId { get; set; }
        public required string Email { get; set; }
        public string? Name { get; set; }
    }
}