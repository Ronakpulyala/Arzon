import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "HR" | "EMPLOYEE";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "ADMIN" | "HR" | "EMPLOYEE";
  }
}
