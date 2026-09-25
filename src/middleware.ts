export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/attendance/:path*",
    "/leaves/:path*",
    "/salary/:path*",
    "/sales-reports/:path*",
    "/employees/:path*",
    "/reports/:path*"
  ]
};
