/** Placeholder shown while a detail page reads its slug from the URL. */
export default function DetailFallback() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto grid max-w-6xl animate-pulse gap-10 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-8"
    >
      <div>
        <div className="h-5 w-28 rounded bg-slate-200/70" />
        <div className="mt-8 h-6 w-48 rounded-full bg-slate-200/70" />
        <div className="mt-5 h-12 w-3/4 rounded-lg bg-slate-200/70" />
        <div className="mt-5 h-6 w-full max-w-xl rounded bg-slate-200/70" />
        <div className="mt-12 h-48 rounded-2xl bg-slate-200/70" />
      </div>
      <div className="hidden h-96 rounded-3xl bg-slate-200/70 lg:block" />
    </div>
  );
}
