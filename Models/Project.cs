using System;

namespace Timely.Models {
    public class Project {

        public int? Id { get; set; }
        public string Name { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int Duration { get; set; }
        
        //constructor for reading/updating the database
        public Project(int id, string name, DateTime startTime, DateTime endTime, int duration) {
            Id = id;
            Name = name;
            StartTime = startTime;
            EndTime = endTime;
            Duration = duration;
        }

        //constructor for adding a new project to DB
        public Project(string name, DateTime startTime, DateTime endTime, int duration) {
            Name = name;
            StartTime = startTime;
            EndTime = endTime;
            Duration = duration;
        }

        //constructor for deleting from the database
        public Project(int id) {
            Id = id;
        }
    }
}
