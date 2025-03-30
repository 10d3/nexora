import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddTenantModal } from "@/components/sidebar/add-tenant-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DefaultPosPage() {
  // Get the current user session
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  // Get all tenants the user has access to
  // 1. Tenants the user owns (direct relation)
  let ownedTenants = [];
  let memberTenants = [];

  try {
    ownedTenants = await prisma.tenant.findMany({
      where: {
        users: {
          some: {
            id: session.user.id,
          },
        },
      },
    });

    // 2. Tenants where the user is a member
    memberTenants = await prisma.tenant.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching tenant data:", error);
    redirect("/sign-in");
  }

  // Combine all tenants
  const allTenants = [...ownedTenants, ...memberTenants];

  if (allTenants.length === 0) {
    // Instead of redirecting, render the create tenant UI
    return (
      <div className="container mx-auto py-10 flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Welcome to Nexora POS</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <p className="text-center text-muted-foreground">
              You don&apos;t have any businesses yet. Create your first business to
              get started.
            </p>

            <AddTenantModal
              userId={session.user.id as string}
              trigger={
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  Create Your First Business
                </button>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to the first tenant
  const firstTenant = allTenants[0];

  // This redirect is outside the try/catch block
  redirect(`/${encodeURIComponent(firstTenant.slug as string)}`);
}
