"use server";

import { auth } from "../auth";
import { prisma } from "../prisma";

export async function isConnected() {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    throw new Error("user not found");
  }
  const data = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      stripeAccountId: true,
      id: true,
      pgpayApiKey: true
      // pgpayAccountId: true
    },
  });
  console.log(data)
  return {
    userId : data?.id,
    stipeAccountId : data?.stripeAccountId,
    pgpayConnected : data?.pgpayApiKey
  }
}

