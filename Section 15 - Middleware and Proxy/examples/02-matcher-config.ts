// proxy.ts
export const config = {
  matcher: [
    "/dashboard/:path*",  // /dashboard and everything under it
    "/admin/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)", // everything except these
  ],
};
