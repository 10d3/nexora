import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
// import { serialize } from "next-mdx-remote/serialize";

/**
 * Fetches site data based on domain
 */
export async function getSiteData(domain: string) {
  const subdomain = domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
    ? domain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
    : null;

  return await unstable_cache(
    async () => {
      return await prisma.site.findFirst({
        where: subdomain ? { subdomain } : { customDomain: domain },
        include: {
          tenant: {
            include: {
              settings: true,
            },
          },
        },
      });
    },
    [`${domain}-metadata`],
    {
      revalidate: 900,
      tags: [`${domain}-metadata`],
    }
  )();
}

/**
 * Fetches tenant data including products
 */
export async function getTenantData(domain: string) {
  const subdomain = domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
    ? domain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
    : null;

  return await unstable_cache(
    async () => {
      // First find the site
      const site = await prisma.site.findFirst({
        where: subdomain ? { subdomain } : { customDomain: domain },
        select: { tenantId: true },
      });

      if (!site) return null;

      // Then get the tenant with products
      return await prisma.tenant.findUnique({
        where: { id: site.tenantId },
        include: {
          products: true,
          settings: true,
          categories: true,
        },
      });
    },
    [`${domain}-tenant-data`],
    {
      revalidate: 900,
      tags: [`${domain}-tenant-data`],
    }
  )();
}

/**
 * Fetches products for a specific tenant site
 */
export async function getProductsForSite(domain: string) {
  const subdomain = domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
    ? domain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
    : null;

  return await unstable_cache(
    async () => {
      // First find the site
      const site = await prisma.site.findFirst({
        where: subdomain ? { subdomain } : { customDomain: domain },
        select: { tenantId: true },
      });

      if (!site) return [];

      // Then get all products for this tenant
      return await prisma.product.findMany({
        where: {
          tenantId: site.tenantId,
          //   isActive: true,
        },
        include: {
          category: true,
        },
        orderBy: { createdAt: "desc" },
      });
    },
    [`${domain}-products`],
    {
      revalidate: 900,
      tags: [`${domain}-products`],
    }
  )();
}

/**
 * Fetches a specific product with details
 */
export async function getProductData(domain: string, productId: string) {
  const subdomain = domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
    ? domain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
    : null;

  return await unstable_cache(
    async () => {
      // First find the site
      const site = await prisma.site.findFirst({
        where: subdomain ? { subdomain } : { customDomain: domain },
        select: { tenantId: true },
      });

      if (!site) return null;

      // Then get the specific product
      const product = await prisma.product.findFirst({
        where: {
          id: productId,
          tenantId: site.tenantId,
          //   isActive: true,
        },
        include: {
          category: true,
        },
      });

      if (!product) return null;

      // Get related products in the same category
      const relatedProducts = await prisma.product.findMany({
        where: {
          tenantId: site.tenantId,
          categoryId: product.categoryId,
          //   isActive: true,
          NOT: {
            id: product.id,
          },
        },
        take: 4,
      });

      return {
        ...product,
        relatedProducts,
      };
    },
    [`${domain}-product-${productId}`],
    {
      revalidate: 900,
      tags: [`${domain}-product-${productId}`],
    }
  )();
}
