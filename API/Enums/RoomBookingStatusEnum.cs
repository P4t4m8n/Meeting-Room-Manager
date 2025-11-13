using System.Text.Json.Serialization;

namespace API.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]

public enum RoomBookingStatus
{
    Active,
    Cancelled,
    Completed,
    Pending
}