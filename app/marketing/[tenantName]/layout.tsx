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
import { ReactNode } from "react";
// import { DashboardProvider } from "@/context/dashboard-provider";
import { getAllTenants } from "@/lib/utils/tenant-utils";
import { env } from "@/lib/env";

export async function generateMetadata({
  params,
}: {
  params: { tenantName: string };
}) {
  const paramsName = await params;
  const tenantName = paramsName.tenantName;
  const { activeTenant } = await getAllTenants(true, tenantName);
  return {
    title: `${activeTenant?.name} | Dashboard`,
    description: "Dashboard for your business",
    openGraph: {
      title: `${activeTenant?.name} | Dashboard`,
      description: "Dashboard for your business",
      // images: [],
    },
    twitter: {
      title: `${activeTenant?.name} | Dashboard`,
      description: "Dashboard for your business",
      // images: [],
    },
    icons: [activeTenant?.settings?.logoUrl || null],
    metadataBase: new URL(
      `https://pos.${env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000"}/${activeTenant?.slug}`
    ),
  };
}

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

    // Get all tenants, active tenant, and formatted tenant data
    const { allTenants, activeTenant, tenantsData } = await getAllTenants(
      false,
      tenantName,
      session.user.id as string
    );

    // If no tenants found, redirect to create tenant page
    if (allTenants.length === 0) {
      redirect("/create-tenant");
    }

    // If no active tenant, this should never happen as the function handles this case
    if (!activeTenant) {
      redirect("/create-tenant");
    }

    // Prepare data for the sidebar
    const userData = {
      name: session.user.name || "",
      email: session.user.email || "",
      avatar: session.user.image,
    };

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
            <main>
              {children}
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  } catch (error) {
    console.error("Error in POS layout:", error);
    redirect("/sign-in");
  }
}
