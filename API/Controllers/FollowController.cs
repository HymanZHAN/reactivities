using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Followers;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class FollowController : BaseApiController
    {
        [HttpPost("{username}")]
        public async Task<IActionResult> Follow(string username)
        {
            var command = new FollowToggle.Command { TargetUsername = username };
            return HandleResult(await Mediator.Send(command));
        }

        [HttpGet("{username}")]
        public async Task<IActionResult> GetFollowings(string username, string predicate)
        {
            var query = new List.Query { Username = username, Predicate = predicate };
            return HandleResult(await Mediator.Send(query));
        }
    }
}