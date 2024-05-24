﻿using CSharpFunctionalExtensions;
using Exider.Core.Models.Access;
using Exider.Services.External.FileService;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Exider.Core.Models.Albums
{
    public class AlbumModel : AccessItemBase
    {
        [Column("name")] public string Name { get; private set; } = "Not set";
        [Column("description")] public string? Description { get; private set; } = string.Empty;
        [Column("cover")] public string Cover { get; private set; } = Configuration.DefaultAlbumCoverPath;
        [Column("creation_time")] public DateTime CreationTime { get; private set; }
        [Column("last_edit_time")] public DateTime LastEditTime { get; private set; }
        [Column("type")] public string TypeId { get; private set; } = Configuration.AlbumTypes.Album.ToString();

        /// <summary>
        /// Нарушение инкапсуляции обусловлено бизнес-требованиями
        /// и необходиомстью использовать дженерики
        /// </summary>
        public AlbumModel() { }

        [NotMapped]
        [EnumDataType(typeof(Configuration.AlbumTypes))]
        public Configuration.AlbumTypes Type
        {
            get => Enum.Parse<Configuration.AlbumTypes>(TypeId);
            set => AccessId = value.ToString();
        }

        public static Result<AlbumModel> Create
        (
            string name,
            string? description,
            DateTime creationTime,
            DateTime lastEditTime,
            Guid ownerId,
            Configuration.AlbumTypes type,
            Configuration.AccessTypes access
        )
        {
            Guid id = Guid.NewGuid();

            return new AlbumModel()
            {
                Id = id,
                Name = name,
                Description = description,
                Cover = Configuration.SystemDrive + "__albums__/" + id.ToString(),
                CreationTime = creationTime,
                LastEditTime = lastEditTime,
                OwnerId = ownerId,
                Access = access,
                Type = type
            };
        }

        public async Task<Result> SetCover(IImageService imageService)
        {
            var result = await imageService.ReadImageAsBase64(Cover);

            if (result.IsFailure)
            {
                return Result.Failure(result.Error);
            }

            if (result.Value == null || result.Value.Length < 1)
            {
                Cover = Configuration.DefaultAlbumCover;
                return Result.Success();
            }

            Cover = result.Value;
            return Result.Success();
        }

        public void Update(string? name, string? description)
        {
            if (string.IsNullOrEmpty(name) == false && string.IsNullOrWhiteSpace(name) == false)
            {
                Name = name;
            }

            Description = description;
        }
    }
}