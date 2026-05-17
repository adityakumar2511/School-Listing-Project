import type { Metadata } from "next";
import { ForgotPasswordClient } from "./forgot-password-client";

export const metadata: Metadata = {
  title: "Forgot Password — SchoolSetu",
  description: "Reset your SchoolSetu password with an email verification code.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
