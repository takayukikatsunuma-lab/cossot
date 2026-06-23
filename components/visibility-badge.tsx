import { Badge } from '@/components/ui/badge'
import { Globe, Lock, Users } from 'lucide-react'
import type { Visibility } from '@/lib/types'

const config: Record<Visibility, { label: string; icon: typeof Globe; variant: 'default' | 'secondary' | 'outline' }> = {
  public: { label: '公開', icon: Globe, variant: 'secondary' },
  limited: { label: '限定公開', icon: Users, variant: 'outline' },
  private: { label: '非公開', icon: Lock, variant: 'outline' },
}

export function VisibilityBadge({ visibility }: { visibility: Visibility }) {
  const { label, icon: Icon, variant } = config[visibility]
  return (
    <Badge variant={variant} className="gap-1 text-xs font-normal">
      <Icon size={11} />
      {label}
    </Badge>
  )
}
