import { AppSelectors } from '@/data/stores/app.slice'
import { useRootSelector } from '@/data/stores/root'
import {
  CheckCircledIcon,
  CrossCircledIcon,
  DotsHorizontalIcon,
  InfoCircledIcon,
  QuestionMarkCircledIcon,
} from '@radix-ui/react-icons'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { themeMode } = useRootSelector(AppSelectors.state)

  return (
    <Sonner
      theme={themeMode as ToasterProps['theme']}
      className="toaster group"
      icons={{
        success: <CheckCircledIcon className="size-4" />,
        info: <InfoCircledIcon className="size-4" />,
        warning: <QuestionMarkCircledIcon className="size-4" />,
        error: <CrossCircledIcon className="size-4" />,
        loading: <DotsHorizontalIcon className="size-4" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
