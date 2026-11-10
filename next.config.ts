import type { NextConfig } from "next";

/*
 * Security headers sent with every response.
 *
 * These are the ones that do not change per request. The Content Security
 * Policy is set in src/middleware.ts instead, because it carries a fresh
 * nonce for each request.
 */
const securityHeaders = [
  // Never let a browser guess a file's type: a download that claims to be
  // text can't be treated as a script.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // No framing at all. With CSP frame-ancestors this is belt and braces
  // for older browsers, and it is what stops an attacker putting the admin
  // area in an invisible frame and tricking somebody into clicking.
  { key: "X-Frame-Options", value: "DENY" },
  // Addresses can carry a course slug or a certificate id, so send only the
  // origin to other sites, and nothing at all when leaving HTTPS.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Hardware and sensors are never used, so no page may ask for them.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  // Keep this site out of other sites' processes.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

/**
 * HTTPS only, for two years, including subdomains, once live. Left off in
 * development because localhost is served over HTTP, and a browser that
 * has seen this header will refuse to load it otherwise.
 */
const strictTransportSecurity = {
  key: "Strict-Transport-Security",
  value: "max-age=63072000; includeSubDomains; preload",
};

const nextConfig: NextConfig = {
  // Don't advertise the framework and its version to anyone scanning.
  poweredByHeader: false,

  async headers() {
    const headers =
      process.env.NODE_ENV === "production" ? [...securityHeaders, strictTransportSecurity] : securityHeaders;

    return [
      { source: "/:path*", headers },
      {
        // The payment webhook is server-to-server and must never be cached
        // or read from another site.
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },

  async redirects() {
    // The old "Get Started" placeholder now lives at /register.
    return [{ source: "/get-started", destination: "/register", permanent: false }];
  },
};

export default nextConfig;
