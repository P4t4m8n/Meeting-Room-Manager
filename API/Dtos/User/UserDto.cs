
using API.Enums;

namespace API.Dtos.User;

public class UserDto : Dto
{

    public required string Name { get; set; }
    public required string Email { get; set; }
    public required UserRole Role { get; set; }
}
