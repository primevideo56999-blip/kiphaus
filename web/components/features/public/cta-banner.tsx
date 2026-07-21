import { Button } from "@/components/ui/button"

export function CtaBanner({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string
  description: string
  primaryHref: string
  primaryLabel: string
  secondaryHref: string
  secondaryLabel: string
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-border bg-secondary px-8 py-14 text-center sm:px-16">
        <h2 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">{title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-body text-smoke leading-body tracking-body">{description}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            className="rounded-full h-[50px] w-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold sm:w-auto"
            render={<a href={primaryHref} />}
            nativeButton={false}
          >
            {primaryLabel}
          </Button>
          <Button
            variant="outline"
            className="rounded-full h-[50px] w-full px-8 font-semibold sm:w-auto"
            render={<a href={secondaryHref} />}
            nativeButton={false}
          >
            {secondaryLabel}
          </Button>
        </div>
      </div>
    </section>
  )
}
