import { withAuth } from "next-auth/middleware";

export default withAuth(
  function proxy() {},
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname;
        const publicRoutes = ["/login", "/login/new"];

        if (publicRoutes.includes(pathname)) {
          return true;
        }

        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
