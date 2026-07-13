/** @type {import('next').NextConfig} */
const nextConfig = {
  // এখানে কোনো output: 'export' রাখা যাবে না
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
