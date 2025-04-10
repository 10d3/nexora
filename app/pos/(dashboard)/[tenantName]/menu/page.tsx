"use client";

import { useState } from "react";
// import { useMenu } from "@/context/menu-provider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboard } from "@/context/dashboard-provider";
import { CalendarIcon, LayoutGrid, ListIcon, Plus } from "lucide-react";
import { PermissionGate } from "@/components/shared/permission-gate";
import { Permission } from "@/lib/permissions/role-permissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
// import { useMenuMutations } from "@/hooks/use-menu-mutations";
import { MenuFilters } from "./_components/filters/menu-filters";
import { MenuTable } from "./_components/view/menu-table";
import { MenuGrid } from "./_components/view/menu-grid";
import { MenuCategories } from "./_components/view/menu-categories";
import { MenuDialog } from "./_components/menu-dialog";

export default function MenuPage() {
  const { tenantId, businessType } = useDashboard();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [view, setView] = useState<string>("table");

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Menu</h1>
          <p className="text-muted-foreground">
            Manage your menu items and categories
          </p>
        </div>

        <PermissionGate
          permission={Permission.MANAGE_PRODUCTS}
          fallback={
            <Button variant="outline" disabled>
              <Plus className="h-4 w-4 mr-2" />
              New Menu Item
            </Button>
          }
        >
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Menu Item
          </Button>
        </PermissionGate>
      </div>

      <PermissionGate
        permission={Permission.VIEW_PRODUCTS}
        fallback={
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              You don&apos;t have permission to view menu items.
            </AlertDescription>
          </Alert>
        }
      >
        <MenuFilters />

        <Tabs value={view} onValueChange={(v) => setView(v)}>
          <TabsList>
            <TabsTrigger value="table">
              <ListIcon className="h-4 w-4 mr-2" />
              List
            </TabsTrigger>
            <TabsTrigger value="grid">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Grid
            </TabsTrigger>
            <TabsTrigger value="categories">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Categories
            </TabsTrigger>
          </TabsList>
          <TabsContent value="table" className="mt-4">
            <MenuTable />
          </TabsContent>
          <TabsContent value="grid" className="mt-4">
            <MenuGrid />
          </TabsContent>
          <TabsContent value="categories" className="mt-4">
            <MenuCategories />
          </TabsContent>
        </Tabs>
      </PermissionGate>

      <PermissionGate permission={Permission.MANAGE_PRODUCTS}>
        <MenuDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          businessType={businessType}
          tenantId={tenantId || ""}
          mode="create"
        />
      </PermissionGate>
    </div>
  );
}
