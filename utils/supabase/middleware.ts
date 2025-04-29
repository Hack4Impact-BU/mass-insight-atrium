// import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { steps } from "@/app/events/utils";
import { createServerClient } from "@supabase/ssr";

export const updateSession = async (request: NextRequest) => {
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    if (request.nextUrl.pathname === "/events/create") {
      return NextResponse.redirect(new URL(steps[0].route, request.url));
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    // This will refresh session if expired - required for Server Components
    const { data: { session } } = await supabase.auth.getSession();

    // If no session and trying to access protected routes, redirect to login
    if (!session && request.nextUrl.pathname.startsWith("/protected")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // After successful login, redirect to dashboard
    if (session && request.nextUrl.pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
  } catch (error) {
    console.error('Error in middleware:', error);
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
