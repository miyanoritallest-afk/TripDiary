/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'cdn.discordapp.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
    localPatterns: [
      { pathname: '/uploads/**' },
    ],
  },
};

export default nextConfig;
