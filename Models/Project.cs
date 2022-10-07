using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Timely.Models {
    public class Project {

        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Description { get; set; }

        public Project(int id, string name, DateTime startTime, DateTime endTime, string description) {
            Id = id;
            Name = name;
            StartTime = startTime;
            EndTime = endTime;
            Description = description;
        }
    }
}
