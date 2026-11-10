import Link from "next/link";

type LogoProps = {
  /** Called after the logo is clicked, e.g. to close the mobile menu. */
  onNavigate?: () => void;
};

/**
 * GrowPilot wordmark in the site header. Always links back to the home page.
 * Plain type: no brand mark and no "Academy" line.
 */
export function Logo({ onNavigate }: LogoProps) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      aria-label="GrowPilot, go to the home page"
      className="inline-flex min-h-11 items-center rounded-lg"
    >
      <span aria-hidden="true" className="text-xl font-bold tracking-tight text-ink">
        GrowPilot
      </span>
    </Link>
  );
}
