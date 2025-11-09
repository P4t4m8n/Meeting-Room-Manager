using System.Text.Json.Serialization;

namespace API.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]

public enum MaintenanceRequestsStatus
{
    Pending,
    InProgress,
    Completed,
    Canceled
}