using API.Dtos.Cloudinary;
using API.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace API.Services
{
    public class CloudinaryService : ICloudinaryService
    {
        private readonly IConfiguration _config;
        private readonly Account _account;
        private readonly Cloudinary _cloudinary;

        public CloudinaryService(IConfiguration config)
        {
            _config = config;
            _account = new Account(
                _config["Cloudinary:CloudName"]!,
                _config["Cloudinary:ApiKey"]!,
                _config["Cloudinary:ApiSecret"]!
            );
            _cloudinary = new Cloudinary(_account);
            _cloudinary.Api.Secure = true;
        }

        public async Task<CloudinaryResDTO> UploadImage(IFormFile? image)
        {
            if (image == null || image.Length == 0)
                throw new ArgumentException("Image file is required");

            ImageUploadParams uploadParams = new()
            {
                File = new FileDescription(image.FileName, image.OpenReadStream()),
                UploadPreset = _config["Cloudinary:UploadPreset"]
            };

            ImageUploadResult uploadResult = await _cloudinary.UploadAsync(uploadParams);
            CloudinaryResDTO resDTO = new()
            {
                PublicId = uploadResult.PublicId,
                Url = uploadResult.Url?.ToString(),
                SecureUrl = uploadResult.SecureUrl?.ToString(),
                AssetId = uploadResult.AssetId
            };

            return resDTO;
        }

    }
}