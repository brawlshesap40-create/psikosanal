export default function AppLoading() {
  return (
    <div className="mx-auto min-h-dvh max-w-md animate-pulse">
      <div className="app-hero-bg px-5 pt-14 pb-16">
        <div className="h-7 w-40 rounded-lg bg-white/25" />
        <div className="mt-2 h-4 w-56 rounded-lg bg-white/15" />
      </div>
      <div className="-mt-10 rounded-t-[28px] bg-[var(--app-bg)] px-5 pt-6">
        <div className="app-card h-28" />
        <div className="mt-5 flex gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="app-card h-24 w-[104px] shrink-0" />
          ))}
        </div>
        <div className="mt-6 h-4 w-40 rounded bg-[var(--app-hairline)]" />
        <div className="mt-3 flex gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="app-card h-40 w-[168px] shrink-0" />
          ))}
        </div>
      </div>
    </div>
  );
}
