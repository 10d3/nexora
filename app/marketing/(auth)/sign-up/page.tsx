import SignupWithTenantForm from "@/components/shared/signup-with-tenant-form";
import { GalleryVerticalEnd } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign Up | Multi-tenant POS",
  description:
    "Create a new account and business for the multi-tenant POS system",
};

export default function SignupPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 w-full">
      <div className="flex w-full flex-col gap-6 items-center">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium mb-4"
        >
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Nexora Inc.
        </Link>
        <SignupWithTenantForm />
      </div>
    </div>
  );
}
