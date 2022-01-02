using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles
{
    public class ListActivities
    {
        public class Query : IRequest<Result<List<UserActivityDto>>>
        {
            public string Username { get; set; }
            public string Predicate { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<List<UserActivityDto>>>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IMapper mapper, IUserAccessor userAccessor)
            {
                _userAccessor = userAccessor;
                _mapper = mapper;
                _context = context;

            }

            public async Task<Result<List<UserActivityDto>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var activities = new List<UserActivityDto>();

                switch (request.Predicate)
                {
                    case "future":
                        activities = await _context.Activities
                            .Where(a => a.Date >= DateTime.Now)
                            .Where(a => a.Attendees.Any(x => x.AppUser.UserName == request.Username))
                            .ProjectTo<UserActivityDto>(_mapper.ConfigurationProvider)
                            .ToListAsync();
                        break;
                    case "past":
                        activities = await _context.Activities
                            .Where(a => a.Date < DateTime.Now)
                            .Where(a => a.Attendees.Any(x => x.AppUser.UserName == request.Username))
                            .ProjectTo<UserActivityDto>(_mapper.ConfigurationProvider)
                            .ToListAsync();
                        break;
                    case "hosting":
                        activities = await _context.Activities
                            .ProjectTo<UserActivityDto>(_mapper.ConfigurationProvider)
                            .Where(a => a.HostUsername == request.Username)
                            .ToListAsync();
                        break;
                }

                return Result<List<UserActivityDto>>.Success(activities);

            }
        }

    }
}