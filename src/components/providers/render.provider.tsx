import { ErrorBoundary } from '@/components/providers/error.provider'
import { FC, PropsWithChildren, ReactNode, useEffect, useState } from 'react'

interface RenderGuardProps extends PropsWithChildren {
  renderIf?: boolean
  fallback?: ReactNode
}

export const RenderGuard: FC<RenderGuardProps> = ({
  children,
  renderIf = true,
  fallback,
}: RenderGuardProps) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [mounted])

  if (!mounted) return null
  return (
    <ErrorBoundary fallback={fallback}>
      {renderIf ? children : fallback ?? null}
    </ErrorBoundary>
  )
}
