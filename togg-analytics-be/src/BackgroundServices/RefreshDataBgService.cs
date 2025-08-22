using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite;
using NetTopologySuite.Geometries;
using togg_analytics_be.Models;
using togg_analytics_be.Services;

namespace togg_analytics_be.BackgroundServices;

public class RefreshDataBgService(
    IServiceProvider serviceProvider,
    TokenService tokenService
) : BackgroundService
{
    private readonly HttpClient _httpClient = new();

    private string[] _carPhotoUrls =
    [
        "https://iili.io/K91vtZQ.jpg",
        "https://iili.io/K91vbnV.jpg",
        "https://iili.io/K91vZwx.jpg"
    ];

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _httpClient.DefaultRequestHeaders.Add("x-app-build-number", "606");
        _httpClient.DefaultRequestHeaders.Add("accept", "text/plain");

        while (!stoppingToken.IsCancellationRequested)
            try
            {
                using var scope = serviceProvider.CreateScope();
                var appDbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                appDbContext.Database.AutoTransactionBehavior = AutoTransactionBehavior.Never;

                _httpClient.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", await tokenService.GetTokenAsync()
                    );

                var url =
                    $"https://tva-api.togg.cloud/info/api/v1/VehicleInfo?vin={Environment.GetEnvironmentVariable("Vin")}";
                var response = await _httpClient.GetAsync(url, stoppingToken);

                if (response.StatusCode == HttpStatusCode.Unauthorized)
                    throw new UnauthorizedAccessException();

                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync(stoppingToken);
                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;

                var vin = root.GetProperty("vin").GetString();
                // var year = root.GetProperty("year").GetString();

                var telemetry = root.GetProperty("telemetry");

                var odometerValue = telemetry.GetProperty("odometerStatus").GetProperty("odometerStatusContent")
                    .GetProperty("odometer").GetProperty("odometerValue").GetDouble();

                var batteryStateOfChargeValue = telemetry.GetProperty("battery").GetProperty("content")
                    .GetProperty("batteryStateOfCharge").GetProperty("batteryStateOfChargeValue").GetInt32();

                var estRange = telemetry.GetProperty("vehicleRange").GetProperty("content")
                    .GetProperty("estRange").GetProperty("range").GetInt32();

                var myTrip = root.GetProperty("lastTripInfo").GetProperty("myTrip");
                // var avgConsumptions = myTrip.GetProperty("avgConsumptions").GetInt32();
                // var avgSpeed = myTrip.GetProperty("avgSpeed").GetInt32();
                // var distance = myTrip.GetProperty("distance").GetInt32();
                // var hours = myTrip.GetProperty("duration").GetProperty("hours").GetInt32();
                // var minutes = myTrip.GetProperty("duration").GetProperty("minutes").GetInt32();

                var latitude = telemetry.GetProperty("location")
                    .GetProperty("content")
                    .GetProperty("latitude")
                    .GetProperty("latitudeValue").GetDouble();
                var longitude = telemetry.GetProperty("location")
                    .GetProperty("content")
                    .GetProperty("longitude")
                    .GetProperty("longitudeValue").GetDouble();

                var car = await appDbContext.Cars
                    .FirstOrDefaultAsync(c => c.Vin == vin, stoppingToken);

                if (car == null)
                {
                    Random.Shared.Shuffle(_carPhotoUrls);
                    car = new Car
                    {
                        Id = Guid.NewGuid(),
                        CreatedAt = DateTime.UtcNow,
                        Vin = vin,
                        Name = Environment.GetEnvironmentVariable("CarName") ?? "Togg T10X",
                        PhotoUrl = _carPhotoUrls.First(),
                        // Year = year,
                        BatteryStateOfChargeValue = batteryStateOfChargeValue,
                        EstRange = estRange,
                        OdometerValue = odometerValue
                    };
                    appDbContext.Cars.Add(car);
                }
                else
                {
                    car.BatteryStateOfChargeValue = batteryStateOfChargeValue;
                    car.EstRange = estRange;
                    car.OdometerValue = odometerValue;
                }

                // using var openStreetMapClient = new HttpClient();
                // openStreetMapClient.DefaultRequestHeaders.Add("User-Agent",
                //     "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36");
                //
                // var tripStartUrl =
                //     $"https://nominatim.openstreetmap.org/reverse?lat={_tripStart.Value.latitude.ToString("F6", CultureInfo.InvariantCulture)}&lon={_tripStart.Value.longitute.ToString("F6", CultureInfo.InvariantCulture)}&format=json";
                // var tripStartResponse = await openStreetMapClient.GetAsync(tripStartUrl, stoppingToken);
                // var tripStartJson = await tripStartResponse.Content.ReadAsStringAsync(stoppingToken);
                //
                // Console.WriteLine("Latitude: " + _tripStart.Value.latitude);
                // Console.WriteLine("Longitude: " + _tripStart.Value.longitute);
                // Console.WriteLine("Parsing trip start JSON: " + tripStartJson);
                //
                // using var tripStartDoc = JsonDocument.Parse(tripStartJson);
                // var tripStartRoot = tripStartDoc.RootElement;
                // var tripStartAddress = tripStartRoot.GetPropertySafe("address");
                // var tripStartLocation = $"{tripStartAddress.GetPropertySafe("town").GetStringSafe()}, " +
                //                         $"{tripStartAddress.GetPropertySafe("state").GetStringSafe()}, " +
                //                         $"{tripStartAddress.GetPropertySafe("country").GetStringSafe()}";
                //
                // var tripEndUrl =
                //     $"https://nominatim.openstreetmap.org/reverse?lat={latitude.ToString("F6", CultureInfo.InvariantCulture)}&lon={longitude.ToString("F6", CultureInfo.InvariantCulture)}&format=json";
                // var tripEndResponse = await openStreetMapClient.GetAsync(tripEndUrl, stoppingToken);
                // var tripEndJson = await tripEndResponse.Content.ReadAsStringAsync(stoppingToken);
                //
                // Console.WriteLine("Latitude: " + latitude);
                // Console.WriteLine("Longitude: " + longitude);
                // Console.WriteLine("Parsing trip start JSON: " + tripEndJson);
                //
                // using var tripEndDoc = JsonDocument.Parse(tripEndJson);
                // var tripEndRoot = tripEndDoc.RootElement;
                // var tripEndAddress = tripEndRoot.GetPropertySafe("address");
                // var tripEndLocation = $"{tripEndAddress.GetPropertySafe("town").GetStringSafe()}, " +
                //                       $"{tripEndAddress.GetPropertySafe("state").GetStringSafe()}, " +
                //                       $"{tripEndAddress.GetPropertySafe("country").GetStringSafe()}";

                // public class CarTripData
                // {
                //     public Guid Id { get; set; }
                //     public Guid CarId { get; set; }
                //     public DateTime CreatedAt { get; set; }
                //     public int AvgConsumptions { get; set; }
                //     public int AvgSpeed { get; set; }
                //     public int Distance { get; set; }
                //     public int DurationHours { get; set; }
                //     public int DurationMinutes { get; set; }
                // }

                var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(4326);
                var carTripData = new CarTripData
                {
                    Id = Guid.NewGuid(),
                    CarId = car.Id,
                    CreatedAt = DateTime.UtcNow,
                    // AvgConsumptions = avgConsumptions,
                    // AvgSpeed = avgSpeed,
                    // Distance = distance,
                    // DurationHours = hours,
                    // DurationMinutes = minutes,
                    Latitude = latitude,
                    Longitude = longitude,
                    Geom = geometryFactory.CreatePoint(new Coordinate(longitude, latitude))
                };

                if (IsValidCoordinate(latitude, longitude))
                {
                    appDbContext.CarTripData.Add(carTripData);
                }

                await appDbContext.SaveChangesAsync(stoppingToken);
            }
            catch (UnauthorizedAccessException)
            {
                Console.WriteLine("Token expired, fetching a new one...");
                await tokenService.ForceRefreshTokenAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex}");
            }
            finally
            {
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }
    }

    bool IsValidCoordinate(double lat, double lon) =>
        !double.IsNaN(lat) && !double.IsInfinity(lat) &&
        !double.IsNaN(lon) && !double.IsInfinity(lon) &&
        lat >= -90 && lat <= 90 &&
        lon >= -180 && lon <= 180;
}