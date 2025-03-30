import React from "react";

export default async function page({
  params,
}: {
  params: { domain: string; slug: string };
}) {
  const pageParams = await params;
  const { domain, slug } = pageParams;
  console.log(domain, slug);
  return <div className="container">page</div>;
}
