import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { PageHero } from "@/components/features/public/page-hero"
import { BlogCard } from "@/components/features/public/blog-card"
import { blogPosts } from "@/lib/mock-data"

export default function BlogPage() {
  const [featured, ...rest] = blogPosts

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Kiphaus Journal"
          title="Notes on trust, pricing, and travel"
          description="How verification works, why we route every conversation to WhatsApp, and guides to the stays we'd actually book ourselves."
        />

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          {featured && (
            <div className="mb-14">
              <BlogCard post={featured} priority />
            </div>
          )}
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
