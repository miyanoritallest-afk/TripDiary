export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/timeline/:path*',
    '/following/:path*',
    '/profile/:path*',
    '/user/:path*',
    '/navi/:path*',
    '/api/posts/:path*',
    '/api/follows/:path*',
    '/api/navi/:path*',
    '/api/profiles/:path*',
    '/api/photos/:path*',
    '/api/geocoding/:path*',
  ],
};
