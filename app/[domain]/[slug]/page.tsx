import React from "react";

export default async function Page({
  params,
}: {
  params: Promise<{ domain: string; slug: string }>;
}) {
  const { domain, slug } = await params;
  console.log(domain, slug);
  return <div className="container">page</div>;
}