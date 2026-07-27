import { useCallback, useState } from 'react'
import { Header } from '@/components/Header'
import { MapView } from '@/components/MapView'
import { CafeListSection } from '@/components/CafeListSection'
import { FailedAddressList } from '@/components/FailedAddressList'
import { CafeVisitDialog, type VisitDraft } from '@/components/CafeVisitDialog'
import { VisitedCafeList } from '@/components/VisitedCafeList'
import { mockCafes } from '@/data/mockCafes'
import { parseCafeExcelFile } from '@/lib/excel'
import { buildCafesFromExcelRows } from '@/lib/geocode'
import type { VisitedCafeRecord } from '@/lib/visitNotes'
import type { Cafe } from '@/types/cafe'

function App() {
  const [cafes, setCafes] = useState<Cafe[]>(mockCafes)
  const [isProcessingExcel, setIsProcessingExcel] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null)
  const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false)
  const [focusTarget, setFocusTarget] = useState<{ lat: number; lng: number } | null>(null)
  const [visitedListRefreshKey, setVisitedListRefreshKey] = useState(0)

  async function handleExcelFileSelected(file: File) {
    setIsProcessingExcel(true)
    setUploadError(null)
    setProgress(null)

    try {
      const rows = await parseCafeExcelFile(file)
      const nextCafes = await buildCafesFromExcelRows(rows, (done, total) =>
        setProgress({ done, total }),
      )
      setCafes(nextCafes)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : '엑셀 업로드 중 오류가 발생했습니다.')
    } finally {
      setIsProcessingExcel(false)
      setProgress(null)
    }
  }

  const handleMarkerClick = useCallback((cafe: Cafe) => {
    setSelectedCafe(cafe)
    setIsVisitDialogOpen(true)
  }, [])

  function handleSaveVisit(draft: VisitDraft) {
    console.log('방문 기록 저장됨', draft)
    setVisitedListRefreshKey((key) => key + 1)
  }

  function handleSelectVisitedCafe(record: VisitedCafeRecord) {
    if (record.lat === null || record.lng === null) return
    setFocusTarget({ lat: record.lat, lng: record.lng })
  }

  const failedCafes = cafes.filter((cafe) => cafe.geocodeStatus === 'failed')

  return (
    <div className="mx-auto flex min-h-svh max-w-5xl flex-col">
      <Header onExcelFileSelected={handleExcelFileSelected} isProcessingExcel={isProcessingExcel} />
      <main className="flex flex-1 flex-col gap-6 px-6 py-6 md:flex-row">
        <div className="flex flex-1 flex-col gap-6">
          {progress && (
            <p className="text-sm text-muted-foreground">
              주소 변환 중... ({progress.done}/{progress.total})
            </p>
          )}
          {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
          <MapView cafes={cafes} onMarkerClick={handleMarkerClick} focusTarget={focusTarget} />
          {failedCafes.length > 0 && <FailedAddressList cafes={failedCafes} />}
          <CafeListSection cafes={cafes} />
        </div>
        <VisitedCafeList onSelectVisitedCafe={handleSelectVisitedCafe} refreshKey={visitedListRefreshKey} />
      </main>
      <CafeVisitDialog
        cafe={selectedCafe}
        open={isVisitDialogOpen}
        onOpenChange={setIsVisitDialogOpen}
        onSaveVisit={handleSaveVisit}
      />
    </div>
  )
}

export default App
