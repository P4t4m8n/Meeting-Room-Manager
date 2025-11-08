namespace API.Models
{
    public class MaintenanceRequest : Model
    {
        public Guid RoomId { get; set; }
        public Guid? BookingId { get; set; }
        public string? Description { get; set; }
        public string Status { get; set; } = "Pending";
        public string? ReportedBy { get; set; }//Email
        public DateTime ReportedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public Room? Room { get; set; }
    }
}