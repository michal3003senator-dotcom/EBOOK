import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth-token";
import { REF_COOKIE, REF_DAYS } from "@/lib/constants";

const REF_RE = /^[A-Za-z0-9_-]{2,40}$/;

export async function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!(await verifySession(req.cookies.get(SESSION_COOKIE)?.value))) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  const res = NextResponse.next();
  const ref = searchParams.get("ref");
  if (ref && REF_RE.test(ref)) {
    res.cookies.set(REF_COOKIE, ref, { maxAge: REF_DAYS * 86_400, httpOnly: true, sameSite: "lax", path: "/" });
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/|api/|favicon|preview/|og-cover).*)"],
};
