using API.Dtos.Booking;
using API.Dtos.Google;

namespace API.Interfaces;

public interface IGoogleCalendarService
{
    string GetAuthCode();
    Task<GoogleCalendarResDto> GetTokens(string code);
    public Task<string> AddToGoogleCalendar(BookingDto bookingDto, string refreshToken);
    public Task<GoogleUserInfoDto> GetUserInfo(string accessToken);

}