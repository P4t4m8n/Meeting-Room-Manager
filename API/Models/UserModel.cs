using API.Enums;

namespace API.Models
{
    public class User : Model
    {
        public required string Email { get; set; }
        public required string Name { get; set; }
        public required byte[] PasswordHash { get; set; }
        public required byte[] PasswordSalt { get; set; }
        public required UserRole Role { get; set; }
    }
}