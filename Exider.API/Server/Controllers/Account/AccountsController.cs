﻿using Exider.Core;
using Exider.Core.Dependencies.Repositories.Account;
using Exider.Core.Models.Account;
using Exider.Core.Models.Email;
using Exider.Core.TransferModels.Account;
using Exider.Dependencies.Services;
using Exider.Repositories.Account;
using Exider.Repositories.Email;
using Exider_Version_2._0._0.ServerApp.Services;
using Microsoft.AspNetCore.Mvc;
using System.Transactions;

namespace Exider_Version_2._0._0.Server.Controllers.Account
{

    [ApiController]
    [Route("[controller]")]
    public class AccountsController : ControllerBase
    {

        private readonly IUsersRepository _usersRepository;

        private readonly IEmailRepository _emailRepository;

        private readonly IConfirmationRespository _confirmationRespository;

        public AccountsController(IUsersRepository users, IEmailRepository email, IConfirmationRespository confirmation)
        {
            _usersRepository = users;
            _emailRepository = email;
            _confirmationRespository = confirmation;
        }

        [HttpGet("email/{email}")]
        public async Task<IActionResult> GetAccountByEmail(string email)
        {

            if (string.IsNullOrEmpty(email))
            {
                return BadRequest("Email required");
            }

            UserModel? userModel = await _usersRepository.GetUserByEmailAsync(email);

            if (userModel is null)
            {
                return StatusCode(470, "User not found");
            }

            return Ok(new PublicUserModel(userModel));

        }

        [HttpGet("nickname/{nickname}")]
        public async Task<IActionResult> GetAccountByNickname(string nickname)
        {

            if (string.IsNullOrEmpty(nickname))
            {
                return BadRequest("Nickname required");
            }

            UserModel? userModel = await _usersRepository.GetUserByNicknameAsync(nickname);

            if (userModel is null)
            {
                return StatusCode(470, "User not found");
            }

            return Ok(new PublicUserModel(userModel));

        }

        [HttpPost]
        public async Task<IActionResult> CreateAccount([FromBody] UserTransferModel user, IEmailService emailService, IEncryptionService encryptionService)
        {

            using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
            {

                var userCreationResult = UserModel.Create
                (
                    user.name,
                    user.surname,
                    user.nickname,
                    user.email,
                    user.password
                );

                if (userCreationResult.IsFailure)
                {
                    return BadRequest(userCreationResult.Error);
                }

                await _usersRepository.AddAsync(userCreationResult.Value);

                var emailCreationResult = EmailModel.Create
                (
                    userCreationResult.Value.Email,
                    false,
                    userCreationResult.Value.Id
                );

                if (emailCreationResult.IsFailure)
                {
                    return BadRequest(emailCreationResult.Error);
                }

                await _emailRepository.AddAsync(emailCreationResult.Value);

                var confirmationCreationResult = ConfirmationModel.Create
                (
                    userCreationResult.Value.Email,
                    encryptionService.GenerateSecretCode(6),
                    userCreationResult.Value.Id
                );

                if (confirmationCreationResult.IsFailure)
                {
                    return BadRequest(confirmationCreationResult.Error);
                }

                await _confirmationRespository.AddAsync(confirmationCreationResult.Value);

                await emailService.SendEmailConfirmation(userCreationResult.Value.Email, confirmationCreationResult.Value.Code,
                    Configuration.URL + "account/email/confirmation/" + confirmationCreationResult.Value.Link.ToString());

                scope.Complete();

                return Ok(confirmationCreationResult.Value.Link.ToString());

            }

        }

    }

}