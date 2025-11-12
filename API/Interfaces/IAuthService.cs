using API.Dtos.Auth;
using API.Dtos.Google;
using API.Dtos.User;
using Dapper;
using Microsoft.Extensions.Primitives;

namespace API.Interfaces
{
    public interface IAuthService
    {

        public byte[] GetPasswordHash(string password, byte[] salt);
        public string CreateToken(string userId);
        public Task<UserDto> CreateAuthUser(AuthSignUpDto signUpDto);
        public Task<AuthUserExistDto?> GetUserExist(DynamicParameters parameters);
        public Task<UserDto> GetOrCreateGoogleUser(GoogleUserInfoDto userInfo, DynamicParameters parameters, bool isUserExists, string refreshToken);
        public Task<AuthConfirmationDto?> GetPasswordHashAndSalt(DynamicParameters parameters);
        public Task<string> GetRefreshTokenAsync(Guid userId);

    }
}