namespace Marketplace_capstone_feature_01.Configurations
{
    public class EmailSettings
    {
        public string DisplayName { get; set; } = string.Empty;

        public string FromEmail { get; set; } = string.Empty;

        public string Host { get; set; } = string.Empty;

        public int Port { get; set; }

        public string Username { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public bool UseSsl { get; set; }
    }
}
