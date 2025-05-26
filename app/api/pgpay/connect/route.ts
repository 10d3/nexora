import { NextResponse } from "next/server";
import { encrypt } from "@/lib/encryption"; // You'll need to implement this
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { apiKey, userId } = await req.json();

    // Encrypt the API key
    const encryptedKey = await encrypt(apiKey);

    // Store in database
    await prisma.user.update({
      where: {
        id: userId as string,
      },
      data: {
        pgpayApiKey: encryptedKey,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving PGPay API key:", error);
    return NextResponse.json(
      { error: "Failed to save API key" },
      { status: 500 }
    );
  }
}
