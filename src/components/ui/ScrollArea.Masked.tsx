import { cn } from '@/utils/dom'
import { logger } from '@/utils/debug'
import { VariantProps, cva } from 'class-variance-authority'
import { HTMLAttributes, useEffect, useRef, useState } from 'react'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from '@radix-ui/react-icons'

const ScrollAreaMaskedVariant = cva('transition-all', {
  variants: {
    variant: {
      vertical: 'flex-col overflow-y-auto masked-overflow',
      horizontal: 'flex-row overflow-x-auto w-full masked-overflow-horizontal',
    },
  },
  defaultVariants: {
    variant: 'horizontal',
  },
})

const ScrollAreaMaskedControlsVariant = cva(
  'absolute z-20 disabled:hidden flex place-content-center place-items-center',
  {
    variants: {
      variant: {
        vertical: 'inset-x-0 w-full [&>svg]:rotate-90',
        horizontal: 'inset-y-0 w-12',
      },
    },
    defaultVariants: {
      variant: 'horizontal',
    },
  },
)

type ScrollAreaMasked = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof ScrollAreaMaskedVariant> & {
    scroller?: HTMLAttributes<HTMLDivElement>
    options?: Partial<{
      scrollThreshold: number
    }>
  }
export const ScrollAreaMasked = ({
  variant = 'horizontal',
  children,
  className,
  scroller: { className: scrollerClassName, ...scrollerProps } = {},
  options = {
    scrollThreshold: 0.1,
  },
  ...rest
}: ScrollAreaMasked) => {
  const { scrollThreshold = 0.1 } = options
  const refScroller = useRef<HTMLDivElement>(null)
  const [[hideOverflowMaskStart, hideOverflowMaskEnd], setShowOverflowMask] =
    useState<[boolean, boolean]>([true, false])

  const isHorizontalScroll =
    (refScroller?.current?.scrollWidth ?? 0) >
    (refScroller?.current?.clientWidth ?? 0)
  const isVerticalScroll =
    (refScroller?.current?.scrollHeight ?? 0) >
    (refScroller?.current?.clientHeight ?? 0)
  const isScrollable =
    variant === 'horizontal' ? isHorizontalScroll : isVerticalScroll || true

  useEffect(() => {
    if (!refScroller?.current) return

    if (variant === 'vertical') refScroller.current.scrollTop = 0
    if (variant === 'horizontal') refScroller.current.scrollLeft = 0
  }, [variant])

  const ChevronStartIcon =
    variant === 'horizontal' ? ChevronLeftIcon : ChevronUpIcon
  const ChevronEndIcon =
    variant === 'horizontal' ? ChevronRightIcon : ChevronDownIcon

  return (
    <div
      className={cn('relative', className)}
      {...rest}
    >
      <button
        className={cn(
          ScrollAreaMaskedControlsVariant({ variant }),
          variant === 'horizontal' ? 'left-0' : 'top-0',
        )}
        disabled={hideOverflowMaskStart || !isScrollable}
        onClick={() => {
          if (!refScroller?.current || hideOverflowMaskStart) return
          logger(
            { breakpoint: '[ScrollArea.Masked.tsx:50]' },
            {
              current: refScroller.current,
              states: [hideOverflowMaskStart, hideOverflowMaskEnd],
            },
          )

          if (variant === 'horizontal') {
            const { scrollLeft, scrollWidth } = refScroller.current
            let prevScrollLeft = scrollLeft - scrollWidth * scrollThreshold
            const minScrollLeft = 0
            const isStart = prevScrollLeft <= minScrollLeft
            if (isStart) prevScrollLeft = minScrollLeft

            refScroller.current.scrollLeft = prevScrollLeft
          } else {
            const { scrollTop, scrollHeight } = refScroller.current
            let prevScrollTop = scrollTop - scrollHeight * (scrollThreshold / 2)
            const minScrollTop = 0
            const isStart = prevScrollTop <= minScrollTop
            if (isStart) prevScrollTop = minScrollTop

            refScroller.current.scrollTop = prevScrollTop
          }
        }}
      >
        <ChevronStartIcon className="h-8 w-8 text-muted-foreground" />
      </button>
      <button
        className={cn(
          ScrollAreaMaskedControlsVariant({ variant }),
          variant === 'horizontal' ? 'right-0' : 'bottom-0',
        )}
        disabled={hideOverflowMaskEnd || !isScrollable}
        onClick={() => {
          if (!refScroller?.current || hideOverflowMaskEnd) return

          if (variant === 'horizontal') {
            const { scrollLeft, scrollWidth, clientWidth } = refScroller.current
            let nextScrollLeft = scrollLeft + scrollWidth * scrollThreshold
            const maxScrollLeft = scrollWidth - clientWidth
            const isEnd = nextScrollLeft >= maxScrollLeft
            if (isEnd) nextScrollLeft = maxScrollLeft

            refScroller.current.scrollLeft = nextScrollLeft
          } else {
            const { scrollTop, scrollHeight, clientHeight } =
              refScroller.current
            let nextScrollTop = scrollTop + scrollHeight * (scrollThreshold / 2)
            const maxScrollTop = scrollHeight - clientHeight
            const isEnd = nextScrollTop >= maxScrollTop
            if (isEnd) nextScrollTop = maxScrollTop

            refScroller.current.scrollTop = nextScrollTop
          }
        }}
      >
        <ChevronEndIcon className="h-8 w-8 text-muted-foreground" />
      </button>

      <div
        ref={refScroller}
        onScroll={(event) => {
          if (!event?.currentTarget) return

          if (variant === 'horizontal') {
            const { scrollWidth, clientWidth, scrollLeft } = event.currentTarget
            const isStart = scrollLeft === 0
            const isEnd = scrollWidth - clientWidth === scrollLeft
            setShowOverflowMask([isStart, isEnd])
          } else {
            const { scrollHeight, clientHeight, scrollTop } =
              event.currentTarget
            const isStart = scrollTop === 0
            const isEnd = scrollHeight - clientHeight === scrollTop
            setShowOverflowMask([isStart, isEnd])

            logger(
              { breakpoint: '[ScrollArea.Masked.tsx:105]' },
              {
                scrollTop,
                isEnd,
                isStart,
              },
            )
          }
        }}
        className={cn(
          'relative',
          'flex flex-nowrap place-content-start place-items-center gap-4',
          'snap-both snap-mandatory scroll-py-20',
          '*:shrink-0 *:snap-center *:snap-always',

          ScrollAreaMaskedVariant({ variant, className: scrollerClassName }),
          isScrollable &&
            hideOverflowMaskStart &&
            (variant === 'horizontal'
              ? 'masked-overflow-horizontal-right'
              : 'masked-overflow-top'),
          isScrollable &&
            hideOverflowMaskEnd &&
            (variant === 'horizontal'
              ? 'masked-overflow-horizontal-left'
              : 'masked-overflow-bottom'),
        )}
        {...scrollerProps}
      >
        {children}
      </div>
    </div>
  )
}
