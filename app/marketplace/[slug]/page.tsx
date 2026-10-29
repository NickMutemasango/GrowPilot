import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronLeft, Clock, MessageSquare, RefreshCw, Star } from "lucide-react";
import DetailFallback from "@/components/catalog/DetailFallback";
import ServiceCard from "@/components/marketplace/ServiceCard";
import { ButtonLink } from "@/components/ui/Button";
import { getRelatedServices, getService, services } from "@/lib/marketplace";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/marketplace/[slug]">): Promise<Metadata> {
  const service = getService((await params).slug);
  if (!service) return {};
  return { title: `${service.title} — GrowPilot`, description: service.description };
}

const price = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

// The route's shared shell can't depend on the URL, so the slug is read inside Suspense.
export default function ServicePage({ params }: PageProps<"/marketplace/[slug]">) {
  return (
    <Suspense fallback={<DetailFallback />}>
      <ServiceDetail params={params} />
    </Suspense>
  );
}

async function ServiceDetail({ params }: Pick<PageProps<"/marketplace/[slug]">, "params">) {
  const service = getService((await params).slug);
  if (!service) notFound();

  const { provider } = service;
  const related = getRelatedServices(service);
  const delivery = `${service.deliveryDays} day${service.deliveryDays === 1 ? "" : "s"}`;

  return (
    <>
      <div className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -top-32 left-1/2 -z-10 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-brand-100/70 blur-3xl"
        />

        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-8">
          <div className="min-w-0">
            <nav aria-label="Breadcrumb">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-1 rounded-md text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                All services
              </Link>
            </nav>

            <header className="mt-6">
              <ul className="flex flex-wrap items-center gap-2" aria-label="Skills">
                {service.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 ring-inset"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
              <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-balance text-slate-900 sm:text-4xl lg:text-5xl">
                {service.title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-pretty text-slate-600">
                {service.description}
              </p>

              <dl className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Rating</dt>
                  <Star className="size-4 fill-accent-400 text-accent-400" aria-hidden="true" />
                  <dd>
                    <span className="font-semibold text-slate-900">{service.rating.toFixed(1)}</span>{" "}
                    ({service.reviews} reviews)
                  </dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Delivery</dt>
                  <Clock className="size-4 text-slate-400" aria-hidden="true" />
                  <dd>{delivery} delivery</dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Provider</dt>
                  <dd>
                    Offered by <span className="font-semibold text-slate-900">{provider.name}</span>
                  </dd>
                </div>
              </dl>
            </header>

            <section aria-labelledby="included-heading" className="mt-12">
              <h2
                id="included-heading"
                className="font-display text-2xl font-bold tracking-tight text-slate-900"
              >
                What&apos;s included
              </h2>
              <ul className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:grid-cols-2">
                {service.included.map((item) => (
                  <li key={item} className="flex gap-3 text-slate-700">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success-50 text-success-600">
                      <Check className="size-3.5" aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="provider-heading" className="mt-12">
              <h2
                id="provider-heading"
                className="font-display text-2xl font-bold tracking-tight text-slate-900"
              >
                About the provider
              </h2>
              <div className="mt-5 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:flex-row sm:items-center">
                <Image
                  src={provider.photo ?? provider.avatar}
                  alt={provider.name}
                  width={80}
                  height={80}
                  className="size-20 shrink-0 rounded-full object-cover ring-4 ring-brand-50"
                />
                <div>
                  <p className="font-display text-lg font-bold text-slate-900">{provider.name}</p>
                  <p className="text-sm text-slate-500">{provider.role}</p>
                  <p className="mt-2 leading-relaxed text-pretty text-slate-600">{provider.bio}</p>
                </div>
              </div>
            </section>
          </div>

          {/* Desktop order card; small screens get the sticky bar below instead. */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
              <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
                {provider.photo ? (
                  <Image
                    src={provider.photo}
                    alt=""
                    fill
                    sizes="20rem"
                    className="object-cover"
                  />
                ) : (
                  <Image
                    src={provider.avatar}
                    alt=""
                    width={112}
                    height={112}
                    className="size-28 rounded-full shadow-card ring-4 ring-white"
                  />
                )}
              </div>
              <div className="p-6">
                <p className="text-xs text-slate-500">Starting at</p>
                <p className="font-display text-3xl font-extrabold text-slate-900">
                  {price.format(service.startingPrice)}
                </p>
                <ButtonLink href="/signup" size="lg" className="mt-5 w-full">
                  <MessageSquare className="size-4" aria-hidden="true" />
                  Contact {provider.name.split(" ")[0]}
                </ButtonLink>
                <p className="mt-3 text-center text-xs text-slate-500">
                  Create a free account to message providers.
                </p>
                <ul className="mt-6 space-y-2.5 text-sm text-slate-600">
                  <li className="flex items-center gap-2.5">
                    <Clock className="size-4 text-slate-400" aria-hidden="true" />
                    {delivery} delivery
                  </li>
                  <li className="flex items-center gap-2.5">
                    <RefreshCw className="size-4 text-slate-400" aria-hidden="true" />
                    Revisions included
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Star className="size-4 text-slate-400" aria-hidden="true" />
                    {service.rating.toFixed(1)} from {service.reviews} reviews
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* On small screens the contact action stays reachable at the bottom of the viewport. */}
      <div className="sticky bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <p className="min-w-0 text-sm text-slate-600">
            From{" "}
            <span className="font-semibold text-slate-900">
              {price.format(service.startingPrice)}
            </span>{" "}
            · {delivery}
          </p>
          <ButtonLink href="/signup" className="shrink-0">
            Contact
          </ButtonLink>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="border-t border-slate-100 bg-slate-50/60">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <h2
              id="related-heading"
              className="border-l-4 border-brand-500 pl-3 font-display text-2xl font-bold tracking-tight text-slate-900"
            >
              Similar services
            </h2>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((s) => (
                <li key={s.slug}>
                  <ServiceCard service={s} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
