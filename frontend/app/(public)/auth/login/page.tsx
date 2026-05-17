import type { Metadata } from "next";
import { LoginClient } from "./login-client";

export const metadata: Metadata = {
  title: "Sign In — SchoolSetu",
  description:
    "Sign in to SchoolSetu as a parent or school administrator — email, mobile OTP, or Google.",
};

export default function LoginPage() {
  return <LoginClient />;
}
