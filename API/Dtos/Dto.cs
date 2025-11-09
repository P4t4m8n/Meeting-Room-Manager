namespace API.Dtos;

using API.Interfaces;

public abstract class Dto : IId, IDates
{
    public Guid? Id { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}