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
using Timely.Models;
using System.Net.Http;
using System.IO;
using Newtonsoft.Json;

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
        public JsonResult Get(int lastId) {

            var list = _context.Projects.OrderBy(p => p.Id)
                .Where(b => b.Id > lastId)
                .Take(10)
                .ToList();

            return new JsonResult(list);

        }

        [HttpGet]
        public JsonResult GetReversed(int lastId) {

            var list = _context.Projects
                .Where(b => b.Id < lastId)
                .OrderByDescending(p => p.Id)
                .Take(10)
                .ToList();

            return new JsonResult(list);

        }

        [HttpPost]
        public HttpResponseMessage Save() {

            var reader = new StreamReader(Request.Body);
            var body = reader.ReadToEnd();

            Newtonsoft.Json.Linq.JObject i = (Newtonsoft.Json.Linq.JObject) JsonConvert.DeserializeObject(body);


            var project = new Project( i["Name"].ToString(), DateTime.Parse(i["StartTime"].ToString()), DateTime.Parse(i["EndTime"].ToString()),
                Int32.Parse(i["Duration"].ToString()));

            _context.Projects.Add(project);
            _context.SaveChanges();

            return new HttpResponseMessage(System.Net.HttpStatusCode.OK);

        }

    }
}
