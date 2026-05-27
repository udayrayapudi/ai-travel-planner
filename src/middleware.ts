import { withAuth } from "next-auth/middleware";

// Protect dashboard and trip routes
export default withAuth(
  function middleware(req) {
    return undefined;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow /api/auth/* endpoints
        if (req.nextUrl.pathname.startsWith("/api/auth")) {
          return true;
        }
        // Require token for protected routes
        if (
          req.nextUrl.pathname.startsWith("/dashboard") ||
          req.nextUrl.pathname.startsWith("/api/trips") ||
          req.nextUrl.pathname.startsWith("/api/expenses") ||
          req.nextUrl.pathname.startsWith("/api/collaborators") ||
          req.nextUrl.pathname.startsWith("/api/plan-trip")
        ) {
          return !!token;
        }
        // Allow public routes
        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  },
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
