using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Data.SqlClient;
using Timely.DAL;

namespace Timely.Controllers {
    [Route("api/[controller]/{action}/{id?}")]
    [ApiController]
    public class ProjectsController : ControllerBase {

        private readonly TimelyDbContext _context;


        private readonly IConfiguration _configuration;

        public ProjectsController(IConfiguration configuration, TimelyDbContext context) {
            _configuration = configuration;
            _context = context;
        }

        [HttpGet]
        public JsonResult Get() {

            return new JsonResult(_context.Projects);

        }

    }
}
