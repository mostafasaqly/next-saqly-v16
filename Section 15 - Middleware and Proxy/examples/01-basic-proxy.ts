// proxy.ts — at the project root (sibling of app/), replaces the old middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  console.log(`Incoming request: ${request.nextUrl.pathname}`);
  return NextResponse.next(); // let the request continue unmodified
}

export const config = {
  matcher: ["/dashboard/:path*"], // only runs for matching paths
};
