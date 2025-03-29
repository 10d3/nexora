/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
// import { db } from "@/lib/db";
import { checkPermission } from "@/lib/permissions/server-permissions";
import { Permission } from "@/lib/permissions/role-permissions";
import { prisma } from "../prisma";

// Get all users for a tenant
export async function getUsers(tenantId: string) {
  try {
    // Check if user has permission to view users
    await checkPermission(Permission.VIEW_USERS);

    const members = await prisma.member.findMany({
      where: {
        tenantId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    // Map to a more convenient format
    return members.map((member: { user: { id: any; name: any; email: any; image: any; createdAt: any; }; role: any; id: any; }) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      image: member.user.image,
      role: member.role,
      createdAt: member.user.createdAt,
      memberId: member.id,
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

// Invite a new user
export async function inviteUser({
  email,
  role,
  tenantId,
}: {
  email: string;
  role: Role;
  tenantId: string;
}) {
  try {
    // Check if user has permission to manage users
    await checkPermission(Permission.MANAGE_USERS);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Check if user is already a member of this tenant
      const existingMember = await prisma.member.findFirst({
        where: {
          userId: existingUser.id,
          tenantId,
        },
      });

      if (existingMember) {
        throw new Error("User is already a member of this organization");
      }

      // Add user as a member
      await prisma.member.create({
        data: {
          userId: existingUser.id,
          tenantId,
          role,
        },
      });

      revalidatePath(`/${tenantId}/settings/users`);
      return { success: true };
    }

    // Create invitation for new user
    const invitation = await prisma.invitation.create({
      data: {
        email,
        role,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        tenantId,
        inviterId: "system", // Replace with actual user ID from session
      },
    });

    // TODO: Send invitation email

    revalidatePath(`/${tenantId}/settings/users`);
    return { success: true, invitation };
  } catch (error) {
    console.error("Error inviting user:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to invite user"
    );
  }
}

// Update user role
export async function updateUserRole({
  userId,
  role,
  tenantId,
}: {
  userId: string;
  role: Role;
  tenantId: string;
}) {
  try {
    // Check if user has permission to manage users
    await checkPermission(Permission.MANAGE_USERS);

    // Find the member record
    const member = await prisma.member.findFirst({
      where: {
        userId,
        tenantId,
      },
    });

    if (!member) {
      throw new Error("User is not a member of this organization");
    }

    // Update the member's role
    await prisma.member.update({
      where: {
        id: member.id,
      },
      data: {
        role,
      },
    });

    revalidatePath(`/${tenantId}/settings/users`);
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    throw new Error("Failed to update user role");
  }
}

// Remove a user from the tenant
export async function removeUser({
  userId,
  tenantId,
}: {
  userId: string;
  tenantId: string;
}) {
  try {
    // Check if user has permission to manage users
    await checkPermission(Permission.MANAGE_USERS);

    // Find the member record
    const member = await prisma.member.findFirst({
      where: {
        userId,
        tenantId,
      },
    });

    if (!member) {
      throw new Error("User is not a member of this organization");
    }

    // Delete the member record
    await prisma.member.delete({
      where: {
        id: member.id,
      },
    });

    revalidatePath(`/${tenantId}/settings/users`);
    return { success: true };
  } catch (error) {
    console.error("Error removing user:", error);
    throw new Error("Failed to remove user");
  }
}
