// ============================================================
// middleware.ts — Supabase SSR cookie refresh on protected routes
// ============================================================
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Create Supabase client that refreshes auth cookies in-flight
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          );
        },
      },
    }
  );

  // Refresh session — must await to keep session alive
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect unauthenticated users away from protected routes
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") && !user) {
    return NextResponse.redirect(new URL("/?auth=required", request.url));
  }
  if (pathname.startsWith("/account") && !user) {
    return NextResponse.redirect(new URL("/?auth=required", request.url));
  }
  if (pathname.startsWith("/checkout") && !user) {
    return NextResponse.redirect(new URL("/?auth=required", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout/:path*", "/book/:path*"],
};
