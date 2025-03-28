"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { BusinessType } from "@prisma/client";
import { createSlug } from "@/lib/utils";

// Define signup schema for validation
const signupSchema = z.object({
  // User information
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),

  // Business information
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters"),
  businessType: z.nativeEnum(BusinessType),
  description: z.string().optional(),
});

export async function signupUserWithTenant(formData: FormData) {
  try {
    // Extract form data
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const businessName = formData.get("businessName") as string;
    const businessType = formData.get("businessType") as BusinessType;
    const description = (formData.get("description") as string) || undefined;

    // Validate with zod
    const validatedData = signupSchema.parse({
      name,
      email,
      password,
      businessName,
      businessType,
      description,
    });

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return {
        success: false,
        message: "User with this email already exists",
      };
    }

    // Generate subdomain from business name
    const subdomain = createSlug(validatedData.businessName);

    // Check if subdomain already exists
    const existingSite = await prisma.site.findUnique({
      where: { subdomain },
    });

    if (existingSite) {
      return {
        success: false,
        message:
          "A business with a similar name already exists. Please choose a different name.",
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create tenant, site, and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          slug: createSlug(validatedData.businessName),
          name: validatedData.businessName,
          businessType: validatedData.businessType,
          description: validatedData.description,
          settings: {
            create: {
              theme: "light",
              currency: "USD",
              taxRate: 0,
              tableManagement: validatedData.businessType === "RESTAURANT",
              roomManagement: validatedData.businessType === "HOTEL",
              appointmentSystem: ["SALON", "SERVICE"].includes(
                validatedData.businessType
              ),
            },
          },
        },
      });

      // Create site with subdomain
      const site = await tx.site.create({
        data: {
          name: validatedData.businessName,
          subdomain: subdomain,
          tenantId: tenant.id,
        },
      });

      // Create user with admin role
      const user = await tx.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
          role: "ADMIN", // Make the signup user an admin
          tenantId: tenant.id,
        },
      });

      return { tenant, site, user };
    });

    return {
      success: true,
      message: "Account and business created successfully",
      userId: result.user.id,
      tenantId: result.tenant.id,
      subdomain: result.site.subdomain,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      return {
        success: false,
        message:
          "Validation error: " +
          error.errors.map((e) => `${e.path}: ${e.message}`).join(", "),
        errors: error.errors,
      };
    }

    console.error("Signup error:", error);
    return {
      success: false,
      message: "Failed to create account and business",
    };
  }
}

const userSignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function signupUser(formData: FormData) {
  try {
    // Extract form data
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validate with zod
    const validatedData = userSignupSchema.parse({
      name,
      email,
      password,
    });

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return {
        success: false,
        message: "User with this email already exists",
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: "ADMIN", // Default role for new users
      },
    });

    return {
      success: true,
      message: "Account created successfully",
      userId: user.id,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      return {
        success: false,
        message:
          "Validation error: " +
          error.errors.map((e) => `${e.path}: ${e.message}`).join(", "),
        errors: error.errors,
      };
    }

    console.error("Signup error:", error);
    return {
      success: false,
      message: "Failed to create account",
    };
  }
}
