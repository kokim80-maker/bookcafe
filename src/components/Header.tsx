import { useRef, useState, type ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { AuthDialog } from '@/components/AuthDialog'
import { useAuth } from '@/lib/auth'

interface HeaderProps {
  onExcelFileSelected: (file: File) => void
  isProcessingExcel: boolean
}

export function Header({ onExcelFileSelected, isProcessingExcel }: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)
  const { user, signOut } = useAuth()

  function handleExcelButtonClick() {
    fileInputRef.current?.click()
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // 같은 파일을 연달아 선택해도 change 이벤트가 다시 발생하도록 매번 리셋
    event.target.value = ''
    if (file) {
      onExcelFileSelected(file)
    }
  }

  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <h1 className="text-lg font-semibold">우리 동네 카페 지도</h1>
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileInputChange}
        />
        <Button variant="outline" onClick={handleExcelButtonClick} disabled={isProcessingExcel}>
          {isProcessingExcel ? '업로드 중...' : '엑셀 업로드'}
        </Button>
        {user ? (
          <>
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" onClick={signOut}>
              로그아웃
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsAuthDialogOpen(true)}>로그인</Button>
        )}
      </div>
      <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
    </header>
  )
}
