import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import type { Service } from "@/lib/marketplace";

const price = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Service-first card: the provider's profile picture on top, the service below it, price and action in the footer. */
export default function ServiceCard({ service }: { service: Service }) {
  const { provider } = service;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card">
      <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100">
        {provider.photo ? (
          <Image
            src={provider.photo}
            alt={provider.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <Image
            src={provider.avatar}
            alt={provider.name}
            width={128}
            height={128}
            className="size-32 rounded-full shadow-card ring-4 ring-white transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {service.tags[0] && (
          <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-brand-800 shadow-sm backdrop-blur">
            {service.tags[0]}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="min-w-0 text-sm leading-tight">
          <p className="truncate font-semibold text-slate-900">{provider.name}</p>
          <p className="truncate text-xs text-slate-500">{provider.role}</p>
        </div>

        <h2 className="mt-3 line-clamp-2 font-display text-base font-bold tracking-tight text-slate-900">
          {service.title}
        </h2>

        <p className="mt-2 mb-4 flex items-center gap-1 text-sm">
          <Star className="size-4 fill-accent-400 text-accent-400" aria-hidden="true" />
          <span className="font-semibold text-slate-900">{service.rating.toFixed(1)}</span>
          <span className="text-slate-500">({service.reviews} reviews)</span>
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="flex flex-col leading-tight">
            <span className="text-xs text-slate-500">Starting at</span>
            <span className="font-display text-lg font-bold text-slate-900">
              {price.format(service.startingPrice)}
            </span>
          </p>
          <ButtonLink
            href={`/marketplace/${service.slug}`}
            size="sm"
            className="size-9 px-0!"
            aria-label={`View service: ${service.title}`}
          >
            <ArrowRight className="size-4" aria-hidden="true" />
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
