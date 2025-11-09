
namespace API.Dtos.Auth;

public class AuthSignUpDto : AuthSignInDto
{
    public required string Name { get; set; }
    public required string ConfirmPassword { get; set; }


}
