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
        "/((?!login|api|_next|favicon.ico).*)",
    ],
};