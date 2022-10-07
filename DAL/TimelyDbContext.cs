using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Timely.Models;

namespace Timely.DAL {
    public class TimelyDbContext : DbContext {

        public TimelyDbContext(DbContextOptions options) : base(options) {

        }

        public DbSet<Project> Projects { get; set; }
    }
}
