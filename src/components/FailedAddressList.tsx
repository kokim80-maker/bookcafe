import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Cafe } from '@/types/cafe'

interface FailedAddressListProps {
  cafes: Cafe[]
}

export function FailedAddressList({ cafes }: FailedAddressListProps) {
  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-destructive">주소를 찾지 못한 카페 ({cafes.length}건)</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
          {cafes.map((cafe) => (
            <li key={cafe.id}>
              {cafe.name} — {cafe.address}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
