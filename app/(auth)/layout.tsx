import Image from "next/image"
import Link from "next/link"
import { LogoMark } from "@/components/shared/logo"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-background">
      <div className="relative hidden p-4 lg:block">
        <div className="relative h-full w-full overflow-hidden rounded-3xl">
          <Image
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Beautiful homestay interior"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay to ensure the image looks nice and not too stark */}
          <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
        </div>
      </div>
      <div className="flex flex-col p-4 lg:p-8 xl:p-12">
        <div className="flex h-full flex-col justify-center">
          <div className="mx-auto w-full max-w-[440px]">
            <header className="mb-10 flex justify-center">
              <Link href="/" className="flex items-center gap-2">
                <LogoMark className="text-primary w-8 h-auto" />
                <span className="text-[20px] font-semibold tracking-[-0.36px] text-primary">Kiphaus</span>
              </Link>
            </header>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
