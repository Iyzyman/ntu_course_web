import { logger, LogLevel } from '@/utils/debug'
import { Component, ErrorInfo, ReactNode } from 'react'

type ErrorBoundaryProps = {
  fallback?: ReactNode
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger(
      { breakpoint: '[Error.Boundary.tsx:55]', level: LogLevel.Error },
      { error, info },
    )
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? null
    }

    return this.props.children
  }
}
