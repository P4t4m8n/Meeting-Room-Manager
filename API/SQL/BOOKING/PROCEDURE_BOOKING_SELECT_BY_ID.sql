USE MeetingDB

GO

CREATE OR ALTER PROCEDURE MeetingSchema.usp_Bookings_Select_By_Id
    @Id UNIQUEIDENTIFIER
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
    WHERE b.Id = @Id
END