import { cn } from '@/utils/dom'
import { QuestionMarkCircledIcon, UpdateIcon } from '@radix-ui/react-icons'
import { HTMLAttributes } from 'react'

type Status = HTMLAttributes<HTMLDivElement> & {
  isNotFound: boolean
  isLoading: boolean
}
const Status = ({
  className,
  children,
  isNotFound,
  isLoading,
  ...rest
}: Status) => {
  const StatusIcon = isNotFound ? QuestionMarkCircledIcon : UpdateIcon
  const StatusText = isNotFound ? 'Not Found' : 'Hang on...'

  return (
    <div
      className={cn(
        'flex w-full flex-row place-content-center place-items-center gap-2 text-muted-foreground',
        !(isLoading || isNotFound) && '!hidden',
        className,
      )}
      {...rest}
    >
      <StatusIcon
        className={cn('size-4 animate-spin', isNotFound && 'animate-none')}
      />
      <span>{StatusText}</span>

      {children}
    </div>
  )
}

export default Status
