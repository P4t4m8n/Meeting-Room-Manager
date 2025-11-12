USE MeetingDB

GO

CREATE OR ALTER PROCEDURE MeetingSchema.usp_Bookings_Create
    @RoomId UNIQUEIDENTIFIER,
    @UserId UNIQUEIDENTIFIER,
    @StartTime DATETIME2,
    @EndTime DATETIME2,
    @BufferMinutes INT,
    @Attendees NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    DECLARE @BookingId UNIQUEIDENTIFIER = NEWID();

    BEGIN TRY
        INSERT INTO MeetingSchema.Bookings
        (Id, RoomId, UserId, StartTime, EndTime, BufferMinutes, Status)
    VALUES
        (@BookingId, @RoomId, @UserId, @StartTime, @EndTime, @BufferMinutes, 'Active');
        
        IF @Attendees IS NOT NULL
        BEGIN
        INSERT INTO MeetingSchema.BookingAttendees
            (Id, BookingId, Email, Name)
        SELECT
            NEWID(),
            @BookingId,
            JSON_VALUE(value, '$.Email'),
            JSON_VALUE(value, '$.Name')
        FROM OPENJSON(@Attendees);
    END
        
    SELECT
        b.Id, b.RoomId, b.UserId, b.StartTime, b.EndTime, b.BufferMinutes, b.Status, b.CalendarEventId, b.CreatedAt, b.UpdatedAt,
        r.Id as RoomId, r.Name, r.Floor, r.Capacity, r.HasProjector, r.HasTeamMeeting, r.HasConferenceCall, r.ImageUrl, r.Status,
        u.Id as UserId, u.Email, u.Name, u.Role,
        ba.Id as AttendeeId, ba.BookingId, ba.Email, ba.Name
    FROM MeetingSchema.Bookings b
        INNER JOIN MeetingSchema.Rooms r ON b.RoomId = r.Id
        INNER JOIN MeetingSchema.Users u ON b.UserId = u.Id
        LEFT JOIN MeetingSchema.BookingAttendees ba ON b.Id = ba.BookingId
    WHERE b.Id = @BookingId
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO