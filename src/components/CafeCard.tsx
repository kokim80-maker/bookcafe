import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Cafe } from '@/types/cafe'

interface CafeCardProps {
  cafe: Cafe
}

export function CafeCard({ cafe }: CafeCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{cafe.name}</CardTitle>
        <span className="text-xs text-muted-foreground">{cafe.category}</span>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{cafe.address}</p>
      </CardContent>
    </Card>
  )
}
