import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap " +
  "transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-button hover:bg-primary-hover active:bg-primary-strong",
  secondary:
    "border-2 border-primary bg-surface text-primary hover:bg-secondary active:bg-secondary-hover",
};

// Both sizes keep the tap target at 44px or taller.
const sizes: Record<Size, string> = {
  md: "min-h-11 px-4 text-base",
  lg: "min-h-12 px-5 text-base",
};

export function buttonClasses(
  variant: Variant = "primary",
  size: Size = "md",
  className = "",
) {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`.trim();
}

type StyleProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

/** A real `<button>` for actions on the current page. */
export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: StyleProps & ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className)}
      {...props}
    />
  );
}

/** A link that looks like a button, for moving to another page. */
export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: StyleProps & ComponentProps<typeof Link>) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}

export function PrimaryButton(props: Omit<ComponentProps<typeof ButtonLink>, "variant">) {
  return <ButtonLink variant="primary" {...props} />;
}

export function SecondaryButton(props: Omit<ComponentProps<typeof ButtonLink>, "variant">) {
  return <ButtonLink variant="secondary" {...props} />;
}
