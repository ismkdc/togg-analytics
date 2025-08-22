using System.Text.Json;

namespace togg_analytics_be.Services;

public class TokenService(IConfiguration configuration)
{
    private readonly HttpClient _httpClient = new();
    private DateTime _expiresAt;
    private string? _token;

    public async Task<string> GetTokenAsync()
    {
        if (_token == null || DateTime.UtcNow >= _expiresAt)
            await RefreshTokenAsync();

        return _token!;
    }

    public async Task ForceRefreshTokenAsync()
    {
        await RefreshTokenAsync();
    }

    private async Task RefreshTokenAsync()
    {
        var request = new HttpRequestMessage(HttpMethod.Post,
            "https://toggid.togg.cloud/auth/realms/toggid/protocol/openid-connect/token");

        var formData = new[]
        {
            new KeyValuePair<string, string>("grant_type", "password"),
            new KeyValuePair<string, string>("client_id", "super-app"),
            new KeyValuePair<string, string>("username", Environment.GetEnvironmentVariable("Username")),
            new KeyValuePair<string, string>("password", Environment.GetEnvironmentVariable("Password"))
        };

        request.Content = new FormUrlEncodedContent(formData);

        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(content);
        _token = doc.RootElement.GetProperty("access_token").GetString();
        var expiresIn = doc.RootElement.GetProperty("expires_in").GetInt32();
        _expiresAt = DateTime.UtcNow.AddSeconds(expiresIn - 30);
    }
}