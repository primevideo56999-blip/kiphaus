import type { ReactNode } from "react"

export type LegalSection = {
  id: string
  heading: string
  body: ReactNode
}

export function LegalShell({
  title,
  lastUpdated,
  intro,
  sections,
}: {
  title: string
  lastUpdated: string
  intro?: string
  sections: LegalSection[]
}) {
  return (
    <main className="mx-auto max-w-6xl px-4 pt-14 pb-24 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">{title}</h1>
        <p className="mt-3 text-body-sm text-smoke tracking-body-sm">Last updated {lastUpdated}</p>
        {intro && <p className="mt-5 text-body text-ink-black leading-body tracking-body">{intro}</p>}
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Table of contents" className="hidden lg:block">
          <ul className="sticky top-28 space-y-3 border-l border-border pl-4 text-body-sm tracking-body-sm">
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="text-smoke hover:text-ink-black">
                  {section.heading}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 max-w-2xl space-y-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-28">
              <h2 className="text-heading-sm font-semibold text-ink-black leading-heading-sm">{section.heading}</h2>
              <div className="mt-3 space-y-3 text-body text-graphite leading-body tracking-body">{section.body}</div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
