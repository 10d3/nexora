import { getSiteData } from "@/lib/fetcher";
import { ReactNode } from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const paramsDomain = await params;
  const domain = decodeURIComponent(paramsDomain.domain);
  const site = await getSiteData(domain);
  return {
    title: site?.name,
    description: site?.tenant.description,
    openGraph: {
      title: site?.name,
      description: site?.tenant.description,
      images: [],
    },
    twitter: {
      title: site?.name,
      description: site?.tenant.description,
      images: [],
    },
  };
}

export default async function SiteLayout({
  params,
  children,
}: {
  params: Promise<{ domain: string }>;
  children: ReactNode;
}) {
  const paramsDomain = await params;
  const domain = decodeURIComponent(paramsDomain.domain);
  const site = await getSiteData(domain);
  console.log(site);
  console.log(domain);
  return <>{children}</>;
}