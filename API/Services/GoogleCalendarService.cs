using System.Text;
using API.Dtos.Booking;
using API.Dtos.Google;
using API.Interfaces;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Calendar.v3;
using Google.Apis.Calendar.v3.Data;
using Google.Apis.Services;
namespace API.Services
{
    public class GoogleCalendarService : IGoogleCalendarService
    {

        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;


        public GoogleCalendarService(IConfiguration config)
        {
            _httpClient = new HttpClient();
            _config = config;
        }

        public string GetAuthCode()
        {
            try
            {

                string scopeURL1 = "https://accounts.google.com/o/oauth2/auth?redirect_uri={0}&prompt={1}&response_type={2}&client_id={3}&scope={4}&access_type={5}";
                var redirectURL = _config["Google:RedirectUri"] ?? "";
                string prompt = "consent";
                string response_type = "code";
                string clientID = _config["Google:ClientId"] ?? "";
                string scope = "https://www.googleapis.com/auth/calendar openid profile email";
                string access_type = "offline";
                string redirect_uri_encode = _UrlEncodeForGoogle(redirectURL);
                var mainURL = string.Format(scopeURL1, redirect_uri_encode, prompt, response_type, clientID, scope, access_type);

                return mainURL;
            }
            catch (Exception ex)
            {
                return ex.ToString();
            }
        }
        public async Task<GoogleUserInfoDto> GetUserInfo(string accessToken)
        {
            var request = new HttpRequestMessage(HttpMethod.Get, "https://www.googleapis.com/oauth2/v2/userinfo");
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

            var response = await _httpClient.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                return Newtonsoft.Json.JsonConvert.DeserializeObject<GoogleUserInfoDto>(content)!;
            }
            else
            {
                throw new Exception($"Failed to fetch user info: {response.StatusCode}");
            }
        }
        public async Task<GoogleCalendarResDto> GetTokens(string code)
        {

            var clientId = _config["Google:ClientId"] ?? "";
            string clientSecret = _config["Google:ClientSecret"] ?? "";
            var redirectURL = _config["Google:RedirectUri"] ?? "";
            var tokenEndpoint = "https://accounts.google.com/o/oauth2/token";
            var content = new StringContent($"code={code}&redirect_uri={Uri.EscapeDataString(redirectURL)}&client_id={clientId}&client_secret={clientSecret}&grant_type=authorization_code", Encoding.UTF8, "application/x-www-form-urlencoded");

            var response = await _httpClient.PostAsync(tokenEndpoint, content);
            var responseContent = await response.Content.ReadAsStringAsync();
            if (response.IsSuccessStatusCode)
            {
                var tokenResponse = Newtonsoft.Json.JsonConvert.DeserializeObject<GoogleCalendarResDto>(responseContent);
                if (tokenResponse == null)
                {
                    throw new Exception("Failed to deserialize token response.");
                }
                return tokenResponse;
            }
            else
            {
                throw new Exception($"Failed to authenticate: {responseContent}");
            }
        }

        public async Task<string> AddToGoogleCalendar(BookingDto bookingDto, string refreshToken)
        {
            try
            {
                var token = new TokenResponse
                {
                    RefreshToken = refreshToken
                };

                var flow = new GoogleAuthorizationCodeFlow(
                    new GoogleAuthorizationCodeFlow.Initializer
                    {
                        ClientSecrets = new ClientSecrets
                        {
                            ClientId = _config["Google:ClientId"] ?? "",
                            ClientSecret = _config["Google:ClientSecret"] ?? ""
                        }
                    });

                var credentials = new UserCredential(flow, "user", token);

                var accessToken = await credentials.GetAccessTokenForRequestAsync();

                if (string.IsNullOrEmpty(accessToken))
                {
                    throw new Exception("Failed to obtain access token from refresh token");
                }

                var service = new CalendarService(new BaseClientService.Initializer()
                {
                    HttpClientInitializer = credentials,
                    ApplicationName = "Meeting Room Manager"
                });

                Event newEvent = new()
                {
                    Summary = bookingDto.Summary ?? "Meeting Room Booking",
                    Description = bookingDto.Description ?? $"Room: {bookingDto.Room?.Name ?? "N/A"}\nBooking from {bookingDto.StartTime:g} to {bookingDto.EndTime:g}",
                    Attendees = bookingDto.Attendees?.Select(a => new EventAttendee()
                    {
                        Email = a.Email,
                        DisplayName = a.Name
                    }).ToList(),

                    Start = new EventDateTime()
                    {
                        DateTimeDateTimeOffset = bookingDto.StartTime,
                        TimeZone = "UTC"
                    },
                    End = new EventDateTime()
                    {
                        DateTimeDateTimeOffset = bookingDto.EndTime,
                        TimeZone = "UTC"
                    },
                    Reminders = new Event.RemindersData()
                    {
                        UseDefault = false,
                        Overrides =
                        [
                    new EventReminder() { Method = "email", Minutes = 30 },
                    new EventReminder() { Method = "popup", Minutes = 15 },
                    new EventReminder() { Method = "popup", Minutes = 1 }
                ]
                    }
                };

                EventsResource.InsertRequest insertRequest = service.Events.Insert(newEvent, "primary");
                insertRequest.SendNotifications = true;
                insertRequest.SendUpdates = EventsResource.InsertRequest.SendUpdatesEnum.All;

                Event createdEvent = await insertRequest.ExecuteAsync();
                return createdEvent.Id;
            }
            catch (Google.GoogleApiException gex)
            {
                Console.WriteLine($"Google API Error: {gex.Error?.Code} - {gex.Error?.Message}");
                Console.WriteLine($"Details: {gex.Message}");
                throw new Exception($"Failed to create Google Calendar event: {gex.Error?.Message ?? gex.Message}", gex);
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error creating calendar event: {e.Message}");
                throw;
            }
        }


        private static string _UrlEncodeForGoogle(string url)
        {
            string unreservedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.~";
            StringBuilder result = new();
            foreach (char symbol in url)
            {
                if (unreservedChars.Contains(symbol))
                {
                    result.Append(symbol);
                }
                else
                {
                    result.Append("%" + ((int)symbol).ToString("X2"));
                }
            }

            return result.ToString();

        }

    }


}