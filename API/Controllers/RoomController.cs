using API.Attributes;
using API.Data;
using API.Dtos.Cloudinary;
using API.Dtos.Http;
using API.Dtos.Room;
using API.Interfaces;
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
        private readonly ICloudinaryService _cloudinaryService;

        public RoomsController(IConfiguration config, ICloudinaryService cloudinaryService)
        {
            _dapper = new DataContextDapper(config);
            _cloudinaryService = cloudinaryService;
        }


        [HttpGet("")]
        public async Task<ActionResult<IEnumerable<RoomDto>>> SearchRooms([FromQuery] RoomQueryParams roomQueryParams)
        {
            try
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

                IEnumerable<RoomDto> rooms = await _dapper.LoadData<RoomDto>(sql, parameters) ?? [];
                HttpResponseDTO<IEnumerable<RoomDto>> response = new()
                {
                    Data = rooms,
                    StatusCode = 201,
                    Message = "Room created successfully.",
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                HttpErrorResponseDTO err = new()
                {
                    StatusCode = 500,
                    Message = "Unexpected error occurred while getting a rooms.",
                    Errors = new Dictionary<string, string>
                    {
                        { "ExceptionMessage", ex.Message },
                        { "StackTrace", ex.StackTrace ?? "N/A" }
                    }
                };

                return StatusCode(500, err);
            }
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
        public async Task<IActionResult> CreateRoom([FromForm] RoomCreateDto roomDto, [FromForm] IFormFile? image)
        {
            try
            {
                string sql = @"EXEC MeetingSchema.usp_Rooms_Create
                    @Name= @Name,
                    @Floor = @Floor,
                    @Capacity = @Capacity,
                    @HasProjector = @HasProjector,
                    @HasTeamMeeting     = @HasTeamMeeting,
                    @HasConferenceCall = @HasConferenceCall,
                    @ImageUrl = @ImageUrl,
                    @PublicCloudinaryId = @PublicCloudinaryId,
                    @Notes = @Notes,
                    @Status = @Status;";

                var parameters = new DynamicParameters();
                parameters.Add("@Name", roomDto.Name);
                parameters.Add("@Floor", roomDto.Floor);
                parameters.Add("@Capacity", roomDto.Capacity);
                parameters.Add("@HasProjector", roomDto.HasProjector);
                parameters.Add("@HasTeamMeeting", roomDto.HasTeamMeeting);
                parameters.Add("@HasConferenceCall", roomDto.HasConferenceCall);
                parameters.Add("@Notes", roomDto?.Notes);
                parameters.Add("@Status", roomDto?.Status.ToString());//Controller map to Enum so the DB cant check it, convert to string

                //Only for debugging, image in required otherwise
                if (image != null)
                {

                    CloudinaryResDTO? cloudinaryResDTO = await _cloudinaryService.UploadImage(image);
                    parameters.Add("@ImageUrl", cloudinaryResDTO?.SecureUrl);
                    parameters.Add("@PublicCloudinaryId", cloudinaryResDTO?.PublicId);
                }
                else
                {
                    parameters.Add("@ImageUrl", null);
                    parameters.Add("@PublicCloudinaryId", null);
                }

                RoomDto? createdRoom = await _dapper.InsertAndReturn<RoomDto>(sql, parameters);

                if (createdRoom == null)
                {
                    HttpErrorResponseDTO err = new()
                    {
                        StatusCode = 400,
                        Message = "Failed to create Room.",
                        Errors = new Dictionary<string, string>
                            {
                                { "CreationError", "The room could not be created due to an unknown error." }
                            }
                    };
                    return BadRequest(err);
                }

                HttpResponseDTO<RoomDto> response = new()
                {
                    Data = createdRoom,
                    StatusCode = 201,
                    Message = "Room created successfully.",
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                HttpErrorResponseDTO err = new()
                {
                    StatusCode = 500,
                    Message = "Unexpected error occurred while creating a room.",
                    Errors = new Dictionary<string, string>
                    {
                        { "ExceptionMessage", ex.Message },
                        { "StackTrace", ex.StackTrace ?? "N/A" }
                    }
                };

                return StatusCode(500, err);
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