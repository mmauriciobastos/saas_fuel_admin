import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SaaS - Fuel Delivery",
  description: "Sign in to your account to manage fuel deliveries and orders.",
};

export default function SignIn() {
  return <SignInForm />;
}
