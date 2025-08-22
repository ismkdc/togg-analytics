namespace togg_analytics_be.Models;

public class Car
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string PhotoUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Vin { get; set; }
    public int BatteryStateOfChargeValue { get; set; }
    public int EstRange { get; set; }
    public double OdometerValue { get; set; }
}