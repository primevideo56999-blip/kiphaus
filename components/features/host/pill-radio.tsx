import type { ReactNode } from "react"

export function PillRadio({
  name,
  value,
  defaultChecked,
  children,
}: {
  name: string
  value: string
  defaultChecked: boolean
  children: ReactNode
}) {
  const id = `${name}-${value}`
  return (
    <div>
      <input type="radio" id={id} name={name} value={value} defaultChecked={defaultChecked} className="peer sr-only" />
      <label
        htmlFor={id}
        className="block cursor-pointer rounded-full border border-border px-4 py-2.5 text-body-sm font-medium text-graphite tracking-body-sm transition-colors peer-checked:border-ink-black peer-checked:bg-ink-black peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
      >
        {children}
      </label>
    </div>
  )
}
