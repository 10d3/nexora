/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useResource } from "@/context/resource-provider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourceTable } from "./_components/resource-table";
import { ResourceGrid } from "./_components/resource-grid";
import { useDashboard } from "@/context/dashboard-provider";
import { LayoutGrid, ListIcon, Plus } from "lucide-react";
import { ResourceDialog } from "@/components/resources-forms/resource-dialog";
import { PermissionGate } from "@/components/shared/permission-gate";
import { Permission } from "@/lib/permissions/role-permissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function ResourcesPage() {
  const { view, setView, search, setSearch } = useResource();
  const { tenantId, businessType } = useDashboard();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-4 p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resources</h1>
          <p className="text-muted-foreground">
            Manage your resources, assets, and staff
          </p>
        </div>

        <PermissionGate
          permission={Permission.CREATE_RESOURCES}
          fallback={
            <Button variant="outline" disabled>
              <Plus className="h-4 w-4 mr-2" />
              New Resource
            </Button>
          }
        >
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Resource
          </Button>
        </PermissionGate>
      </div>

      <PermissionGate
        permission={Permission.VIEW_RESOURCES}
        fallback={
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              You don&apos;t have permission to view resources.
            </AlertDescription>
          </Alert>
        }
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="w-full md:w-1/3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search resources..."
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Tabs value={view} onValueChange={(v) => setView(v as any)}>
          <TabsList>
            <TabsTrigger value="table">
              <ListIcon className="h-4 w-4 mr-2" />
              List
            </TabsTrigger>
            <TabsTrigger value="grid">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Grid
            </TabsTrigger>
          </TabsList>
          <TabsContent value="table" className="mt-4">
            <ResourceTable />
          </TabsContent>
          <TabsContent value="grid" className="mt-4">
            <ResourceGrid />
          </TabsContent>
        </Tabs>
      </PermissionGate>

      <PermissionGate permission={Permission.CREATE_RESOURCES}>
        <ResourceDialog
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
