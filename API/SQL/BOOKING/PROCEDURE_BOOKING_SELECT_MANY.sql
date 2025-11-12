USE MeetingDB

GO

CREATE OR ALTER PROCEDURE MeetingSchema.usp_Bookings_Select_Many
    @StartDate DATETIME2 = NULL,
    @EndDate DATETIME2 = NULL,
    @RoomId UNIQUEIDENTIFIER = NULL,
    @Status NVARCHAR(20) = NULL,
    @UserId UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SELECT
        b.Id, b.RoomId, b.UserId, b.StartTime, b.EndTime, b.BufferMinutes, b.Status, b.CalendarEventId, b.CreatedAt, b.UpdatedAt,
        r.Id as RoomId, r.Name, r.Floor, r.Capacity, r.HasProjector, r.HasTeamMeeting, r.HasConferenceCall, r.ImageUrl, r.Status,
        u.Id as UserId, u.Email, u.Name, u.Role,
        ba.Id as AttendeeId, ba.BookingId, ba.Email, ba.Name
    FROM MeetingSchema.Bookings b
        INNER JOIN MeetingSchema.Rooms r ON b.RoomId = r.Id
        INNER JOIN MeetingSchema.Users u ON b.UserId = u.Id
        LEFT JOIN MeetingSchema.BookingAttendees ba ON b.Id = ba.BookingId
    WHERE (@StartDate IS NULL OR b.StartTime >= @StartDate)
        AND (@EndDate IS NULL OR b.EndTime <= @EndDate)
        AND (@RoomId IS NULL OR b.RoomId = @RoomId)
        AND (@Status IS NULL OR b.Status = @Status)
        AND (@UserId IS NULL OR b.UserId = @UserId)
    ORDER BY b.StartTime;
END