using Microsoft.EntityFrameworkCore;
using Timely.Models;

namespace Timely.DAL {
    public class TimelyDbContext : DbContext {

        public TimelyDbContext(DbContextOptions options) : base(options) {

        }

        public DbSet<Project> Projects { get; set; }

    }
}
