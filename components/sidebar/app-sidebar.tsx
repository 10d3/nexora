/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { GalleryVerticalEnd } from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
// import { ModeToggle } from "@/components/shared/toggle-theme";
import { getNavLinks } from "@/lib/constant/nav-links";
import { BusinessType } from "@prisma/client";
// import { ThemeColorToggle } from "../shared/color-toggle";

interface TenantData {
  id: string;
  name: string;
  businessType: BusinessType;
  logo?: string;
  role?: string; // Role to identify ownership
  slug: string;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  businessType?: BusinessType;
  userData?: {
    name: string;
    email: string;
    avatar?: string;
  };
  tenantData?: TenantData[];
  activeTenantId?: string;
  activeTenantSlug: string;
}

export function AppSidebar({
  businessType = "RETAIL",
  userData,
  tenantData = [],
  activeTenantId,
  activeTenantSlug,
  ...props
}: AppSidebarProps) {
  // Get navigation links based on business type
  const navItems = getNavLinks(businessType as BusinessType);

  const navItemsWithTenantSlug = navItems.map((item) => {
    // Create a new URL with tenant slug prefix
    const newUrl = item.url.startsWith("/")
      ? `/${activeTenantSlug}${item.url}`
      : `/${activeTenantSlug}/${item.url}`;

    // Handle submenu items if they exist
    const updatedSubItems = item.items?.map((subItem) => ({
      ...subItem,
      url: subItem.url.startsWith("/")
        ? `/${activeTenantSlug}${subItem.url}`
        : `/${activeTenantSlug}/${subItem.url}`,
    }));

    return {
      ...item,
      url: newUrl,
      items: updatedSubItems,
    };
  });

  // Separate owned and member tenants
  const ownedTenants = tenantData.filter(
    (tenant) => tenant.role === "ADMIN" || tenant.role === "OWNER"
  );

  const memberTenants = tenantData.filter(
    (tenant) =>
      tenant.role !== "ADMIN" && tenant.role !== "OWNER" && tenant.role
  );

  // Create teams array with tenant data
  const formattedOwnedTenants =
    ownedTenants.length > 0
      ? ownedTenants.map((tenant) => ({
          id: tenant.id,
          name: tenant.name,
          logo: tenant.logo ? tenant.logo : GalleryVerticalEnd,
          plan: tenant.businessType,
          isActive: tenant.id === activeTenantId,
          role: tenant.role,
          slug: tenant.slug,
        }))
      : [
          {
            id: "default",
            name: "Acme Inc",
            logo: GalleryVerticalEnd,
            plan: "Enterprise",
            isActive: true,
            role: "OWNER",
          },
        ];

  const formattedMemberTenants = memberTenants.map((tenant) => ({
    id: tenant.id,
    name: tenant.name,
    logo: tenant.logo ? tenant.logo : GalleryVerticalEnd,
    plan: tenant.businessType,
    isActive: tenant.id === activeTenantId,
    role: tenant.role,
    slug: tenant.slug,
  }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          ownedTeams={
            formattedOwnedTenants as {
              id: string;
              name: string;
              logo: React.ElementType<any, keyof React.JSX.IntrinsicElements>;
              plan: string;
              isActive?: boolean;
              role?: string;
              slug: string;
            }[]
          }
          memberTeams={
            formattedMemberTenants as {
              id: string;
              name: string;
              logo: React.ElementType<any, keyof React.JSX.IntrinsicElements>;
              plan: string;
              isActive?: boolean;
              role?: string;
              slug: string;
            }[]
          }
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain activeTenantSlug={activeTenantSlug} items={navItemsWithTenantSlug} />
      </SidebarContent>
      <SidebarFooter>
        {/* <ThemeColorToggle /> */}
        {/* <div className="flex items-center justify-between gap-2"> */}
          {/* <ModeToggle /> */}
          <NavUser
            user={
              userData as {
                name: string;
                email: string;
                avatar: string;
              }
            }
          />
        {/* </div> */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
