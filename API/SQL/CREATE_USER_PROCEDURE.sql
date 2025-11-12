USE MeetingDB

GO

CREATE OR ALTER PROCEDURE MeetingSchema.usp_Users_GetPasswordHashSalt
    @Email NVARCHAR(100)
AS
BEGIN
    SELECT PasswordHash, PasswordSalt
    FROM MeetingSchema.Users
    WHERE Email = @Email;
END

GO

CREATE OR ALTER PROCEDURE MeetingSchema.usp_Users_GetUserDetails

    @Email NVARCHAR(100)=NULL,
    @Id UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SELECT Id, Name, Email, Role, CreatedAt, UpdatedAt
    FROM MeetingSchema.Users
    WHERE Email = @Email OR Id = @Id;

END
GO

CREATE OR ALTER PROCEDURE MeetingSchema.usp_Users_Exists
    @Email NVARCHAR(100)
AS
BEGIN
    SELECT Email
    FROM MeetingSchema.Users
    WHERE Email = @Email;
END

GO
CREATE OR ALTER PROCEDURE MeetingSchema.usp_Users_Exists_GoogleId
    @Email NVARCHAR(100)
AS
BEGIN
    SELECT Email, GoogleId
    FROM MeetingSchema.Users
    WHERE Email = @Email;
END

GO

CREATE OR ALTER PROCEDURE MeetingSchema.usp_Users_Create
    @Email NVARCHAR(100),
    @Name NVARCHAR(100)="User",
    @PasswordHash VARBINARY(MAX)=NULL,
    @PasswordSalt VARBINARY(MAX)=NULL,
    @GoogleId NVARCHAR(200) = NULL,
    @EncryptedRefreshToken NVARCHAR(500) = NULL,

    @Role NVARCHAR(20) = 'User'
AS
BEGIN
    INSERT INTO MeetingSchema.Users
        (Email, Name, PasswordHash, PasswordSalt, GoogleId, EncryptedRefreshToken, Role)
    OUTPUT
    INSERTED.Id,
    INSERTED.Email,
    INSERTED.Name,
    INSERTED.Role
    VALUES
        (@Email, @Name, @PasswordHash, @PasswordSalt, @GoogleId, @EncryptedRefreshToken, @Role);
END

GO

CREATE OR ALTER PROCEDURE MeetingSchema.usp_Users_GetRole
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Role
    FROM MeetingSchema.Users
    WHERE Id = @Id;
END
GO