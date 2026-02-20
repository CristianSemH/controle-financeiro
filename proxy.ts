import { withAuth } from "next-auth/middleware";

export default withAuth(
    function proxy(req) { },
    {
        pages: {
            signIn: "/login",
        },
    }
);

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/transactions/:path*",
        "/goals/:path*",
        "/categories/:path*",
    ],
};