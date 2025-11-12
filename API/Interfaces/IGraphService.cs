

using API.Dtos.Booking;
using Microsoft.Graph.Models;

public interface IGraphService
{
    public Task<Event?> CreateEventAsync(
                               string userEmail,
                               string subject,
                               string? Body,
                               DateTime startTime,
                               DateTime endTime,
                               string? RoomName,
                               int? RoomFloor,
                               List<BookingAttendeeDto> attendees);

    public Task EmitEventAsync(string userId, BookingDto createdBooking);
}