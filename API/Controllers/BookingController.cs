using System.Security.Claims;
using API.Attributes;
using API.Dtos.Booking;
using API.Interfaces;
using API.Models;
using API.QueryParams;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using API.Services;

namespace API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly IDataContext _contextDapper;
        private readonly GraphService _graphService;
        private readonly BookingService _bookingService;

        public BookingsController(IDataContext contextDapper, GraphService graphService, BookingService bookingService)
        {
            _contextDapper = contextDapper;
            _graphService = graphService;
            _bookingService = bookingService;
        }

        [RequireRole("Admin")]
        [HttpGet("")]
        public async Task<ActionResult<IEnumerable<BookingDto>>> Get(
            [FromQuery] BookingQueryParams? queryParams = null
      )
        {
            string sql = @"EXEC MeetingSchema.usp_Bookings_Select_Many
                             @StartDate=@StartDate,
                             @EndDate=@EndDate,
                             @RoomId=@RoomId,
                             @Status=@Status
                             @UserId=@UserId
                             ";

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@StartDate", queryParams?.StartDate);
            parameters.Add("@EndDate", queryParams?.EndDate);
            parameters.Add("@RoomId", queryParams?.RoomId);
            parameters.Add("@Status", queryParams?.Status);
            parameters.Add("@UserId", queryParams?.UserId);

            IEnumerable<BookingDto> bookings = await _contextDapper.LoadData<BookingDto>(sql, parameters);
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

        [HttpGet("{id}")]
        public async Task<ActionResult<BookingDto>> GetBookingById(Guid id)
        {

            string sql = "EXEC MeetingSchema.usp_Bookings_Select_By_Id @BookingId=@BookingId";

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@BookingId", id);

            BookingDto? booking = await _contextDapper.LoadDataSingle<BookingDto>(sql, parameters);

            if (booking == null)
                return NotFound(new { message = "Booking not found or unauthorized" });

            return Ok(booking);
        }
        [RequireRole("Admin", "User")]
        [HttpPost("Edit")]
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

            await _graphService.EmitEventAsync(userId, createdBooking);

            return CreatedAtAction(nameof(GetBookingById), new { id = createdBooking.Id }, createdBooking);
        }
        [RequireRole("Admin", "User")]
        [HttpPut("Edit/{id}")]
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
            var existingBooking = await _contextDapper.LoadDataSingle<dynamic>(getBookingSql, getParams);

            if (existingBooking == null)
                return NotFound(new { message = "Booking not found" });

            string userRoleSql = "SELECT Role FROM MeetingSchema.Users WHERE Id = @UserId";
            DynamicParameters roleParams = new DynamicParameters();
            roleParams.Add("@UserId", Guid.Parse(userId));
            string? userRole = await _contextDapper.LoadDataSingle<string>(userRoleSql, roleParams);

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

                int conflicts = await _contextDapper.LoadDataSingle<int>(conflictSql, conflictParams);

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

            int rowsAffected = await _contextDapper.ExecuteSql(sql, parameters);

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
            var existingBooking = await _contextDapper.LoadDataSingle<dynamic>(getBookingSql, getParams);

            if (existingBooking == null)
                return NotFound(new { message = "Booking not found or already cancelled" });

            string userRoleSql = "SELECT Role FROM MeetingSchema.Users WHERE Id = @UserId";
            DynamicParameters roleParams = new DynamicParameters();
            roleParams.Add("@UserId", Guid.Parse(userId));
            string? userRole = await _contextDapper.LoadDataSingle<string>(userRoleSql, roleParams);

            if (existingBooking.UserId.ToString() != userId && userRole != "Admin")
                return Forbid();

            string sql = "EXEC MeetingSchema.usp_Bookings_Cancel @BookingId=@BookingId";

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@BookingId", id);

            int rowsAffected = await _contextDapper.ExecuteSql(sql, parameters);

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