using System.Data;
using API.Dtos.Booking;
using API.Dtos.Room;
using API.Dtos.User;
using API.Enums;
using API.Exceptions;
using API.Interfaces;
using API.QueryParams;
using Dapper;

namespace API.Services
{
    public class BookingService : IBookingService
    {
        private readonly IDataContext _contextDapper;

        public BookingService(IDataContext contextDapper)
        {
            _contextDapper = contextDapper;
        }

        public async Task<IEnumerable<BookingDto>> GetBookingsAsync(BookingQueryParams? queryParams)
        {
            string sql = @"EXEC MeetingSchema.usp_Bookings_Select_Many 
                          @StartDate=@StartDate, 
                          @EndDate=@EndDate, 
                          @RoomId=@RoomId, 
                          @Status=@Status,
                          @UserId=@UserId";

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@StartDate", queryParams?.StartDate);
            parameters.Add("@EndDate", queryParams?.EndDate);
            parameters.Add("@RoomId", queryParams?.RoomId);
            parameters.Add("@Status", queryParams?.Status.ToString());
            parameters.Add("@UserId", queryParams?.UserId);

            return await QueryAndMapBookingsAsync(sql, parameters);
        }
        public async Task<BookingDto?> GetBookingByIdAsync(Guid id)
        {
            string sql = @"EXEC MeetingSchema.usp_Bookings_Select_By_Id 
                          @Id=@Id";

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@Id", id);

            var bookings = await QueryAndMapBookingsAsync(sql, parameters);
            return bookings.FirstOrDefault();
        }

        public async Task<BookingDto?> CreateBookingAsync(BookingCreateDto bookingDto)
        {
            if (bookingDto.EndTime <= bookingDto.StartTime)
            {
                throw new ArgumentException("End time must be after start time.");
            }

            if (bookingDto.StartTime < DateTime.UtcNow)
            {
                throw new ArgumentException("Cannot create a booking in the past.");
            }

            bool isRoomActive = await CheckRoomStatusAsync(bookingDto.RoomId);
            if (!isRoomActive)
            {
                throw new BookingConflictException("Cannot create booking: Room is not active.");
            }

            bool isRoomAvailable = await IsRoomAvailableAsync(bookingDto.RoomId, bookingDto.StartTime, bookingDto.EndTime, bookingDto.BufferMinutes);
            if (isRoomAvailable)
            {
                throw new BookingConflictException("Cannot create booking: Room is not available for the selected time slot.");
            }

            string? attendeesJson = SerializeAttendeesToJson(bookingDto.Attendees);

            string sql = @"EXEC MeetingSchema.usp_Bookings_Create 
                          @RoomId=@RoomId, 
                          @UserId=@UserId, 
                          @StartTime=@StartTime, 
                          @EndTime=@EndTime, 
                          @BufferMinutes=@BufferMinutes,
                          @Attendees=@Attendees";

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@RoomId", bookingDto.RoomId);
            parameters.Add("@UserId", bookingDto.UserId);
            parameters.Add("@StartTime", bookingDto.StartTime);
            parameters.Add("@EndTime", bookingDto.EndTime);
            parameters.Add("@BufferMinutes", bookingDto.BufferMinutes);
            parameters.Add("@Attendees", attendeesJson);

            using IDbConnection dbConnection = _contextDapper.CreateConnection();

            Dictionary<Guid, BookingDto> bookingDictionary = [];
            var createdBookings = await QueryAndMapBookingsAsync(sql, parameters);

            return createdBookings.FirstOrDefault();
        }

        public async Task<int> UpdateBookingCalendarEventIdAsync(Guid? bookingId, string calendarEventId)
        {
            string sql = @"UPDATE MeetingSchema.Bookings
                           SET CalendarEventId = @CalendarEventId
                           WHERE Id = @Id";

            DynamicParameters parameters = new();
            parameters.Add("@Id", bookingId);
            parameters.Add("@CalendarEventId", calendarEventId);

            return await _contextDapper.ExecuteAsync(sql, parameters);
        }
        private async Task<bool> CheckRoomStatusAsync(Guid roomId)
        {
            string checkRoomSql = "SELECT Status FROM MeetingSchema.Rooms WHERE Id = @RoomId";
            DynamicParameters checkParams = new DynamicParameters();
            checkParams.Add("@RoomId", roomId);
            string? roomStatus = await _contextDapper.QuerySingleOrDefaultAsync<string>(checkRoomSql, checkParams);

            return roomStatus == RoomBookingStatus.Active.ToString();
        }
        private async Task<bool> IsRoomAvailableAsync(Guid roomId, DateTime startTime, DateTime endTime, int? bufferMinutes)
        {
            DateTime? searchStartTime = startTime.AddMinutes(-bufferMinutes ?? 0);
            DateTime? searchEndTime = endTime.AddMinutes(bufferMinutes ?? 0);

            string conflictSql = @"
                SELECT COUNT(1) 
                FROM MeetingSchema.Bookings 
                WHERE RoomId = @RoomId 
                AND Status = 'Active'
                AND (StartTime < @SearchEndTime AND EndTime > @SearchStartTime)";

            DynamicParameters conflictParams = new DynamicParameters();
            conflictParams.Add("@RoomId", roomId);
            conflictParams.Add("@SearchStartTime", searchStartTime);
            conflictParams.Add("@SearchEndTime", searchEndTime);

            int conflicts = await _contextDapper.QuerySingleOrDefaultAsync<int>(conflictSql, conflictParams);

            return conflicts > 0;
        }
        private static string? SerializeAttendeesToJson(List<BookingAttendeeDto>? attendees)
        {
            return attendees != null && attendees.Count != 0
                ? System.Text.Json.JsonSerializer.Serialize(attendees)
                : null;
        }

        private async Task<IEnumerable<BookingDto>> QueryAndMapBookingsAsync(string sql, DynamicParameters parameters)
        {
            using IDbConnection dbConnection = _contextDapper.CreateConnection();

            Dictionary<Guid, BookingDto> bookingDictionary = [];
            return await dbConnection.QueryAsync<BookingDto, RoomDto, UserDto, BookingAttendeeDto, BookingDto>(
                  sql,
                  (booking, room, user, attendee) =>
                  {
                      if (!booking.Id.HasValue || !bookingDictionary.TryGetValue(booking.Id.Value, out var currentBooking))
                      {
                          currentBooking = booking;
                          currentBooking.Owner = user;
                          currentBooking.Room = room;
                          currentBooking.Attendees = new List<BookingAttendeeDto>();
                          bookingDictionary.Add(currentBooking.Id!.Value, currentBooking);
                      }

                      if (attendee != null)
                      {
                          currentBooking.Attendees!.Add(attendee);
                      }

                      return currentBooking;
                  },
                  parameters,
                  splitOn: "RoomId,UserId,AttendeeId"
              );
        }
    }
}