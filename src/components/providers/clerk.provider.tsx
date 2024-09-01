import { BadgeVariants } from '@/components/ui/Badge'
import { ButtonVariants } from '@/components/ui/Button'
import { env } from '@/env'
import { cn } from '@/utils/dom'
import { ClerkProvider as Clerk, ClerkLoaded } from '@clerk/clerk-react'
import { PropsWithChildren } from 'react'

export const ClerkProvider = ({ children }: PropsWithChildren) => {
  return (
    <Clerk
      publishableKey={env.VITE_CLERK_PUBLISHABLE_KEY}
      appearance={{
        layout: {
          logoPlacement: 'none',
        },
        elements: {
          card: '[&>*:last-child]:hidden',
          formButtonPrimary: cn(
            ButtonVariants({
              variant: 'secondary',
              size: 'sm',
            }),
            'invert dark:invert-0',
          ),
          footerActionLink: 'text-secondary underline-offset-4 hover:underline',
          profileSectionPrimaryButton: 'text-secondary',
          badge: BadgeVariants({
            variant: 'secondary',
          }),
          formButtonReset: 'text-secondary',
          formFieldInput: 'accent-background',
          userButtonOuterIdentifier: 'text-foreground',
          userButtonBox: 'flex-row-reverse',
        },
      }}
    >
      <ClerkLoaded>{children}</ClerkLoaded>
    </Clerk>
  )
}
