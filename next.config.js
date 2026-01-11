/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push({
      '@prisma/client': 'commonjs @prisma/client',
    });
    return config;
  },
  serverExternalPackages: ['@prisma/client'],
};

module.exports = nextConfig;