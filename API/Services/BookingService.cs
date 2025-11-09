using API.Dtos.Booking;
using API.Exceptions;
using API.Interfaces;
using Dapper;

namespace API.Services
{
    public class BookingService
    {
        private readonly IDataContext _contextDapper;
        private readonly GraphService _graphService;

        public BookingService(IDataContext contextDapper, GraphService graphService)
        {
            _contextDapper = contextDapper;
            _graphService = graphService;
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

            BookingDto? createdBooking = await _contextDapper.InsertAndReturn<BookingDto>(sql, parameters);
            return createdBooking;
        }

        private async Task<bool> CheckRoomStatusAsync(Guid roomId)
        {
            string checkRoomSql = "SELECT Status FROM MeetingSchema.Rooms WHERE Id = @RoomId";
            DynamicParameters checkParams = new DynamicParameters();
            checkParams.Add("@RoomId", roomId);
            string? roomStatus = await _contextDapper.LoadDataSingle<string>(checkRoomSql, checkParams);

            return roomStatus == "Active";
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

            int conflicts = await _contextDapper.LoadDataSingle<int>(conflictSql, conflictParams);

            return conflicts > 0;
        }

        private static string? SerializeAttendeesToJson(List<BookingAttendeeDto>? attendees)
        {
            return attendees != null && attendees.Count != 0
                ? System.Text.Json.JsonSerializer.Serialize(attendees)
                : null;
        }
    }
}