using System.Security.Claims;
using System.Security.Cryptography;
using API.Dtos.User;
using API.Dtos.Auth;
using API.Services;
using API.Interfaces;
using API.Models;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using API.Enums;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {

        private readonly IDataContext _contextDapper;
        private readonly AuthService _authService;

        public AuthController(IDataContext contextDapper, AuthService authService)
        {
            _contextDapper = contextDapper;
            _authService = authService;
        }

        [AllowAnonymous]
        [HttpPost("Sign-in")]
        public async Task<ActionResult<UserDto>> SignIn(AuthSignInDto signInDto)
        {

            if (string.IsNullOrEmpty(signInDto.Email) || string.IsNullOrEmpty(signInDto.Password))
            {
                return BadRequest(new { message = "Email and password are required" });
            }

            string sqlForHash = "EXEC MeetingSchema.usp_Users_GetPasswordHashSalt @Email=@Email";

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@Email", signInDto.Email);

            AuthConfirmationDto? authConfirmation = await _contextDapper.LoadDataSingle<AuthConfirmationDto>(sqlForHash, parameters);

            if (authConfirmation == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            byte[] passwordHash = _authService.GetPasswordHash(signInDto.Password, authConfirmation.PasswordSalt);

            for (int i = 0; i < passwordHash.Length; i++)
            {
                if (passwordHash[i] != authConfirmation.PasswordHash[i])
                {
                    return Unauthorized(new { message = "Invalid email or password" });
                }
            }

            string userSelectSql = "EXEC MeetingSchema.usp_Users_GetUserDetails @Email=@Email";
            User? user = await _contextDapper.LoadDataSingle<User>(userSelectSql, parameters);

            if (user == null || user.Id == Guid.Empty)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            string token = _authService.CreateToken(user.Id.ToString()!);

            Response.Cookies.Append("AuthToken", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTimeOffset.UtcNow.AddDays(1)
            });

            UserDto userDto = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Role = user.Role
            };

            return Ok(userDto);
        }

        [AllowAnonymous]
        [HttpPost("Sign-up")]
        public async Task<ActionResult<UserDto>> SignUp(AuthSignUpDto signUpDto)
        {

            if (signUpDto.Password != signUpDto.ConfirmPassword)
            {
                return BadRequest(new { message = "Passwords do not match" });
            }

            string selectExistingUserSql = "EXEC MeetingSchema.usp_Users_Exists @Email=@Email";
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@Email", signUpDto.Email);

            IEnumerable<string> existingUser = await _contextDapper.LoadData<string>(selectExistingUserSql, parameters);
            if (existingUser.Any())
            {
                return BadRequest(new { message = "Bad credentials" });
            }

            byte[] PasswordSalt = new byte[128 / 8];
            using (RandomNumberGenerator rng = RandomNumberGenerator.Create())
            {
                rng.GetNonZeroBytes(PasswordSalt);
            }

            byte[] passwordHash = _authService.GetPasswordHash(signUpDto.Password!, PasswordSalt);

            string sqlInsertAuth = @"EXEC MeetingSchema.usp_Users_Create 
                                      @Email=@Email, 
                                      @Name=@Name,
                                      @PasswordHash=@PasswordHash, 
                                      @PasswordSalt=@PasswordSalt, 
                                      @Role=@Role";

            parameters.Add(@"Name", signUpDto.Name);
            parameters.Add(@"PasswordHash", passwordHash);
            parameters.Add(@"PasswordSalt", PasswordSalt);
            parameters.Add(@"Role", UserRole.User.ToString());



            User? user = await _contextDapper.InsertAndReturn<User>(sqlInsertAuth, parameters);


            if (user == null || user.Id == Guid.Empty)
            {

                return StatusCode(500, new { message = "Server error" });
            }

            string token = _authService.CreateToken(user.Id.ToString()!);

            Response.Cookies.Append("AuthToken", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // Only send over HTTPS
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(1)
            });

            UserDto userDto = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Role = user.Role
            };

            return Ok(userDto);
        }

        [HttpGet("Check-session")]
        public async Task<ActionResult<UserDto>> CheckSession()
        {
            string userId = User.FindFirstValue("userId") ?? "";

            if (string.IsNullOrEmpty(userId))
            {
                return NotFound(null);
            }

            string userIdSelectSql = "EXEC MeetingSchema.usp_Users_GetUserDetails @Id=@Id";
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@Id", Guid.Parse(userId));

            User? user = await _contextDapper.LoadDataSingle<User>(userIdSelectSql, parameters);

            if (user == null || user.Id == Guid.Empty)
            {
                return NotFound(null);
            }

            UserDto userDto = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Role = user.Role
            };

            return Ok(userDto);
        }
        [HttpGet("Refresh-token")]
        public async Task<ActionResult<UserDto>> RefreshToken()
        {
            string userId = User.FindFirstValue("userId") ?? "";

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated");
            }

            string userIdSelectSql = "EXEC MeetingSchema.usp_Users_GetUserDetails @Id=@Id";
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@Id", Guid.Parse(userId));
            User? user = await _contextDapper.LoadDataSingle<User>(userIdSelectSql, parameters);

            if (user == null || user.Id == Guid.Empty)
            {
                return NotFound("User not found");
            }

            string token = _authService.CreateToken(user.Id.ToString());

            Response.Cookies.Append("AuthToken", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // Only send over HTTPS
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(1)
            });



            UserDto userDto = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Role = user.Role
            };

            return Ok(userDto);
        }

        [HttpPost("Sign-out")]
        public new ActionResult SignOut()
        {
            Response.Cookies.Delete("AuthToken");

            return Ok();
        }

    }
}