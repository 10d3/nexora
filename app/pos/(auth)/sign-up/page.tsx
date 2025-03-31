import { Metadata } from "next";
import Link from "next/link";
import { GalleryVerticalEnd } from "lucide-react";
import SignupWithTenantForm from "@/components/shared/signup-with-tenant-form";

export const metadata: Metadata = {
  title: "Sign Up | Multi-tenant POS",
  description:
    "Create a new account and business for the multi-tenant POS system",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Illustration/Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/10 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 z-0">
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=600')] bg-no-repeat bg-cover opacity-10"></div>
        </div>

        <div className="relative z-10">
          <Link
            href="/"
            className="flex items-center gap-2 font-medium text-primary"
          >
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-5" />
            </div>
            <span className="text-xl font-bold">Nexora Inc.</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-primary">
            Streamline Your Business Operations
          </h1>
          <p className="text-lg text-muted-foreground">
            Join thousands of businesses that trust our multi-tenant POS system
            to manage their operations efficiently.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-6">
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg">
              <h3 className="font-medium">Easy Setup</h3>
              <p className="text-sm text-muted-foreground">
                Get started in minutes with our intuitive onboarding process
              </p>
            </div>
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg">
              <h3 className="font-medium">Secure Platform</h3>
              <p className="text-sm text-muted-foreground">
                Enterprise-grade security for your business data
              </p>
            </div>
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg">
              <h3 className="font-medium">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">
                Our team is always available to help you succeed
              </p>
            </div>
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg">
              <h3 className="font-medium">Scalable Solution</h3>
              <p className="text-sm text-muted-foreground">
                Grows with your business needs without limitations
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Nexora Inc. All rights reserved.
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center mb-8">
            <Link href="/" className="flex items-center gap-2 font-medium">
              <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-5" />
              </div>
              <span className="text-xl font-bold">Nexora Inc.</span>
            </Link>
          </div>

          <SignupWithTenantForm />
        </div>
      </div>
    </div>
  );
}
