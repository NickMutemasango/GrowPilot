import { headers } from "next/headers";

/**
 * This site's address, e.g. "https://growpilot.academy", for links that
 * leave the site (payment return links, affiliate and friend links).
 * Set SITE_URL in production so links can't be changed by request headers;
 * without it, the address of the current request is used.
 */
export async function getSiteUrl(): Promise<string> {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const list = await headers();
  const host = list.get("x-forwarded-host") ?? list.get("host") ?? "localhost:3000";
  const protocol = list.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}
