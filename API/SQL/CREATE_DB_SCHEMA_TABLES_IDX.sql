IF NOT EXISTS (SELECT *
FROM sys.databases
WHERE name = 'MeetingDB')
BEGIN
    CREATE DATABASE MeetingDB;
END
GO

USE MeetingDB;

GO

IF NOT EXISTS (SELECT *
FROM sys.schemas
WHERE name = 'MeetingSchema')
    EXEC('CREATE SCHEMA MeetingSchema');

GO

IF NOT EXISTS (SELECT *
FROM sys.tables t
    JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE s.name = 'MeetingSchema' AND t.name = 'Rooms')
BEGIN

    CREATE TABLE MeetingSchema.Rooms
    (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Name NVARCHAR(100) NOT NULL,
        Floor INT NOT NULL,
        Capacity INT NOT NULL,
        HasProjector BIT NOT NULL DEFAULT 0,
        HasTeamMeeting BIT NOT NULL DEFAULT 0,
        HasConferenceCall BIT NOT NULL DEFAULT 0,
        ImageUrl NVARCHAR(500) NULL,
        Status NVARCHAR(20) NOT NULL DEFAULT 'Active',
        CONSTRAINT chk_room_status CHECK (Status IN ('Active', 'Inactive', 'Maintenance')),
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END
GO

IF NOT EXISTS (SELECT *
FROM sys.tables t
    JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE s.name = 'MeetingSchema' AND t.name = 'Users'
)
BEGIN
    CREATE TABLE MeetingSchema.Users
    (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Email NVARCHAR(255) NOT NULL UNIQUE,
        Name NVARCHAR(100) NOT NULL,
        Role NVARCHAR(20) NOT NULL DEFAULT 'User',
        CONSTRAINT chk_user_role CHECK (Role IN ('User', 'Admin', 'Maintenance')),

        PasswordHash VARBINARY (MAX) ,
        PasswordSalt VARBINARY (MAX) ,

        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
    );

END
GO
IF NOT EXISTS (SELECT *
FROM sys.tables t
    JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE s.name = 'MeetingSchema' AND t.name = 'Bookings'
)
BEGIN
    CREATE TABLE MeetingSchema.Bookings
    (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        RoomId UNIQUEIDENTIFIER NOT NULL,
        UserId UNIQUEIDENTIFIER NOT NULL,
        StartTime DATETIME2 NOT NULL,
        EndTime DATETIME2 NOT NULL,
        BufferMinutes INT NOT NULL DEFAULT 0,
        Status NVARCHAR(20) NOT NULL DEFAULT 'Active',
        CONSTRAINT chk_bookings_status CHECK (Status IN ('Active', 'Cancelled', 'Completed')),
        CalendarEventId NVARCHAR(255) NULL,-- Microsoft Graph event ID
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

        CONSTRAINT FK_Bookings_Rooms FOREIGN KEY (RoomId) REFERENCES MeetingSchema.Rooms(Id),
        CONSTRAINT FK_Bookings_Users FOREIGN KEY (UserId) REFERENCES MeetingSchema.Users(Id)
    );

END
GO
IF NOT EXISTS (SELECT *
FROM sys.tables t
    JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE s.name = 'MeetingSchema' AND t.name = 'BookingAttendees'
)
BEGIN
    CREATE TABLE MeetingSchema.BookingAttendees
    (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        BookingId UNIQUEIDENTIFIER NOT NULL,
        Email NVARCHAR(255) NOT NULL,
        Name NVARCHAR(100) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

        CONSTRAINT FK_BookingAttendees_Bookings FOREIGN KEY (BookingId) REFERENCES MeetingSchema.Bookings(Id) ON DELETE CASCADE
    );

END
GO
IF NOT EXISTS (SELECT *
FROM sys.tables t
    JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE s.name = 'MeetingSchema' AND t.name = 'MaintenanceRequests'
)
BEGIN
    CREATE TABLE MeetingSchema.MaintenanceRequests
    (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        RoomId UNIQUEIDENTIFIER NOT NULL,
        BookingId UNIQUEIDENTIFIER NULL,
        Description NVARCHAR(1000) NOT NULL,
        Status NVARCHAR(20) NOT NULL DEFAULT 'Pending',
        CONSTRAINT chk_maintenance_requests_status CHECK (Status IN ('Pending', 'InProgress', 'Completed','Canceled')),
        ReportedBy NVARCHAR(255) NOT NULL,
        ReportedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        CompletedAt DATETIME2 NULL,

        CONSTRAINT FK_MaintenanceRequests_Rooms FOREIGN KEY (RoomId) REFERENCES MeetingSchema.Rooms(Id),
        CONSTRAINT FK_MaintenanceRequests_Bookings FOREIGN KEY (BookingId) REFERENCES MeetingSchema.Bookings(Id)
    );

END
GO


IF NOT EXISTS (SELECT *
FROM sys.indexes
WHERE name = '
    IX_Bookings_RoomId_StartTime' AND object_id = OBJECT_ID('MeetingSchema.Bookings'))
BEGIN
    CREATE INDEX IX_Bookings_RoomId_StartTime ON MeetingSchema.Bookings(RoomId, StartTime, EndTime);
END

GO
IF NOT EXISTS (SELECT *
FROM sys.indexes
WHERE name = 'IX_Bookings_UserId' AND object_id = OBJECT_ID('MeetingSchema.Bookings'))
BEGIN
    CREATE INDEX IX_Bookings_UserId ON MeetingSchema.Bookings(UserId);
END

GO
IF NOT EXISTS (SELECT *
FROM sys.indexes
WHERE name = 'IX_MaintenanceRequests_RoomId_Status' AND object_id = OBJECT_ID('MeetingSchema.MaintenanceRequests'))
BEGIN
    CREATE INDEX IX_MaintenanceRequests_RoomId_Status ON MeetingSchema.MaintenanceRequests(RoomId, Status);
END

GO
IF NOT EXISTS (SELECT *
FROM sys.indexes
WHERE name = 'IX_BookingAttendees_BookingId' AND object_id = OBJECT_ID('MeetingSchema.BookingAttendees'))
BEGIN
    CREATE INDEX IX_BookingAttendees_BookingId ON MeetingSchema.BookingAttendees(BookingId);
END

GO




