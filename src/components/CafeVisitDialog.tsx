import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { fetchVisitNote, saveVisitNote } from '@/lib/visitNotes'
import type { Cafe } from '@/types/cafe'

export interface VisitDraft {
  cafeName: string
  cafeAddress: string
  visited: boolean
  review: string
}

interface CafeVisitDialogProps {
  cafe: Cafe | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaveVisit: (draft: VisitDraft) => void
}

export function CafeVisitDialog({ cafe, open, onOpenChange, onSaveVisit }: CafeVisitDialogProps) {
  const { user } = useAuth()
  const [visited, setVisited] = useState(false)
  const [review, setReview] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !cafe) return

    setErrorMessage(null)
    setVisited(false)
    setReview('')

    if (!user) return

    let cancelled = false
    setIsLoading(true)
    fetchVisitNote(user.id, cafe.name, cafe.address).then(({ data, error }) => {
      if (cancelled) return
      setIsLoading(false)
      if (error) {
        setErrorMessage(`이전 기록을 불러오지 못했습니다: ${error}`)
        return
      }
      if (data) {
        setVisited(data.visited)
        setReview(data.impression)
      }
    })

    return () => {
      cancelled = true
    }
  }, [open, cafe, user])

  async function handleSaveClick() {
    if (!cafe) return
    if (!user) {
      setErrorMessage('로그인 후 저장할 수 있어요.')
      return
    }

    setIsSaving(true)
    setErrorMessage(null)
    const { error } = await saveVisitNote({
      userId: user.id,
      placeName: cafe.name,
      address: cafe.address,
      lat: cafe.lat,
      lng: cafe.lng,
      visited,
      impression: review,
    })
    setIsSaving(false)

    if (error) {
      setErrorMessage(`저장에 실패했습니다: ${error}`)
      return
    }

    onSaveVisit({ cafeName: cafe.name, cafeAddress: cafe.address, visited, review })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{cafe?.name}</DialogTitle>
          <DialogDescription>{cafe?.address}</DialogDescription>
        </DialogHeader>
        {user ? (
          <>
            <div className="flex flex-col gap-4">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">이전 기록을 불러오는 중...</p>
              ) : (
                <>
                  <Label>
                    <Checkbox checked={visited} onCheckedChange={(checked) => setVisited(checked)} />
                    방문했어요
                  </Label>
                  <Textarea
                    value={review}
                    onChange={(event) => setReview(event.target.value)}
                    placeholder="한줄 소감을 남겨보세요"
                  />
                </>
              )}
              {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
            </div>
            <DialogFooter>
              <Button onClick={handleSaveClick} disabled={isLoading || isSaving}>
                {isSaving ? '저장 중...' : '저장'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            로그인 후 방문 여부 체크와 한줄 소감을 남길 수 있어요.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
