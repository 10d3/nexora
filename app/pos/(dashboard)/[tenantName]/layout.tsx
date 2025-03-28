import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { redirect } from "next/navigation";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { BreadcrumbNav } from "@/components/sidebar/breadcrumb-nav";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReactNode } from "react";

export default async function PosLayout({
  params,
  children,
}: {
  params: { tenantName: string };
  children: ReactNode;
}) {
  try {
    const paramsName = await params;
    const tenantName = paramsName.tenantName;
    console.log("params is : ", tenantName);
    // Get the current user session
    console.log("Checking session in POS layout");
    const session = await auth();
    if (!session?.user) {
      console.log("No session found, redirecting to login");
      redirect("/sign-in");
    }

    console.log("session is : ", session);

    // Get all tenants the user has access to
    // 1. Tenants the user owns (direct relation)
    const ownedTenants = await prisma.tenant.findMany({
      where: {
        users: {
          some: {
            id: session.user.id,
          },
        },
      },
      include: {
        settings: true,
      },
    });

    // 2. Tenants where the user is a member
    const memberTenants = await prisma.tenant.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        settings: true,
        members: {
          where: {
            userId: session.user.id,
          },
          select: {
            role: true,
          },
        },
      },
    });

    // Combine all tenants
    const allTenants = [
      ...ownedTenants.map((tenant) => ({
        ...tenant,
        role: "OWNER", // Assuming ownership means OWNER role
      })),
      ...memberTenants.map((tenant) => ({
        ...tenant,
        role: tenant.members[0]?.role || "MEMBER", // Get the user's role in this tenant
      })),
    ];

    if (allTenants.length === 0) {
      console.error("No tenants found for user:", session.user.id);
      redirect("/create-tenant");
    }

    // Get the active tenant from the user's session
    let activeTenant = allTenants.find((tenant) => tenant.slug === tenantName);

    // If no active tenant is set, use the first one
    if (!activeTenant) {
      activeTenant = allTenants[0];

      // Update the user's active tenant in the database
      // await prisma.user.update({
      //   where: { id: session.user.id },
      //   data: { tenantId: activeTenant.id },
      // });
    }

    // Prepare data for the sidebar
    const userData = {
      name: session.user.name || "",
      email: session.user.email || "",
      avatar: session.user.image,
    };

    // Format tenant data for the sidebar
    const tenantsData = allTenants.map((tenant) => ({
      id: tenant.id,
      name: tenant.name,
      businessType: tenant.businessType,
      logo: tenant.settings?.logoUrl || null,
      role: tenant.role,
      slug: tenant.slug,
    }));

    return (
      <SidebarProvider>
        <nav>
          <AppSidebar
            businessType={activeTenant.businessType}
            userData={{
              ...userData,
              avatar: userData.avatar || undefined,
            }}
            tenantData={tenantsData.map((tenant) => ({
              ...tenant,
              logo: tenant.logo ?? undefined,
            }))}
            activeTenantId={activeTenant.id}
            activeTenantSlug={activeTenant.slug}
          />
        </nav>
        <SidebarInset>
          <div className="px-4">
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <BreadcrumbNav activeTenat={activeTenant.slug} />
              </div>
            </header>
            <main>{children}</main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  } catch (error) {
    console.error("Error in POS layout:", error);
    redirect("/sign-in");
  }
}
