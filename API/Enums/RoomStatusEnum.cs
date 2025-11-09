using System.Text.Json.Serialization;

namespace API.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum RoomStatus
{
    Active,
    Inactive,
    Maintenance
}