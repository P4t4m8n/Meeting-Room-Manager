
namespace API.Dtos.Auth;

public class AuthSignUpDto : AuthSignInDto
{
    public required string Name { get; set; }
    public string? ConfirmPassword { get; set; }
    public string? GoogleId { get; set; }


}
