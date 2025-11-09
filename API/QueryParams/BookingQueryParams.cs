using API.Enums;

namespace API.QueryParams
{
    public class BookingQueryParams : QueryParams
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public Guid? RoomId { get; set; }
        public Guid? UserId { get; set; }
        public RoomBookingStatus? Status { get; set; }

    }
}