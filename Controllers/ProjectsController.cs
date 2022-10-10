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

            //if no id is sent, check for project via name
            if(i["Id"] == null) {

                var project = _context.Projects.FirstOrDefault(item => item.Name == i["Name"].ToString());

                //if project doesnt exist, create new, else, update on existing
                if (project == null) {

                    project = new Project(i["Name"].ToString(), DateTime.Parse(i["StartTime"].ToString()),
                        DateTime.Parse(i["EndTime"].ToString()), Int32.Parse(i["Duration"].ToString()));

                    _context.Projects.Add(project);

                } else {

                    //only change end time
                    project.EndTime = DateTime.Parse(i["EndTime"].ToString());
                    //increase duration
                    project.Duration = project.Duration + Int32.Parse(i["Duration"].ToString()); //in this case counter starts from 0, so duration needs to be added onto existing

                }
            //if id is sent, update via id
            } else {

                var project = _context.Projects.FirstOrDefault(item => item.Id == Int32.Parse(i["Id"].ToString()));
                //if project was deleted, return appropriate response
                if (project == null) {

                    return new HttpResponseMessage(System.Net.HttpStatusCode.NotFound);

                } else {

                    project.Name = i["Name"].ToString();
                    //only change end time
                    project.EndTime = DateTime.Parse(i["EndTime"].ToString());
                    //increase duration
                    project.Duration = Int32.Parse(i["Duration"].ToString());

                }

            }

            _context.SaveChanges();

            return new HttpResponseMessage(System.Net.HttpStatusCode.OK);

        }

        [HttpGet]
        public HttpResponseMessage Delete(int delId) {

            var project = new Project(delId);
            _context.Remove(project);
            _context.SaveChanges();

            return new HttpResponseMessage(System.Net.HttpStatusCode.OK);

        }

        [HttpGet]
        public JsonResult Refresh(int projectId) {

            var list = _context.Projects.OrderBy(p => p.Id)
                .Where(b => b.Id >= projectId)
                .Take(10)
                .ToList();

            return new JsonResult(list);

        }

    }
}
