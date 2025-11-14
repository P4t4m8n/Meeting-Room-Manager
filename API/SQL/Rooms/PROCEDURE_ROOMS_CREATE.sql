CREATE OR ALTER PROCEDURE MeetingSchema.usp_Rooms_Create
    @Name NVARCHAR(100) ,
    @Floor INT ,
    @Capacity INT ,
    @HasProjector BIT ,
    @HasTeamMeeting BIT ,
    @HasConferenceCall BIT ,
    @ImageUrl NVARCHAR(MAX)=NULL,
    @PublicCloudinaryId NVARCHAR(MAX)=NULL,
    @Status NVARCHAR(50),
    @Notes NVARCHAR(MAX)=NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO MeetingSchema.Rooms
        ( Name, Floor, Capacity, HasProjector, HasTeamMeeting, HasConferenceCall, ImageUrl, PublicCloudinaryId, Status, Notes)
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
    INSERTED.Notes,
    INSERTED.CreatedAt,
    INSERTED.UpdatedAt
    VALUES
        ( @Name, @Floor, @Capacity, @HasProjector, @HasTeamMeeting, @HasConferenceCall, @ImageUrl, @PublicCloudinaryId, @Status, @Notes);

END