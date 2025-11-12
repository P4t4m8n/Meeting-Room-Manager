using API.Dtos.Booking;
using API.QueryParams;

namespace API.Interfaces
{
    public interface IBookingService
    {
        Task<BookingDto?> CreateBookingAsync(BookingCreateDto bookingDto);
        public Task<IEnumerable<BookingDto>> GetBookingsAsync(BookingQueryParams? queryParams);
        public Task<BookingDto?> GetBookingByIdAsync(Guid id);
        public Task<int> UpdateBookingCalendarEventIdAsync(Guid? bookingId, string calendarEventId);


    }
}
