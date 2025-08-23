using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Web;

namespace togg_analytics_be.Services
{
    public class TokenService
    {
        private readonly HttpClient _httpClient;
        private readonly HttpClientHandler _httpHandler;
        private DateTime _expiresAt;
        private string? _token;

        private readonly string _clientId = "super-app";
        private readonly string _redirectUri = "superapp://prod/callback";
        private readonly string _username = Environment.GetEnvironmentVariable("Username")!;
        private readonly string _password = Environment.GetEnvironmentVariable("Password")!;

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
                $"?client_id={_clientId}" +
                $"&redirect_uri={HttpUtility.UrlEncode(_redirectUri)}" +
                $"&response_type=code" +
                $"&scope=openid" +
                $"&code_challenge={codeChallenge}" +
                $"&code_challenge_method=S256";

            var authResp = await _httpClient.GetAsync(authUrl);
            var authHtml = await authResp.Content.ReadAsStringAsync();

            var regex = new Regex("\"loginAction\":\\s*\"(https?://[^\"]+)\"");
            var match = regex.Match(authHtml);
            var loginUrl = match.Groups[1].Value.Replace("&amp;", "&");

            // 3. Kullanıcı adı/şifre POST et
            var loginData = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string,string>("username", _username),
                new KeyValuePair<string,string>("password", _password),
                new KeyValuePair<string,string>("credentialId", "")
            });

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
                new KeyValuePair<string,string>("grant_type", "authorization_code"),
                new KeyValuePair<string,string>("code", code),
                new KeyValuePair<string,string>("redirect_uri", _redirectUri),
                new KeyValuePair<string,string>("code_verifier", codeVerifier),
                new KeyValuePair<string,string>("client_id", _clientId)
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
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(verifier));
            return Base64UrlEncode(bytes);
        }

        private static string Base64UrlEncode(byte[] input) =>
            Convert.ToBase64String(input)
                .TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');
    }
}
