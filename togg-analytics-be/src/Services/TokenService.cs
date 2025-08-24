using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Web;

namespace togg_analytics_be.Services;

public partial class TokenService
{
    private const string ClientId = "super-app";
    private const string RedirectUri = "superapp://prod/callback";

    private readonly string _password = Environment.GetEnvironmentVariable("Password")!;
    private readonly string _username = Environment.GetEnvironmentVariable("Username")!;
    private DateTime _expiresAt;

    private HttpClient _httpClient;
    private HttpClientHandler _httpHandler;
    private string? _token;

    public TokenService()
    {
        _httpHandler = new HttpClientHandler
        {
            AllowAutoRedirect = false,
            CookieContainer = new CookieContainer(),
            UseCookies = true
        };

        _httpClient = new HttpClient(_httpHandler);
    }

    public async Task<string> GetTokenAsync()
    {
        if (_token == null || DateTime.UtcNow >= _expiresAt)
            await RefreshTokenAsync();

        return _token!;
    }

    public async Task ForceRefreshTokenAsync()
    {
        _httpHandler = new HttpClientHandler
        {
            AllowAutoRedirect = false,
            CookieContainer = new CookieContainer(),
            UseCookies = true
        };

        _httpClient = new HttpClient(_httpHandler);

        await RefreshTokenAsync();
    }

    private async Task RefreshTokenAsync()
    {
        // 1. PKCE üret
        var codeVerifier = GenerateCodeVerifier();
        var codeChallenge = GenerateCodeChallenge(codeVerifier);

        // 2. Auth endpoint
        var authUrl =
            $"https://toggid.togg.cloud/auth/realms/toggid/protocol/openid-connect/auth" +
            $"?client_id={ClientId}" +
            $"&redirect_uri={HttpUtility.UrlEncode(RedirectUri)}" +
            $"&response_type=code" +
            $"&scope=openid" +
            $"&code_challenge={codeChallenge}" +
            $"&code_challenge_method=S256";

        var authResp = await _httpClient.GetAsync(authUrl);
        var authHtml = await authResp.Content.ReadAsStringAsync();

        var regex = UrlRegex();
        var match = regex.Match(authHtml);
        var loginUrl = match.Groups[1].Value.Replace("&amp;", "&");

        // 3. Kullanıcı adı/şifre POST et
        var loginData = new FormUrlEncodedContent([
            new KeyValuePair<string, string>("username", _username),
            new KeyValuePair<string, string>("password", _password),
            new KeyValuePair<string, string>("credentialId", "")
        ]);

        var loginResp = await _httpClient.PostAsync(loginUrl, loginData);
        if (loginResp.StatusCode != HttpStatusCode.Redirect)
            throw new Exception("Login başarısız!");

        // 4. Redirect URL’den code al
        var location = loginResp.Headers.Location!.ToString();
        var query = HttpUtility.ParseQueryString(new Uri(location).Query);
        var code = query["code"];
        if (string.IsNullOrEmpty(code))
            throw new Exception("Authorization code bulunamadı!");

        // 5. Token isteği
        var tokenReq = new FormUrlEncodedContent(new[]
        {
            new KeyValuePair<string, string>("grant_type", "authorization_code"),
            new KeyValuePair<string, string>("code", code),
            new KeyValuePair<string, string>("redirect_uri", RedirectUri),
            new KeyValuePair<string, string>("code_verifier", codeVerifier),
            new KeyValuePair<string, string>("client_id", ClientId)
        });

        var tokenResp = await _httpClient.PostAsync(
            "https://toggid.togg.cloud/auth/realms/toggid/protocol/openid-connect/token",
            tokenReq
        );

        tokenResp.EnsureSuccessStatusCode();

        var content = await tokenResp.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(content);
        _token = doc.RootElement.GetProperty("access_token").GetString();
        var expiresIn = doc.RootElement.GetProperty("expires_in").GetInt32();
        _expiresAt = DateTime.UtcNow.AddSeconds(expiresIn - 30);
    }

    private static string GenerateCodeVerifier()
    {
        var bytes = new byte[32];
        RandomNumberGenerator.Fill(bytes);
        return Base64UrlEncode(bytes);
    }

    private static string GenerateCodeChallenge(string verifier)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(verifier));
        return Base64UrlEncode(bytes);
    }

    private static string Base64UrlEncode(byte[] input)
    {
        return Convert.ToBase64String(input)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }

    [GeneratedRegex("\"loginAction\":\\s*\"(https?://[^\"]+)\"", RegexOptions.Compiled)]
    private static partial Regex UrlRegex();
}