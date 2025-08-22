using System.Text.Json;

namespace togg_analytics_be.Extensions;

public static class JsonExtensions
{
    public static JsonElement GetPropertySafe(this JsonElement elem, string propertyName)
    {
        try
        {
            return elem.GetProperty(propertyName);
        }
        catch
        {
            return default;
        }
    }

    public static string? GetStringSafe(this JsonElement elem)
    {
        try
        {
            return elem.GetString();
        }
        catch
        {
            return null;
        }
    }
}