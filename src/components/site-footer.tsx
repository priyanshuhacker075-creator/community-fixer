export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-5 py-10 text-sm text-muted-foreground md:flex-row md:items-center">
        <p>
          <span className="font-display font-semibold text-foreground">CivicFix</span> · Built by neighbors, for neighbors.
        </p>
        <p>© {new Date().getFullYear()} CivicFix Cooperative</p>
      </div>
    </footer>
  );
}
