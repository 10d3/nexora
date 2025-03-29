/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  UserPlus,
  Loader2,
  MoreHorizontal,
  Trash2,
  Shield,
  Users,
  Search,
  Mail,
  AlertCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Role } from "@prisma/client";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useDashboard } from "@/context/dashboard-provider";
import { PermissionGate } from "@/components/shared/permission-gate";
import { Permission } from "@/lib/permissions/role-permissions";
import {
  getUsers,
  updateUserRole,
  inviteUser,
  removeUser,
} from "@/lib/actions/user.actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Define form schemas
const inviteUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.string().min(1, "Please select a role"),
});

const updateRoleSchema = z.object({
  userId: z.string(),
  role: z.string().min(1, "Please select a role"),
});

type InviteUserFormValues = z.infer<typeof inviteUserSchema>;
type UpdateRoleFormValues = z.infer<typeof updateRoleSchema>;

// Helper function to get role display name
const getRoleDisplayName = (role: string) => {
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Helper function to get role badge variant
const getRoleBadgeVariant = (
  role: string
): "default" | "outline" | "secondary" | "destructive" => {
  if (role.includes("ADMIN") || role.includes("OWNER")) return "default";
  if (role.includes("MANAGER")) return "secondary";
  return "outline";
};

export default function UsersSettingsPage() {
  const queryClient = useQueryClient();
  const { tenantId } = useDashboard();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ["users", tenantId],
    queryFn: async () => {
      return await getUsers(tenantId as string);
    },
    enabled: !!tenantId,
  });

  // Filter users based on search query
  const filteredUsers = users?.filter((user: any) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      getRoleDisplayName(user.role).toLowerCase().includes(query)
    );
  });

  // Invite user mutation
  const inviteMutation = useMutation({
    mutationFn: async (data: InviteUserFormValues) => {
      return await inviteUser({
        email: data.email,
        role: data.role as Role,
        tenantId: tenantId as string,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", tenantId] });
      toast.success("User invited successfully");
      setIsInviteDialogOpen(false);
      inviteForm.reset();
    },
    onError: (error) => {
      console.error("Failed to invite user:", error);
      toast.error("Failed to invite user");
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async (data: UpdateRoleFormValues) => {
      return await updateUserRole({
        userId: data.userId,
        role: data.role as Role,
        tenantId: tenantId as string,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", tenantId] });
      toast.success("User role updated successfully");
      setIsRoleDialogOpen(false);
      updateRoleForm.reset();
    },
    onError: (error) => {
      console.error("Failed to update user role:", error);
      toast.error("Failed to update user role");
    },
  });

  // Remove user mutation
  const removeMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await removeUser({
        userId,
        tenantId: tenantId as string,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", tenantId] });
      toast.success("User removed successfully");
      setIsRemoveDialogOpen(false);
    },
    onError: (error) => {
      console.error("Failed to remove user:", error);
      toast.error("Failed to remove user");
    },
  });

  // Invite user form
  const inviteForm = useForm<InviteUserFormValues>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: "",
      role: "",
    },
  });

  // Update role form
  const updateRoleForm = useForm<UpdateRoleFormValues>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: {
      userId: "",
      role: "",
    },
  });

  // Handle invite user form submission
  const onInviteSubmit = (values: InviteUserFormValues) => {
    inviteMutation.mutate(values);
  };

  // Handle update role form submission
  const onUpdateRoleSubmit = (values: UpdateRoleFormValues) => {
    updateRoleMutation.mutate(values);
  };

  // Open role dialog with selected user
  const openRoleDialog = (user: any) => {
    setSelectedUser(user);
    updateRoleForm.setValue("userId", user.id);
    updateRoleForm.setValue("role", user.role);
    setIsRoleDialogOpen(true);
  };

  // Open remove dialog with selected user
  const openRemoveDialog = (user: any) => {
    setSelectedUser(user);
    setIsRemoveDialogOpen(true);
  };

  // Handle user removal
  const handleRemoveUser = () => {
    if (selectedUser?.id) {
      removeMutation.mutate(selectedUser.id);
    }
  };

  return (
    <PermissionGate permission={Permission.MANAGE_USERS}>
      <div className="container mx-auto pb-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                User Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage users and their roles in your organization
              </p>
            </div>
          </div>
          <Dialog
            open={isInviteDialogOpen}
            onOpenChange={setIsInviteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="self-start md:self-auto">
                <UserPlus className="mr-2 h-4 w-4" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite a new user</DialogTitle>
                <DialogDescription>
                  Send an invitation to a new user to join your organization.
                </DialogDescription>
              </DialogHeader>
              <Form {...inviteForm}>
                <form
                  onSubmit={inviteForm.handleSubmit(onInviteSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={inviteForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="user@example.com"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          The user will receive an invitation email at this
                          address.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={inviteForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(Role).map((role) => (
                              <SelectItem key={role} value={role}>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={getRoleBadgeVariant(role)}
                                    className="font-normal"
                                  >
                                    {getRoleDisplayName(role)}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The role determines what permissions the user will
                          have.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={inviteMutation.isPending}>
                      {inviteMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending Invitation...
                        </>
                      ) : (
                        "Send Invitation"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Users</CardTitle>
                <CardDescription>
                  Manage users and their access to your organization.
                </CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary/70" />
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : users && users.length > 0 ? (
              <div className="space-y-1">
                <div className="grid grid-cols-12 gap-4 py-3 px-4 bg-muted/50 rounded-md font-medium text-muted-foreground">
                  <div className="col-span-5 md:col-span-4">User</div>
                  <div className="col-span-3 md:col-span-3">Role</div>
                  <div className="hidden md:block md:col-span-3">Joined</div>
                  <div className="col-span-4 md:col-span-2 text-right">
                    Actions
                  </div>
                </div>

                {filteredUsers && filteredUsers.length > 0 ? (
                  filteredUsers.map((user: any) => (
                    <div
                      key={user.id}
                      className="grid grid-cols-12 gap-4 py-4 px-4 items-center border-b hover:bg-muted/30 transition-colors rounded-md"
                    >
                      <div className="col-span-5 md:col-span-4 flex items-center gap-3">
                        <Avatar className="h-10 w-10 border">
                          <AvatarImage src={user.image || ""} alt={user.name} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.name?.charAt(0) || user.email?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium truncate">
                            {user.name || "Unnamed User"}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-3 md:col-span-3">
                        <Badge
                          variant={getRoleBadgeVariant(user.role)}
                          className="font-normal"
                        >
                          {getRoleDisplayName(user.role)}
                        </Badge>
                      </div>
                      <div className="hidden md:block md:col-span-3 text-sm text-muted-foreground">
                        {user.createdAt
                          ? format(new Date(user.createdAt), "MMM d, yyyy")
                          : "N/A"}
                      </div>
                      <div className="col-span-4 md:col-span-2 text-right">
                        <TooltipProvider>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>
                                User Actions
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenuItem
                                    onClick={() => openRoleDialog(user)}
                                    className="cursor-pointer"
                                  >
                                    <Shield className="mr-2 h-4 w-4" />
                                    Change Role
                                  </DropdownMenuItem>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                  <p>Update user permissions</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenuItem
                                    onClick={() => openRemoveDialog(user)}
                                    className="text-destructive cursor-pointer"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove User
                                  </DropdownMenuItem>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                  <p>Remove user from organization</p>
                                </TooltipContent>
                              </Tooltip>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TooltipProvider>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                    <Search className="h-10 w-10 text-muted-foreground/70" />
                    <p>No users found matching your search.</p>
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                      className="mt-2"
                    >
                      Clear Search
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Users className="h-12 w-12 text-muted-foreground/70" />
                <p className="text-muted-foreground">
                  No users found. Invite users to get started.
                </p>
                <Button
                  onClick={() => setIsInviteDialogOpen(true)}
                  className="mt-2"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite First User
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Change Role Dialog */}
        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Change User Role</DialogTitle>
              <DialogDescription>
                Update the role for {selectedUser?.name || selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            <Form {...updateRoleForm}>
              <form
                onSubmit={updateRoleForm.handleSubmit(onUpdateRoleSubmit)}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage
                      src={selectedUser?.image || ""}
                      alt={selectedUser?.name}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedUser?.name?.charAt(0) ||
                        selectedUser?.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {selectedUser?.name || "Unnamed User"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {selectedUser?.email}
                    </span>
                  </div>
                </div>

                <FormField
                  control={updateRoleForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(Role).map((role) => (
                            <SelectItem key={role} value={role}>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={getRoleBadgeVariant(role)}
                                  className="font-normal"
                                >
                                  {getRoleDisplayName(role)}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        <div className="flex items-center gap-2 mt-1">
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          <span>
                            The role determines what permissions the user will
                            have.
                          </span>
                        </div>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsRoleDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateRoleMutation.isPending}>
                    {updateRoleMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Role"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Remove User Alert Dialog */}
        <AlertDialog
          open={isRemoveDialogOpen}
          onOpenChange={setIsRemoveDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove{" "}
                {selectedUser?.name || selectedUser?.email} from your
                organization? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemoveUser}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={removeMutation.isPending}
              >
                {removeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  "Remove User"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PermissionGate>
  );
}
