import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/** Everything is public except the bare previews (framed inside the component pages) and the account pages. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/preview/", "/login", "/register", "/account"] }, sitemap: `${SITE}/sitemap.xml` };
}
