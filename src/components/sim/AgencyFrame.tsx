/** The agency's page around a simulated step: browser bar on larger screens,
 *  full screen on phones. Matches the lead interface's frame. */
export function AgencyFrame({
  agencyName,
  path,
  children,
}: {
  agencyName: string;
  path: string;
  children: React.ReactNode;
}) {
  const site = `${agencyName.toLowerCase().replace(/[^a-z0-9]+/g, "") || "agency"}.co.uk${path}`;
  return (
    <section
      aria-label={`${agencyName} booking`}
      className="relative z-(--z-frame) mx-auto flex w-full max-w-(--frame-max-width) flex-1 flex-col bg-surface md:min-h-[640px] md:flex-none md:rounded-frame md:border-default md:shadow-frame"
    >
      <div className="hidden h-10 items-center gap-2 rounded-t-frame border-b-(length:--border-width-default) border-line bg-surface-muted px-4 md:flex" aria-hidden="true">
        <i className="size-2.5 rounded-full bg-line-strong" />
        <i className="size-2.5 rounded-full bg-line-strong" />
        <i className="size-2.5 rounded-full bg-line-strong" />
        <span className="ml-4 rounded-control border-default bg-surface px-3.5 py-1 text-xs text-fg-muted">{site}</span>
      </div>
      <header className="flex h-14 items-center gap-3 border-b-(length:--border-width-default) border-line px-4 md:px-6">
        <span aria-hidden="true" className="size-7 rounded-md bg-line-strong" />
        <span className="flex-1 truncate font-semibold">{agencyName}</span>
      </header>
      {children}
    </section>
  );
}
