using System.Security.Claims;
using API.Dtos.User;
using API.Dtos.Auth;
using API.Interfaces;
using API.Models;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using API.Dtos.Google;
using Microsoft.Extensions.Primitives;
using API.Dtos.Http;

namespace API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {

        private readonly IDataContext _contextDapper;
        private readonly IAuthService _authService;
        private readonly IGoogleCalendarService _googleCalendarService;
        private readonly IEncryptionService _encryptionService;

        public AuthController(IDataContext contextDapper, IAuthService authService, IGoogleCalendarService googleCalendarService, IEncryptionService encryptionService)
        {
            _contextDapper = contextDapper;
            _authService = authService;
            _googleCalendarService = googleCalendarService;
            _encryptionService = encryptionService;
        }

        [AllowAnonymous]
        [HttpPost("sign-in")]
        public async Task<ActionResult<UserDto>> SignIn(AuthSignInDto signInDto)
        {

            if (string.IsNullOrEmpty(signInDto.Email) || string.IsNullOrEmpty(signInDto.Password))
            {
                return BadRequest(new { message = "Email and password are required" });
            }


            DynamicParameters parameters = new();
            parameters.Add("@Email", signInDto.Email);

            AuthConfirmationDto? authConfirmation = await _authService.GetPasswordHashAndSalt(parameters);

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
            User? user = await _contextDapper.QuerySingleOrDefaultAsync<User>(userSelectSql, parameters);

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

            UserDto userDto = new()
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Role = user.Role
            };

            return Ok(userDto);
        }

        // [AllowAnonymous]
        // [HttpPost("sign-up")]
        // public async Task<ActionResult<UserDto>> SignUp(AuthSignUpDto signUpDto)
        // {

        //     if (signUpDto.Password != signUpDto.ConfirmPassword)
        //     {
        //         return BadRequest(new { message = "Passwords do not match" });
        //     }

        //     UserDto userDto = await _authService.CreateAuthUser(signUpDto);
        //     string token = _authService.CreateToken(userDto.Id.ToString()!);

        //     Response.Cookies.Append("AuthToken", token, new CookieOptions
        //     {
        //         HttpOnly = true,
        //         Secure = true, // Only send over HTTPS
        //         SameSite = SameSiteMode.Strict,
        //         Expires = DateTimeOffset.UtcNow.AddDays(1)
        //     });


        //     return Ok(userDto);
        // }

        [AllowAnonymous]
        [HttpGet]
        [Route("google")]
        public async Task<IActionResult> GoogleAuth()
        {
            return await Task.Run(() => Redirect(_googleCalendarService.GetAuthCode()));
        }


        [AllowAnonymous]
        [HttpGet]
        [Route("callback")]
        public async Task<IActionResult> Callback()
        {
            StringValues code = HttpContext.Request.Query["code"];
            if (string.IsNullOrEmpty(code))
            {
                return BadRequest(new { message = "Authorization code missing" });
            }

            GoogleCalendarResDto res = await _googleCalendarService.GetTokens(code!);
            GoogleUserInfoDto userInfo = await _googleCalendarService.GetUserInfo(res.Access_token!);

            DynamicParameters parameters = new();
            string email = userInfo.Email ?? "";
            parameters.Add("@Email", email);

            AuthUserExistDto? existingUser = await _authService.GetUserExist(parameters);

            if (existingUser != null && existingUser.GoogleId != null && existingUser.GoogleId != userInfo.Id)
            {
                return Redirect("http://localhost:5173/auth/");

            }

            UserDto? userDto;
            if (existingUser != null && existingUser.GoogleId == null)
            {
                string encryptedRefreshToken = _encryptionService.Encrypt(res.Refresh_token!);
                string updateSql = @"UPDATE MeetingSchema.Users 
                                     SET GoogleId=@GoogleId, EncryptedRefreshToken=@EncryptedRefreshToken 
                                     OUTPUT INSERTED.Id, INSERTED.Email, INSERTED.Name, INSERTED.Role
                                     WHERE Email=@Email";

                parameters.Add("@GoogleId", userInfo.Id);
                parameters.Add("@EncryptedRefreshToken", encryptedRefreshToken);

                userDto = await _contextDapper.QuerySingleOrDefaultAsync<UserDto>(updateSql, parameters);
            }
            else
            {
                userDto = await _authService.GetOrCreateGoogleUser(userInfo, parameters, existingUser != null, res.Refresh_token ?? "");
            }

            string token = _authService.CreateToken(userDto?.Id.ToString()!);

            Response.Cookies.Append("AuthToken", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // Only send over HTTPS
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(1)
            });


            return Redirect("http://localhost:5173/");
        }

        [HttpGet("check-session")]
        public async Task<ActionResult<UserDto>> CheckSession()
        {
            string userId = User.FindFirstValue("userId") ?? "";

            if (string.IsNullOrEmpty(userId))
            {
                return NotFound(new HttpErrorResponseDTO
                {
                    Message = "User not authenticated",
                    StatusCode = 401,
                    Errors = new Dictionary<string, string>
                    {
                        { "Authentication", "No valid authentication token found" }
                    }
                });
            }

            string userIdSelectSql = "EXEC MeetingSchema.usp_Users_GetUserDetails @Id=@Id";
            DynamicParameters parameters = new();
            parameters.Add("@Id", Guid.Parse(userId));

            User? user = await _contextDapper.QuerySingleOrDefaultAsync<User>(userIdSelectSql, parameters);

            if (user == null || user.Id == Guid.Empty)
            {
                return NotFound(
                    new HttpErrorResponseDTO
                    {
                        Message = "User not found",
                        StatusCode = 404,
                        Errors = new Dictionary<string, string>
                        {
                            { "User", "No user found for the given authentication token" }
                        }
                    }
                );
            }


            HttpResponseDTO<UserDto> response = new()
            {
                Data = new()
                {
                    Id = user.Id,
                    Email = user.Email,
                    Name = user.Name,
                    Role = user.Role
                },
                Message = "User is authenticated"
            };

            return Ok(response);
        }
        [HttpGet("refresh-token")]
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
            User? user = await _contextDapper.QuerySingleOrDefaultAsync<User>(userIdSelectSql, parameters);

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

        [HttpPost("sign-out")]
        public new ActionResult SignOut()
        {
            Response.Cookies.Delete("AuthToken");

            return Ok();
        }

    }
}