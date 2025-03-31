
import Link from "next/link"
import { GalleryVerticalEnd } from "lucide-react"
import SignInForm from "@/components/shared/singin-form"


export default function SignInPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Illustration/Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/10 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 z-0">
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=600')] bg-no-repeat bg-cover opacity-10"></div>
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 font-medium text-primary">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-5" />
            </div>
            <span className="text-xl font-bold">Nexora Inc.</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-primary">Welcome Back</h1>
          <p className="text-lg text-muted-foreground">
            Sign in to access your dashboard and continue managing your business operations.
          </p>

          <div className="bg-background/80 backdrop-blur-sm p-6 rounded-lg mt-8">
            <h3 className="font-medium text-lg mb-2">Secure Access</h3>
            <p className="text-muted-foreground">
              Your business data is protected with enterprise-grade security. We use advanced encryption to keep your
              information safe.
            </p>
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

          <SignInForm />
        </div>
      </div>
    </div>
  )
}

