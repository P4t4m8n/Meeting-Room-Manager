using System.Data;
using System.Security.Claims;
using API.Attributes;
using API.Dtos.Booking;
using API.Dtos.Room;
using API.Dtos.User;
using API.Interfaces;
using API.QueryParams;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/bookings")]
    public class BookingsController : ControllerBase
    {
        private readonly IDataContext _contextDapper;
        private readonly IGoogleCalendarService _calendarService;
        private readonly IBookingService _bookingService;
        private readonly IEncryptionService _encryptionService;
        private readonly IAuthService _authService;

        public BookingsController(IDataContext contextDapper, IGoogleCalendarService calendarService, IBookingService bookingService, IEncryptionService encryptionService, IAuthService authService)
        {
            _contextDapper = contextDapper;
            _calendarService = calendarService;
            _bookingService = bookingService;
            _encryptionService = encryptionService;
            _authService = authService;
        }

        [RequireRole("Admin")]
        [HttpGet("")]
        public async Task<ActionResult<IEnumerable<BookingDto>>> Get(
            [FromQuery] BookingQueryParams? queryParams = null
      )
        {

            IEnumerable<BookingDto>? bookings = await _bookingService.GetBookingsAsync(queryParams);
            return Ok(bookings);
        }

        [HttpGet("my-bookings")]
        public async Task<ActionResult<IEnumerable<BookingDto>>> GetMyBookings()
        {
            string userId = User.FindFirstValue("userId") ?? "";
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "User not authenticated" });

            string sql = "EXEC MeetingSchema.usp_Bookings_Select_Many @UserId=@UserId";

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@UserId", Guid.Parse(userId));

            IEnumerable<BookingDto> bookings = await _contextDapper.LoadData<BookingDto>(sql, parameters);
            return Ok(bookings);
        }

        [HttpGet("{id}", Name = "GetBookingById")]
        public async Task<ActionResult<BookingDto>> GetBookingById(Guid id)
        {

            BookingDto? booking = await _bookingService.GetBookingByIdAsync(id);

            if (booking == null)
                return NotFound(new { message = "Booking not found or unauthorized" });

            return Ok(booking);
        }
        [RequireRole("Admin", "User")]
        [HttpPost("edit")]
        public async Task<ActionResult<BookingDto>> CreateBooking([FromBody] BookingCreateDto bookingDto)
        {
            if (bookingDto == null)
                return BadRequest(new { message = "Booking data is required" });

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            string userId = User.FindFirstValue("userId") ?? "";
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "User not authenticated" });

            bookingDto.UserId = Guid.Parse(userId);



            BookingDto? createdBooking = await _bookingService.CreateBookingAsync(bookingDto);

            if (createdBooking == null)
                return StatusCode(500, new { message = "Failed to create booking" });

            try
            {
                string refreshToken = await _authService.GetRefreshTokenAsync(bookingDto.UserId);

                string eventId = await _calendarService.AddToGoogleCalendar(createdBooking, refreshToken);

                if (!string.IsNullOrEmpty(eventId))
                {
                    int rowAffected = await _bookingService.UpdateBookingCalendarEventIdAsync(createdBooking.Id, eventId);

                    if (rowAffected == 0)
                        return StatusCode(500, new { message = "Booking created but failed to update calendar event ID" });
                }
                else
                {
                    return StatusCode(207, new
                    {
                        message = "Booking created but calendar event creation failed",
                        booking = createdBooking
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Calendar event creation failed: {ex.Message}");
                return StatusCode(207, new
                {
                    message = "Booking created but calendar event creation failed",
                    booking = createdBooking
                });
            }

            return CreatedAtAction(nameof(GetBookingById), new { id = createdBooking.Id }, createdBooking);
        }
        [RequireRole("Admin", "User")]
        [HttpPut("edit/{id}")]
        public async Task<IActionResult> UpdateBooking(Guid id, [FromBody] BookingEditDto bookingDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            string userId = User.FindFirstValue("userId") ?? "";
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "User not authenticated" });

            if (bookingDto?.EndTime != null && bookingDto.EndTime <= bookingDto.StartTime)
                return BadRequest(new { message = "End time must be after start time" });

            if (bookingDto?.StartTime != null && bookingDto?.StartTime < DateTime.UtcNow)
                return BadRequest(new { message = "Cannot update booking to the past" });

            string getBookingSql = "SELECT UserId, RoomId FROM MeetingSchema.Bookings WHERE Id = @BookingId";
            DynamicParameters getParams = new DynamicParameters();
            getParams.Add("@BookingId", id);
            var existingBooking = await _contextDapper.QuerySingleOrDefaultAsync<dynamic>(getBookingSql, getParams);

            if (existingBooking == null)
                return NotFound(new { message = "Booking not found" });

            string userRoleSql = "SELECT Role FROM MeetingSchema.Users WHERE Id = @UserId";
            DynamicParameters roleParams = new DynamicParameters();
            roleParams.Add("@UserId", Guid.Parse(userId));
            string? userRole = await _contextDapper.QuerySingleOrDefaultAsync<string>(userRoleSql, roleParams);

            if (existingBooking.UserId.ToString() != userId && userRole != "Admin")
                return Forbid();

            if (bookingDto?.StartTime != null || bookingDto?.EndTime != null)
            {


                var bufferMinutes = bookingDto?.BufferMinutes ?? 0;
                var searchStartTime = bookingDto?.StartTime.AddMinutes(-bufferMinutes) ?? DateTime.MinValue;
                var searchEndTime = bookingDto?.EndTime.AddMinutes(bufferMinutes) ?? DateTime.MaxValue;

                string conflictSql = @"
                SELECT COUNT(1) 
                FROM MeetingSchema.Bookings 
                WHERE RoomId = @RoomId
                AND Id != @BookingId
                AND Status = 'Active'
                AND (StartTime < @SearchEndTime AND EndTime > @SearchStartTime)";

                DynamicParameters conflictParams = new DynamicParameters();
                conflictParams.Add("@RoomId", existingBooking.RoomId);
                conflictParams.Add("@BookingId", id);
                conflictParams.Add("@SearchStartTime", searchStartTime);
                conflictParams.Add("@SearchEndTime", searchEndTime);

                int conflicts = await _contextDapper.QuerySingleOrDefaultAsync<int>(conflictSql, conflictParams);

                if (conflicts > 0)
                    return Conflict(new { message = "Room is already booked for the requested time slot" });
            }

            string? attendeesJson = bookingDto?.Attendees != null && bookingDto.Attendees.Any()
                ? System.Text.Json.JsonSerializer.Serialize(bookingDto.Attendees)
                : null;

            string sql = @"EXEC MeetingSchema.usp_Bookings_Update 
                          @UserId=@UserId,
                          @StartTime=@StartTime, 
                          @EndTime=@EndTime, 
                          @BufferMinutes=@BufferMinutes,
                          @Status=@Status,
                          @Attendees=@Attendees";

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@UserId", Guid.Parse(userId));
            parameters.Add("@StartTime", bookingDto?.StartTime);
            parameters.Add("@EndTime", bookingDto?.EndTime);
            parameters.Add("@BufferMinutes", bookingDto?.BufferMinutes);
            parameters.Add("@Status", bookingDto?.Status?.ToString());
            parameters.Add("@Attendees", attendeesJson);

            int rowsAffected = await _contextDapper.ExecuteAsync(sql, parameters);

            if (rowsAffected == 0)
                return NotFound(new { message = "Failed to update booking" });

            return Ok(new { message = "Booking updated successfully" });
        }
        [RequireRole("Admin", "User")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelBooking(Guid id)
        {
            string userId = User.FindFirstValue("userId") ?? "";
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "User not authenticated" });

            string getBookingSql = "SELECT UserId FROM MeetingSchema.Bookings WHERE Id = @BookingId AND Status = 'Active'";
            DynamicParameters getParams = new DynamicParameters();
            getParams.Add("@BookingId", id);
            var existingBooking = await _contextDapper.QuerySingleOrDefaultAsync<dynamic>(getBookingSql, getParams);

            if (existingBooking == null)
                return NotFound(new { message = "Booking not found or already cancelled" });

            string userRoleSql = "SELECT Role FROM MeetingSchema.Users WHERE Id = @UserId";
            DynamicParameters roleParams = new DynamicParameters();
            roleParams.Add("@UserId", Guid.Parse(userId));
            string? userRole = await _contextDapper.QuerySingleOrDefaultAsync<string>(userRoleSql, roleParams);

            if (existingBooking.UserId.ToString() != userId && userRole != "Admin")
                return Forbid();

            string sql = "EXEC MeetingSchema.usp_Bookings_Cancel @BookingId=@BookingId";

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@BookingId", id);

            int rowsAffected = await _contextDapper.ExecuteAsync(sql, parameters);

            if (rowsAffected == 0)
                return NotFound(new { message = "Failed to cancel booking" });

            return NoContent();
        }
        [RequireRole("Admin", "User")]
        [HttpGet("room/{roomId}/availability")]
        public async Task<IActionResult> GetRoomAvailability(
            Guid roomId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            if (endDate <= startDate)
                return BadRequest(new { message = "End date must be after start date" });

            string sql = @"
                SELECT 
                    StartTime,
                    EndTime,
                    BufferMinutes
                FROM MeetingSchema.Bookings
                WHERE RoomId = @RoomId
                AND Status = 'Active'
                AND StartTime <= @EndDate
                AND EndTime >= @StartDate
                ORDER BY StartTime";

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@RoomId", roomId);
            parameters.Add("@StartDate", startDate);
            parameters.Add("@EndDate", endDate);

            var bookings = await _contextDapper.LoadData<dynamic>(sql, parameters);
            return Ok(bookings);
        }
    }
}