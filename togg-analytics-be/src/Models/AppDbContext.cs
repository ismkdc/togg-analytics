using Microsoft.EntityFrameworkCore;

namespace togg_analytics_be.Models;

public class AppDbContext(DbContextOptions options) : DbContext(options)
{
    public DbSet<CarTripData> CarTripData { get; set; }
    public DbSet<Car> Cars { get; set; }
}