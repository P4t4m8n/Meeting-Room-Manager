using API.Dtos.Cloudinary;

namespace API.Interfaces
{
    public interface ICloudinaryService
    {
        public Task<CloudinaryResDTO> UploadImage(IFormFile? image);
    }
}