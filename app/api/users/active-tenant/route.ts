import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { tenantId } = await req.json();
    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant ID is required" },
        { status: 400 }
      );
    }

    // Verify the user has access to this tenant
    const userHasAccess = await prisma.tenant.findFirst({
      where: {
        id: tenantId,
        OR: [
          { users: { some: { id: session.user.id } } },
          { members: { some: { userId: session.user.id } } },
        ],
      },
    });

    if (!userHasAccess) {
      return NextResponse.json(
        { error: "You don't have access to this tenant" },
        { status: 403 }
      );
    }

    // Update the user's active tenant
    await prisma.user.update({
      where: { id: session.user.id },
      data: { tenantId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating active tenant:", error);
    return NextResponse.json(
      { error: "Failed to update active tenant" },
      { status: 500 }
    );
  }
}
