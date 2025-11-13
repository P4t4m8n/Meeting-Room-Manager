using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using API.Dtos.Auth;
using API.Dtos.Google;
using API.Dtos.User;
using API.Enums;
using API.Exceptions;
using API.Interfaces;
using API.Models;
using Dapper;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.IdentityModel.Tokens;

namespace API.Services
{
    public class AuthService : IAuthService
    {
        private readonly IConfiguration _config;
        private readonly IDataContext _contextDapper;
        private readonly IEncryptionService _encryptionService;

        public AuthService(IConfiguration config, IDataContext contextDapper, IEncryptionService encryptionService)
        {
            _config = config;
            _contextDapper = contextDapper;
            _encryptionService = encryptionService;
        }


        public byte[] GetPasswordHash(string password, byte[] salt)
        {


            return KeyDerivation.Pbkdf2(
                password: password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 1000000,
                numBytesRequested: 256 / 8
            );
        }

        public string CreateToken(string userId)
        {
            Claim[] claims = [new Claim("userId", userId)];

            string? tokenKeyString = _config.GetSection("AppSettings:TokenKey").Value;


            SymmetricSecurityKey tokenKey = new SymmetricSecurityKey
            (Encoding.UTF8.GetBytes(tokenKeyString ?? ""));

            SigningCredentials cred = new SigningCredentials
            (tokenKey, SecurityAlgorithms.HmacSha512Signature);

            SecurityTokenDescriptor desc = new SecurityTokenDescriptor()
            {
                Subject = new ClaimsIdentity(claims),
                SigningCredentials = cred,
                Expires = DateTime.Now.AddDays(1)


            };

            JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();

            SecurityToken token = tokenHandler.CreateToken(desc);

            return tokenHandler.WriteToken(token);
        }

        public async Task<UserDto> CreateAuthUser(AuthSignUpDto signUpDto)
        {

           await CheckUserExists(signUpDto.Email!);

            byte[] PasswordSalt = new byte[128 / 8];
            using (RandomNumberGenerator rng = RandomNumberGenerator.Create())
            {
                rng.GetNonZeroBytes(PasswordSalt);
            }

            byte[] passwordHash = GetPasswordHash(signUpDto.Password!, PasswordSalt);

            string sqlInsertAuth = @"EXEC MeetingSchema.usp_Users_Create 
                                      @Email=@Email, 
                                      @Name=@Name,
                                      @PasswordHash=@PasswordHash, 
                                      @PasswordSalt=@PasswordSalt, 
                                      @Role=@Role";
            DynamicParameters parameters = new();
            parameters.Add("@Email", signUpDto.Email);
            parameters.Add(@"Name", signUpDto.Name);
            parameters.Add(@"PasswordHash", passwordHash);
            parameters.Add(@"PasswordSalt", PasswordSalt);
            parameters.Add(@"Role", UserRole.User.ToString());



            User? user = await _contextDapper.InsertAndReturn<User>(sqlInsertAuth, parameters);
            if (user == null || user.Id == Guid.Empty)
            {
                throw new UserCreationFailedException("Failed to create user due to a server error.");
            }


            UserDto userDto = new()
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Role = user.Role
            };

            return userDto;
        }

        public async Task<AuthUserExistDto?> GetUserExist(DynamicParameters parameters)
        {
            string selectExistingUserSql = "EXEC MeetingSchema.usp_Users_Exists_GoogleId @Email=@Email";
            return await _contextDapper.QuerySingleOrDefaultAsync<AuthUserExistDto>(selectExistingUserSql, parameters);
        }

        public async Task<UserDto> GetOrCreateGoogleUser(GoogleUserInfoDto userInfo, DynamicParameters parameters, bool isUserExists, string refreshToken)
        {

            string sql = isUserExists
                ? "EXEC MeetingSchema.usp_Users_GetUserDetails @Email=@Email"
                : @"EXEC MeetingSchema.usp_Users_Create @Email=@Email, @Name=@Name, @GoogleId=@GoogleId,
                                                        @Role=@Role, @EncryptedRefreshToken=@EncryptedRefreshToken";

            if (!isUserExists)
            {
                string encryptedRefreshToken = _encryptionService.Encrypt(refreshToken ?? "");

                parameters.Add(@"EncryptedRefreshToken", encryptedRefreshToken);
                parameters.Add("@Name", userInfo.Name ?? "User");
                parameters.Add("@GoogleId", userInfo.Id ?? "");
                parameters.Add("@Role", UserRole.User.ToString());
            }

            User? user = await _contextDapper.QuerySingleOrDefaultAsync<User>(sql, parameters);

            if (user == null || user.Id == Guid.Empty)
            {
                throw new UserCreationFailedException("Failed to create or retrieve user.");
            }

            UserDto userDto = new()
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Role = user.Role
            };

            return userDto;
        }

        public async Task<AuthConfirmationDto?> GetPasswordHashAndSalt(DynamicParameters parameters)
        {
            string sqlForHash = "EXEC MeetingSchema.usp_Users_GetPasswordHashSalt @Email=@Email";
            return await _contextDapper.QuerySingleOrDefaultAsync<AuthConfirmationDto>(sqlForHash, parameters);
        }

        public async Task<string> GetRefreshTokenAsync(Guid userId)
        {

            string refreshTokenSQL = "SELECT EncryptedRefreshToken FROM MeetingSchema.Users WHERE Id = @UserId";
            DynamicParameters parameters = new();
            parameters.Add("@UserId", userId);

            string? encryptedRefreshToken = await _contextDapper.QuerySingleOrDefaultAsync<string>(refreshTokenSQL, parameters);
            if (string.IsNullOrEmpty(encryptedRefreshToken))
            {
                throw new Exception("User's Google refresh token not found");
            }
            return _encryptionService.Decrypt(encryptedRefreshToken);
        }

        private async Task CheckUserExists(string Email)
        {
            string selectExistingUserSql = "EXEC MeetingSchema.usp_Users_Exists @Email=@Email";
            DynamicParameters parameters = new();
            parameters.Add("@Email", Email);

            IEnumerable<string> existingUser = await _contextDapper.LoadData<string>(selectExistingUserSql, parameters);
            if (existingUser.Any())
            {
                throw new UserAlreadyExistsException("A user with this email already exists.");
            }

            return;
        }

    }
}