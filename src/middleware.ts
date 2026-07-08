import { withAuth } from "next-auth/middleware";

// Gate the admin panel and admin APIs behind a valid session.
export default withAuth({
  pages: { signIn: "/admin/login" },
});

export const config = {
  matcher: ["/admin/((?!login).*)", "/admin", "/api/admin/:path*"],
};
