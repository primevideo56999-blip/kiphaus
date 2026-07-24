import { SiteHeader } from "@/components/layout/header"
import { SiteFooter } from "@/components/layout/footer"
import { SearchBar } from "@/components/features/guest/search-bar"
import { SearchFilters } from "@/components/features/guest/search-filters"
import { PropertySearchClient } from "@/components/features/guest/property-search-client"
import { FadeIn } from "@/components/motion/fade-in"
import { fetchProperties } from "@/lib/api"
import type { PropertyType, SearchParams, VerificationLevel } from "@/types"

function parseSearchParams(raw: Record<string, string | string[] | undefined>): SearchParams {
  const get = (key: string) => {
    const value = raw[key]
    return Array.isArray(value) ? value[0] : value
  }
  return {
    city: get("city") || undefined,
    type: (get("type") as PropertyType) || undefined,
    guests: get("guests") ? Number(get("guests")) : undefined,
    priceMin: get("priceMin") ? Number(get("priceMin")) : undefined,
    priceMax: get("priceMax") ? Number(get("priceMax")) : undefined,
    verification: get("verification") ? (Number(get("verification")) as VerificationLevel) : undefined,
    sort: (get("sort") as SearchParams["sort"]) || undefined,
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const params = parseSearchParams(raw)
  const results = await fetchProperties(params)

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
        <FadeIn inView={false} className="mb-10 mx-auto max-w-4xl">
          <SearchBar className="w-full" />
        </FadeIn>
        <div className="flex flex-col gap-10 md:flex-row">
          <SearchFilters />
          <div className="flex-1 min-w-0">
            <PropertySearchClient results={results} city={params.city} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
