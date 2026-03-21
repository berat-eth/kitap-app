import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { SkipLink } from "./skip-link";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <SkipLink />
      <div className="page-bg" aria-hidden="true" />
      <SiteHeader />
      <main id="main-content" className="relative z-10 flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
