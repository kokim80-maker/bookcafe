import { CafeCard } from '@/components/CafeCard'
import type { Cafe } from '@/types/cafe'

interface CafeListSectionProps {
  cafes: Cafe[]
}

export function CafeListSection({ cafes }: CafeListSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold">카페 목록</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cafes.map((cafe) => (
          <CafeCard key={cafe.id} cafe={cafe} />
        ))}
      </div>
    </section>
  )
}
