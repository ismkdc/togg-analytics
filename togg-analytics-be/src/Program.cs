using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using togg_analytics_be.BackgroundServices;
using togg_analytics_be.Models;
using togg_analytics_be.Models.DTO;
using togg_analytics_be.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<TokenService>();
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(
        builder.Configuration["AppDbConnectionString"],
        o => o.UseNetTopologySuite()
    )
);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddHostedService<RefreshDataBgService>();

var app = builder.Build();

app.UseCors("AllowLocalhost");

await EnsureDbCreated();

app.MapGet("/", () => "Togg Analytics Service is running...");

app.MapGet("/api/vehicles", async (AppDbContext dbContext) =>
{
    var vehicles = await dbContext
        .Cars
        .AsNoTracking()
        .ToListAsync();

    return Results.Ok(vehicles);
});

app.MapGet("/api/vehicles/{id:guid}/trip-data", async (
    Guid id,
    AppDbContext dbContext,
    [FromQuery] ReportType type
) =>
{
    var fromDate = type switch
    {
        ReportType.Daily => DateTime.UtcNow.AddDays(-1),
        ReportType.Weekly => DateTime.UtcNow.AddDays(-7),
        ReportType.Monthly => DateTime.UtcNow.AddDays(-30),
        _ => DateTime.UtcNow.AddDays(-1)
    };

    const string sql = """
                           WITH ordered AS (
                               SELECT
                                   "CarId",
                                   "CreatedAt",
                                   "Latitude",
                                   "Longitude",
                                   "Geom",
                                   LAG("Geom") OVER (PARTITION BY "CarId" ORDER BY "CreatedAt") AS prev_geom
                               FROM "CarTripData"
                           )
                           SELECT
                               "CarId",
                               "CreatedAt",
                               "Latitude",
                               "Longitude",
                               CASE 
                                   WHEN prev_geom IS NULL THEN NULL
                                   ELSE ST_DistanceSphere("Geom", prev_geom)
                               END AS MovedMeters
                           FROM ordered
                           WHERE "CarId" = {0}
                             AND "CreatedAt" >= {1}
                             AND (prev_geom IS NULL
                                  OR (NOT ST_Equals("Geom", prev_geom) AND ST_DistanceSphere("Geom", prev_geom) >= 1000))
                           ORDER BY "CarId", "CreatedAt";
                       """;

    var result = await dbContext
        .Database
        .SqlQueryRaw<CarTripOutput>(sql, id, fromDate)
        .ToListAsync();

    return Results.Ok(result);
});

app.Run();

async Task EnsureDbCreated()
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope
        .ServiceProvider
        .GetRequiredService<AppDbContext>();

    await dbContext.Database.EnsureCreatedAsync();
    await dbContext.Database.ExecuteSqlRawAsync("CREATE EXTENSION IF NOT EXISTS postgis");
}