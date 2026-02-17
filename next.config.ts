import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5001/api/:path*', // Proxy to Backend
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:5001/uploads/:path*', // Proxy to Static Files
      },
      {
        source: '/public/uploads/:path*',
        destination: 'http://localhost:5001/uploads/:path*', // Proxy to Static Files (Double check path match)
      },
    ]
  },
};

export default nextConfig;
