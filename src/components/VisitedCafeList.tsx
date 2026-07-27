import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { fetchVisitedNotes, type VisitedCafeRecord } from '@/lib/visitNotes'

interface VisitedCafeListProps {
  onSelectVisitedCafe: (record: VisitedCafeRecord) => void
  refreshKey: number
}

export function VisitedCafeList({ onSelectVisitedCafe, refreshKey }: VisitedCafeListProps) {
  const { user } = useAuth()
  const [records, setRecords] = useState<VisitedCafeRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setRecords([])
      return
    }

    let cancelled = false
    setIsLoading(true)
    setErrorMessage(null)
    fetchVisitedNotes(user.id).then(({ data, error }) => {
      if (cancelled) return
      setIsLoading(false)
      if (error) {
        setErrorMessage(error)
        return
      }
      setRecords(data)
    })

    return () => {
      cancelled = true
    }
  }, [user, refreshKey])

  return (
    <section className="flex flex-col gap-3 md:w-72 md:shrink-0">
      <h2 className="text-base font-semibold">방문한 카페</h2>
      {!user ? (
        <p className="text-sm text-muted-foreground">로그인하면 방문한 카페를 모아볼 수 있어요.</p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      ) : errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : records.length === 0 ? (
        <p className="text-sm text-muted-foreground">아직 방문 체크한 카페가 없어요.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {records.map((record) => (
            <li key={`${record.placeName}-${record.address}`}>
              <button
                type="button"
                onClick={() => onSelectVisitedCafe(record)}
                className="w-full rounded-lg border border-border p-3 text-left hover:bg-accent"
              >
                <p className="font-medium">{record.placeName}</p>
                <p className="text-xs text-muted-foreground">{record.address}</p>
                {record.impression && <p className="mt-1 text-sm">{record.impression}</p>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
