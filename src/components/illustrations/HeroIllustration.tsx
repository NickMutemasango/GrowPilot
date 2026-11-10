import Image from "next/image";

/*
 * HERO ILLUSTRATION
 * -----------------
 * The 3D "digital learning world" render used on the homepage hero and on the
 * login / register panel. One component so the picture, its description and
 * its background can never drift apart between the two pages.
 *
 * The file is a 1534x1025 WebP (about 66 KB). Next's image pipeline serves a
 * size to suit the screen, and `priority` is set where it is the largest thing
 * above the fold, so it is fetched with the page rather than after it.
 *
 * The render has its own soft green backdrop. The frame repeats that backdrop
 * as a gradient, sampled from the corners of the file itself, so the picture
 * is shown whole (never cropped) and its edges blend into the frame instead of
 * ending in a visible band.
 */

/** Sampled from the corners of the render, so the frame and the file meet seamlessly. */
const BACKDROP = "linear-gradient(135deg, #BFE18A 0%, #C5E794 55%, #C9EC9E 100%)";

const ALT =
  "A 3D illustration of online learning: an open laptop beside a stack of books " +
  "topped with a graduation cap, with sheets of notes floating around them.";

type HeroIllustrationProps = {
  /** Set on the homepage hero, where this is the largest image above the fold. */
  priority?: boolean;
  /** Tells the browser how wide the picture will be, so it fetches the right size. */
  sizes?: string;
  className?: string;
};

export function HeroIllustration({
  priority = false,
  sizes = "100vw",
  className = "",
}: HeroIllustrationProps) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ backgroundImage: BACKDROP }}>
      <Image
        src="/images/hero-digital-learning.webp"
        alt={ALT}
        fill
        priority={priority}
        sizes={sizes}
        /* "contain" keeps every floating page in frame at any shape of box;
           the matching backdrop means there is nothing to see beside it. */
        className="object-contain"
      />
    </div>
  );
}
