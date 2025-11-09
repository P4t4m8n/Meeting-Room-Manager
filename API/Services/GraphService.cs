using API.Dtos.Booking;
using API.Interfaces;
using API.Models;
using Azure.Identity;
using Dapper;
using Microsoft.Graph;
using Microsoft.Graph.Models;

namespace API.Services
{
    public class GraphService
    {
        private readonly IDataContext _contextDapper;

        private readonly GraphServiceClient _graphServiceClient;

        public GraphService(IConfiguration configuration, IDataContext contextDapper)
        {
            _contextDapper = contextDapper;
            TokenCredentialOptions options = new TokenCredentialOptions
            {
                AuthorityHost = AzureAuthorityHosts.AzurePublicCloud
            };

            ClientSecretCredential clientSecretCredential = new ClientSecretCredential(
                configuration["MicrosoftGraph:TenantId"],
                configuration["MicrosoftGraph:ClientId"],
                configuration["MicrosoftGraph:ClientSecret"],
                options);

            _graphServiceClient = new GraphServiceClient(clientSecretCredential, ["https://graph.microsoft.com/.default"]);
        }

        public async Task<Event?> CreateEventAsync(
                            string userEmail,
                            string subject,
                            string? Body,
                            DateTime startTime,
                            DateTime endTime,
                            string? RoomName,
                            int? RoomFloor,
                            List<BookingAttendeeDto> attendees)
        {
            Event newEvent = new Event
            {
                Subject = subject,
                Body = new ItemBody
                {
                    ContentType = Body != null ? BodyType.Html : BodyType.Text,
                    Content = Body ?? string.Empty
                },
                Start = new DateTimeTimeZone
                {
                    DateTime = startTime.ToString("o"),
                    TimeZone = "UTC"
                },
                End = new DateTimeTimeZone
                {
                    DateTime = endTime.ToString("o"),
                    TimeZone = "UTC"
                },
                Location = new Location
                {
                    DisplayName = $"{RoomName} (Floor {RoomFloor})"
                },
                Attendees = [.. attendees.Select(a => new Attendee
                {
                    EmailAddress = new EmailAddress { Address = a.Email, Name = a.Name, },

                    Type = AttendeeType.Required
                })]
            };

            return await _graphServiceClient.Users[userEmail].Events.PostAsync(newEvent);
        }

        public async Task EmitEventAsync(string userId, BookingDto createdBooking)
        {
            string userEmailSql = "SELECT Email FROM MeetingSchema.Users WHERE Id = @UserId";
            DynamicParameters userEmailParams = new DynamicParameters();
            userEmailParams.Add("@UserId", Guid.Parse(userId));
            string? userEmail = await _contextDapper.LoadDataSingle<string>(userEmailSql, userEmailParams);

            if (!string.IsNullOrEmpty(userEmail))
            {
                var graphEvent = await CreateEventAsync(userEmail, "Meeting Room Booking", null, createdBooking.StartTime, createdBooking.EndTime,
                                                        createdBooking?.Room?.Name, createdBooking?.Room?.Floor, createdBooking?.Attendees!)
                                                        ?? throw new Exception("Failed to create graph event");

                string updateEventIdSql = "UPDATE MeetingSchema.Bookings SET CalendarEventId = @CalendarEventId WHERE Id = @BookingId";
                DynamicParameters updateParams = new DynamicParameters();
                updateParams.Add("@CalendarEventId", graphEvent.Id);
                updateParams.Add("@BookingId", createdBooking?.Id);
                await _contextDapper.ExecuteSql(updateEventIdSql, updateParams);
                createdBooking!.CalendarEventId = graphEvent?.Id;

            }
        }
    }
}
