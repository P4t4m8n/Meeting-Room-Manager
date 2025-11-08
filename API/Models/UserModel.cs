namespace API.Models
{
    public class User : Model
    {
        public required string Email { get; set; }
        public required string Name { get; set; }
        public string Role { get; set; } = "User";
    }
}