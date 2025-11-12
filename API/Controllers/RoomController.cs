using API.Attributes;
using API.Data;
using API.Dtos.Room;
using API.Models;
using API.QueryParams;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/rooms")]
    public class RoomsController : ControllerBase
    {
        private readonly DataContextDapper _dapper;

        public RoomsController(IConfiguration config)
        {
            _dapper = new DataContextDapper(config);
        }


        [HttpGet("")]
        public async Task<ActionResult<IEnumerable<RoomDto>>> SearchRooms([FromQuery] RoomQueryParams roomQueryParams)
        {
            string sql = @"
                SELECT 
                    Id ,
                    Name,
                    Floor,
                    Capacity,
                    HasProjector,
                    HasTeamMeeting,
                    HasConferenceCall,
                    ImageUrl,
                    Status,
                    CreatedAt,
                    UpdatedAt
        
                FROM MeetingSchema.Rooms 
                WHERE (@Capacity IS NULL OR Capacity >= @Capacity)
                AND (@Floor IS NULL OR Floor = @Floor)
                AND (@HasProjector IS NULL OR HasProjector = @HasProjector)
                AND (@HasTeamMeeting IS NULL OR HasTeamMeeting = @HasTeamMeeting)
                AND (@HasConferenceCall IS NULL OR HasConferenceCall = @HasConferenceCall)
                ORDER BY Floor ASC
                    
                    OFFSET ISNULL(@Offset, 0) ROWS
                     FETCH NEXT ISNULL(@Limit, 10) ROWS ONLY";

            DateTime? searchStartTime = roomQueryParams.StartTime?.AddMinutes(-roomQueryParams.BufferMinutes ?? 0);
            DateTime? searchEndTime = roomQueryParams.EndTime?.AddMinutes(roomQueryParams.BufferMinutes ?? 0);

            int limit = roomQueryParams.Limit ?? 10;
            int offset = roomQueryParams.Offset ?? 0;

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@SearchStartTime", searchStartTime);
            parameters.Add("@SearchEndTime", searchEndTime);
            parameters.Add("@Capacity", roomQueryParams.Capacity);
            parameters.Add("@Floor", roomQueryParams.Floor);
            parameters.Add("@HasProjector", roomQueryParams.HasProjector);
            parameters.Add("@HasTeamMeeting", roomQueryParams.HasTeamMeeting);
            parameters.Add("@HasConferenceCall", roomQueryParams.HasConferenceCall);
            parameters.Add("@Limit", limit);
            parameters.Add("@Offset", offset);

            IEnumerable<Room> rooms = await _dapper.LoadData<Room>(sql, parameters);

            return Ok(rooms);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RoomDto>> GetRoomById(Guid id)
        {
            string sql = @"
                SELECT 
                    Id,
                    Name,
                    Floor,
                    Capacity,
                    HasProjector,
                    HasTeamMeeting,
                    HasConferenceCall,
                    ImageUrl,
                    Status,
                    CreatedAt,
                    UpdatedAt
                FROM MeetingSchema.Rooms
                WHERE Id = @id";

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@id", id);

            Room? room = await _dapper.QuerySingleOrDefaultAsync<Room>(sql, parameters);

            if (room == null)
                return NotFound(new { message = "Room not found" });

            return Ok(room);
        }

        [RequireRole("Admin")]
        [HttpPost("edit")]
        public async Task<IActionResult> CreateRoom([FromBody] RoomCreateDto roomDto)
        {
            try
            {
                string sql = @"
                INSERT INTO MeetingSchema.Rooms 
                ( Name, Floor, Capacity, HasProjector, HasTeamMeeting, HasConferenceCall, ImageUrl, Status)
                OUTPUT 
                    INSERTED.Id,
                    INSERTED.Name,
                    INSERTED.Floor,
                    INSERTED.Capacity,
                    INSERTED.HasProjector,
                    INSERTED.HasTeamMeeting,
                    INSERTED.HasConferenceCall,
                    INSERTED.ImageUrl,
                    INSERTED.Status,
                    INSERTED.CreatedAt,
                    INSERTED.UpdatedAt
                VALUES 
                ( @Name, @Floor, @Capacity, @HasProjector, @HasTeamMeeting, @HasConferenceCall, @ImageUrl, @Status);
                
        ";

                var parameters = new DynamicParameters();
                parameters.Add("@Name", roomDto.Name);
                parameters.Add("@Floor", roomDto.Floor);
                parameters.Add("@Capacity", roomDto.Capacity);
                parameters.Add("@HasProjector", roomDto.HasProjector);
                parameters.Add("@HasTeamMeeting", roomDto.HasTeamMeeting);
                parameters.Add("@HasConferenceCall", roomDto.HasConferenceCall);
                parameters.Add("@ImageUrl", roomDto.ImageUrl);
                parameters.Add("@Status", "Active");


                Room? createdRoom = await _dapper.InsertAndReturn<Room>(sql, parameters);

                if (createdRoom == null)
                {
                    // This case might occur if the OUTPUT clause fails or returns nothing.
                    return BadRequest("Failed to create Room.");
                }

                return Ok(createdRoom);
            }
            catch (System.Exception ex)
            {

                return StatusCode(500, $"An error occurred while processing your request -> {ex.Message}");
            }
        }

        [RequireRole("Admin")]
        [HttpPut("edit/{id}")]
        public async Task<ActionResult<RoomDto>> UpdateRoom(Guid id, RoomEditDto roomDto)
        {

            string sql = @"
                UPDATE MeetingSchema.Rooms
                SET 
                    Name =CASE WHEN @Name IS NOT NULL THEN @Name ELSE Name END,
                    Floor =CASE WHEN @Floor IS NOT NULL THEN @Floor ELSE Floor END,
                    Capacity = CASE WHEN @Capacity IS NOT NULL THEN @Capacity ELSE Capacity END,
                    HasProjector = CASE WHEN @HasProjector IS NOT NULL THEN @HasProjector ELSE HasProjector END,
                    HasTeamMeeting = CASE WHEN @HasTeamMeeting IS NOT NULL THEN @HasTeamMeeting ELSE HasTeamMeeting END,
                    HasConferenceCall = CASE WHEN @HasConferenceCall IS NOT NULL THEN @HasConferenceCall ELSE HasConferenceCall END,
                    ImageUrl = CASE WHEN @ImageUrl IS NOT NULL THEN @ImageUrl ELSE ImageUrl END,
                    Status = CASE WHEN @Status IS NOT NULL THEN @Status ELSE Status END
                    OUTPUT 
                        INSERTED.Id,
                        INSERTED.Name,
                        INSERTED.Floor,
                        INSERTED.Capacity,
                        INSERTED.HasProjector,
                        INSERTED.HasTeamMeeting,
                        INSERTED.HasConferenceCall,
                        INSERTED.ImageUrl,
                        INSERTED.Status,
                        INSERTED.CreatedAt,
                        INSERTED.UpdatedAt
                WHERE Id = @RoomId;
                
                 
            ";

            var parameters = new DynamicParameters();
            parameters.Add("@RoomId", id);
            parameters.Add("@Name", roomDto.Name);
            parameters.Add("@Floor", roomDto.Floor);
            parameters.Add("@Capacity", roomDto.Capacity);
            parameters.Add("@HasProjector", roomDto.HasProjector);
            parameters.Add("@HasTeamMeeting", roomDto.HasTeamMeeting);
            parameters.Add("@HasConferenceCall", roomDto.HasConferenceCall);
            parameters.Add("@ImageUrl", roomDto.ImageUrl);
            parameters.Add("@Status", roomDto.Status);

            Room? updatedRoom = await _dapper.InsertAndReturn<Room>(sql, parameters);

            return Ok(updatedRoom);
        }

        [RequireRole("Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoom(Guid id)
        {


            string sql = @"
               DELETE FROM MeetingSchema.Rooms
               WHERE Id = @id;";

            var parameters = new DynamicParameters();
            parameters.Add("@id", id);

            var rowsAffected = await _dapper.ExecuteAsync(sql, parameters);

            if (rowsAffected == 0)
                return NotFound(new { message = "Room not found" });

            return NoContent();
        }


    }
}