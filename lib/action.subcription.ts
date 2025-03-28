import { prisma } from "./prisma";

export const getSubscription = async (userId: string) => {
  const userWithSubscription = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      subscriptions: {
        select: {
          plan: {
            select: {
              name: true,
              maxTenants: true,
              maxUsers: true,
              maxProducts: true,
              maxOrders: true,
            },
          },
        },
      },
    },
  });
  return userWithSubscription?.subscriptions[0]?.plan.name;
};

export const getPlan = async (tenantId: string) => {
  // First find the owner user of this tenant
  const tenant = await prisma.tenant.findUnique({
    where: {
      id: tenantId,
    },
    include: {
      users: {
        where: {
          role: "ADMIN",
        },
        take: 1,
        select: {
          id: true,
          subscriptions: {
            select: {
              plan: true,
            },
          },
        },
      },
    },
  });

  // Return the plan name from the admin user's subscription
  return tenant?.users[0]?.subscriptions[0]?.plan.name;
};

// Get detailed subscription info for a tenant
export const getTenantSubscriptionDetails = async (tenantId: string) => {
  const tenant = await prisma.tenant.findUnique({
    where: {
      id: tenantId,
    },
    include: {
      users: {
        where: {
          role: "ADMIN",
        },
        take: 1,
        select: {
          id: true,
          subscriptions: {
            include: {
              plan: true,
            },
          },
        },
      },
    },
  });

  if (!tenant?.users[0]?.subscriptions[0]) {
    return null;
  }

  return tenant.users[0].subscriptions[0];
};
