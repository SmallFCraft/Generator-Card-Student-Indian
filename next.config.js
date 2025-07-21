/** @type {import('next').NextConfig} */
const nextConfig = {
  // Handle external packages
  serverExternalPackages: [],
  // Allow cross-origin requests from local network IPs during development
  allowedDevOrigins: [
    "192.168.101.10",
    "192.168.101.11", // Current server IP
    "192.168.1.*", // Common home network range
    "192.168.0.*", // Common router default range
    "10.0.0.*", // Private network range
    "172.16.*", // Private network range
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
  ],
  // Suppress hydration warnings for browser extensions
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error"],
          }
        : false,
  },
  // Handle cross-origin requests
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
