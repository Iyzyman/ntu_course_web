import { Badge } from '@/components/ui/Badge'
import { env } from '@/env'
import { cn } from '@/utils/dom'
import { useNavigate } from 'react-router-dom'

export const Logo = () => {
  const navigate = useNavigate()

  return (
    <div
      className={cn('flex flex-row place-items-center gap-1', 'cursor-pointer')}
      onClick={() => {
        navigate(`/`, {
          unstable_viewTransition: true,
        })
      }}
    >
      <b
        className={cn(
          'max-w-prose text-center tracking-tight',
          'h3 sm:h2 whitespace-nowrap',
        )}
      >
        📚 shelvd
      </b>

      {env.VITE_BETA_FLAG && (
        <Badge className="-translate-y-2/4 px-1 text-[0.5rem] uppercase">
          beta
        </Badge>
      )}
    </div>
  )
}
