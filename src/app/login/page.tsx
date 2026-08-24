import type { Metadata } from "next";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Sign in", description: "Sign in to MeowMeow to sync your wishlist, cart and reviews." };

export default function LoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="aurora-blob w-96 h-96 bg-brand/15 -top-20 -left-24" />
      <div className="aurora-blob w-96 h-96 bg-brand-2/15 -bottom-24 -right-24" style={{ animationDelay: "-9s" }} />
      <AuthForm mode="login" />
    </div>
  );
}
