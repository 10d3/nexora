import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
// import { env } from "./lib/env";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  let hostname = req.headers
    .get("host")!
    .replace(".localhost:3000", `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`);

  // special case for Vercel preview deployment URLs
  if (
    hostname.includes("---") &&
    hostname.endsWith(`.${process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX}`)
  ) {
    hostname = `${hostname.split("---")[0]}.${
      process.env.NEXT_PUBLIC_ROOT_DOMAIN
    }`;
  }

  const searchParams = req.nextUrl.searchParams.toString();
  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  const path = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  // rewrite root application to `/home` folder
  if (
    hostname === "localhost:3000" ||
    hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN
  ) {
    return NextResponse.rewrite(
      new URL(`/home${path === "/" ? "" : path}`, req.url)
    );
  }

  //rewrites for pos
  if (hostname == `pos.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) {
    // Get the session
    const session = await getToken({ req, secret: process.env.AUTH_SECRET });
    console.log("session from middleware", session);

    if (!session && path !== "/sign-in" && path !== "/sign-up") {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    } else if (session && (path === "/sign-in" || path === "/sign-up")) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.rewrite(
      new URL(`/pos${path === "/" ? "" : path}`, req.url)
    );
  }

  // rewrite for marketing
  if (hostname == `marketing.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) {
    // Get the session
    const session = await getToken({ req, secret: process.env.AUTH_SECRET });
    console.log("session from middleware", session);

    if (!session && path !== "/sign-in" && path !== "/sign-up") {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    } else if (session && (path === "/sign-in" || path === "/sign-up")) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.rewrite(
      new URL(`/marketing${path === "/" ? "" : path}`, req.url)
    );
  }

  // rewrite everything else to `/[domain] dynamic route
  return NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url));
}
