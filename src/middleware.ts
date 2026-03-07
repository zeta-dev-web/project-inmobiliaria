import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {
    // Middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // If accessing admin routes, require admin role
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return token?.role === "ADMIN";
        }
        // For other protected routes, just require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"]
};