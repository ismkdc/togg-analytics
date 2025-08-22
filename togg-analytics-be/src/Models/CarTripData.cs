using NetTopologySuite.Geometries;

namespace togg_analytics_be.Models;

public class CarTripData
{
    public Guid Id { get; set; }
    public Guid CarId { get; set; }
    public DateTime CreatedAt { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public Point Geom { get; set; }
}