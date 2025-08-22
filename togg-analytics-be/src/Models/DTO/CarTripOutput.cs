namespace togg_analytics_be.Models.DTO;

public sealed record CarTripOutput(
    Guid CarId,
    DateTime CreatedAt,
    double Latitude,
    double Longitude,
    double? MovedMeters
);