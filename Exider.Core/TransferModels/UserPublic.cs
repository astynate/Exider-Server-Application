﻿namespace Exider.Core.TransferModels.Account
{
    public record class UserPublic
    {
        public string? Name { get; init; }
        public string? Surname { get; init; }
        public string? Nickname { get; init; }
        public string? Email { get; init; }
        public string? Avatar { get; set; }
        public string? Header { get; set; }
        public string? Description { get; init; }
        public double StorageSpace { get; init; }
        public decimal Balance { get; init; }
        public uint FriendCount { get; init; }
    }
}
