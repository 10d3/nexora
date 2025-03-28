/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { ChevronsUpDown, Crown, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { AddTenantModal } from "./add-tenant-modal";

interface TeamProps {
  id: string;
  name: string;
  logo: React.ElementType;
  plan: string;
  isActive?: boolean;
  role?: string;
  slug: string;
}

interface TeamSwitcherProps {
  ownedTeams: TeamProps[];
  memberTeams: TeamProps[];
}

export function TeamSwitcher({ ownedTeams, memberTeams }: TeamSwitcherProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  // Find active team from either owned or member teams
  const allTeams = [...ownedTeams, ...memberTeams];
  const activeTeamFromProps =
    allTeams.find((team) => team.isActive) || allTeams[0];

  const [activeTeam, setActiveTeam] =
    React.useState<TeamProps>(activeTeamFromProps);
  const { data: session } = useSession();
  const userId = session?.user?.id || "";

  // Handle tenant selection
  const handleTeamSelect = async (team: TeamProps) => {
    setActiveTeam(team);

    try {
      // Navigate to the tenant's page using the tenant name in the URL
      router.push(`/${encodeURIComponent(team.slug)}`);
    } catch (error) {
      console.error("Failed to update active tenant:", error);
    }
  };

  // Handle new tenant creation success
  const handleTenantCreated = (tenant: any) => {
    // Navigate to the newly created tenant's page
    if (tenant && tenant.name) {
      router.push(`/${encodeURIComponent(tenant.slug)}`);
    } else {
      // If tenant name is not available, just refresh the page
      router.refresh();
    }
  };

  if (!activeTeam) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <activeTeam.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            {ownedTeams.length > 0 && (
              <>
                <DropdownMenuLabel className="text-muted-foreground text-xs flex items-center gap-1">
                  <Crown className="h-3 w-3" /> Your Businesses
                </DropdownMenuLabel>
                {ownedTeams.map((team, index) => (
                  <DropdownMenuItem
                    key={team.id || index}
                    onClick={() => handleTeamSelect(team)}
                    className={`gap-2 p-2 ${team.isActive ? "bg-accent" : ""}`}
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      <team.logo className="size-3.5 shrink-0" />
                    </div>
                    {team.name}
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                ))}
              </>
            )}

            {memberTeams.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-muted-foreground te xt-xs flex items-center gap-1">
                  <Users className="h-3 w-3" /> Member Of
                </DropdownMenuLabel>
                {memberTeams.map((team, index) => (
                  <DropdownMenuItem
                    key={team.id || `member-${index}`}
                    onClick={() => handleTeamSelect(team)}
                    className={`gap-2 p-2 ${team.isActive ? "bg-accent" : ""}`}
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      <team.logo className="size-3.5 shrink-0" />
                    </div>
                    {team.name}
                    <DropdownMenuShortcut>{team.role}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                ))}
              </>
            )}

            <DropdownMenuSeparator />
            <AddTenantModal
              userId={userId}
              onSuccess={handleTenantCreated}
              trigger={
                <DropdownMenuItem
                  className="gap-2 p-2"
                  onSelect={(e) => e.preventDefault()}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                    <span className="size-4 flex items-center justify-center">
                      +
                    </span>
                  </div>
                  <div className="text-muted-foreground font-medium">
                    Add business
                  </div>
                </DropdownMenuItem>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
