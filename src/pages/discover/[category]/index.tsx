import Book from '@/components/Book'
import Status from '@/components/Layout.Status'
import { RenderGuard } from '@/components/providers/render.provider'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/Pagination'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { HardcoverEndpoints } from '@/data/clients/hardcover.api'
import { Navigate, useNavigate, useParams } from '@/router'
import { Hardcover } from '@/types'
import { cn } from '@/utils/dom'
import { getRangedArray, getSegmentedArray } from '@/utils/helpers'
import { useEffect, useState } from 'react'

const ListCategoryPage = () => {
  const navigate = useNavigate()

  //#endregion  //*======== PARAMS ===========
  const { category = Hardcover.DefaultListCategory } = useParams(
    '/discover/:category',
  )

  const isValidCategory = Hardcover.ListCategory.safeParse(category).success
  const isValidParams = isValidCategory
  //#endregion  //*======== PARAMS ===========

  //#endregion  //*======== STATES ===========
  const [pageIdx, setPageIdx] = useState<number>(0)

  const reset = () => {
    setPageIdx(0)
  }

  // reset pagination on mount
  useEffect(() => {
    reset()
  }, [])
  //#endregion  //*======== STATES ===========

  //#endregion  //*======== QUERIES ===========
  const { lists } = HardcoverEndpoints
  const {
    data,
    isSuccess,
    isLoading: isLoadingLists,
    isFetching: isFetchingLists,
  } = lists.useQuery(
    {
      category: category as Hardcover.ListCategory,
    },
    {
      skip: !isValidCategory,
    },
  )

  const results = (data?.results ?? []) as Hardcover.List[]
  const isLoading = isLoadingLists || isFetchingLists
  const isNotFound =
    !isValidParams || (!isLoading && !isSuccess && !results.length)

  //#endregion  //*======== QUERIES ===========

  //#endregion  //*======== PAGINATION ===========
  const segmentLimit = 10
  const segments: Hardcover.List[][] = getSegmentedArray(results, segmentLimit)
  const segment: Hardcover.List[] = segments?.[pageIdx] ?? []

  const maxPageIdx = segments.length - 1
  const isPaginationDisabled = maxPageIdx < 1 || !segment.length
  const isFirstPage = pageIdx === 0
  const isNextDisabled = pageIdx + 1 > maxPageIdx
  const isPrevDisabled = isFirstPage

  const pages = {
    prev: isPrevDisabled ? pageIdx : pageIdx - 1,
    next: isNextDisabled ? maxPageIdx : pageIdx + 1,
    max: maxPageIdx,
  }

  const ranges = getRangedArray({
    min: pages.prev,
    max: pages.next,
  })

  const isEllipsisDisabled = !(
    !isNextDisabled &&
    ranges.length < 3 &&
    pages.next !== pages.max
  )

  const onPageChange = (page: number) => {
    const isCurrentPage: boolean = page === pageIdx
    if (isCurrentPage) return

    const isValidPage: boolean = page >= 0 && page <= maxPageIdx
    if (!isValidPage) page = 0

    setPageIdx(page)
  }
  const onPagePrevious = () => onPageChange(pages.prev)
  const onPageNext = () => onPageChange(pages.next)
  //#endregion  //*======== PAGINATION ===========

  if (!isValidParams)
    return (
      <Navigate
        to={{
          pathname: '/discover',
        }}
        unstable_viewTransition
      />
    )
  return (
    <main className="page-container flex flex-col place-items-center gap-8 *:w-full">
      <RenderGuard
        renderIf={!isNotFound}
        fallback={
          <Status
            isLoading={isLoading}
            isNotFound={isNotFound}
          />
        }
      >
        {/* HEADER */}
        <section
          style={{
            backgroundImage: `linear-gradient(to bottom, hsl(var(--muted)) 0%, transparent 70%)`,
            backgroundPosition: 'top center',
            backgroundRepeat: 'no-repeat',
          }}
          className={cn(
            'relative w-full',
            'rounded-lg',

            'pt-8',
          )}
        >
          <div
            className={cn(
              'mx-auto w-11/12',
              'flex flex-col flex-wrap place-content-center place-items-center gap-8 sm:flex-row sm:place-content-start sm:place-items-start',
            )}
          >
            <aside className="flex flex-col gap-1 *:!mt-0">
              <h1>Discover Lists ✨</h1>

              <p className="leading-tight text-muted-foreground">
                Browse our catalogue of user curated lists to find your next
                read.
              </p>
            </aside>
          </div>
        </section>

        <Tabs
          defaultValue={Hardcover.DefaultListCategory}
          value={category}
          onValueChange={(c) => {
            const isValidPeriod = Hardcover.ListCategory.safeParse(c).success
            if (!isValidPeriod) return

            navigate(
              {
                pathname: '/discover/:category',
              },
              {
                params: {
                  category: c,
                },
                unstable_viewTransition: true,
              },
            )
          }}
          className={cn('w-full py-4')}
        >
          <TabsList
            className={cn(
              '!h-auto !rounded-none border-b !bg-transparent pb-0',
              '*:rounded-b-none *:border-b *:!bg-transparent *:transition-all',
              'flex w-full flex-row !place-content-start place-items-center gap-x-8',

              'overflow-x-auto',
            )}
          >
            {Hardcover.ListCategory.options.map((category) => (
              <TabsTrigger
                key={`lists-tab-${category}`}
                value={category}
                className={cn(
                  'capitalize',
                  '!rounded-none data-[state=active]:border-primary',
                )}
              >
                <span className="h4 capitalize">{category}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* CONTENT */}
          <TabsContent value={category}>
            <Book.BookMatrix displayCategoryLists={segment} category={category}></Book.BookMatrix>

            <Pagination className={cn(isPaginationDisabled && 'hidden')}>
              <PaginationContent className="m-0">
                <PaginationItem
                  className={cn(
                    isPrevDisabled && 'cursor-not-allowed opacity-50',
                  )}
                  onClick={() => {
                    if (isPrevDisabled) return
                    onPagePrevious()
                  }}
                >
                  <PaginationPrevious className="max-sm:!px-2 max-sm:[&>span]:hidden" />
                </PaginationItem>

                {ranges.map((pgIdx) => (
                  <PaginationItem
                    key={`lists-${category}-page-${pgIdx}`}
                    onClick={() => {
                      onPageChange(pgIdx)
                    }}
                  >
                    <PaginationLink isActive={pgIdx === pageIdx}>
                      {pgIdx + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem
                  className={cn(isEllipsisDisabled && 'hidden')}
                  onClick={() => {
                    if (isEllipsisDisabled) return
                    onPageNext()
                  }}
                >
                  <PaginationEllipsis />
                </PaginationItem>

                <PaginationItem
                  className={cn(
                    isNextDisabled && 'cursor-not-allowed opacity-50',
                  )}
                  onClick={() => {
                    if (isNextDisabled) return
                    onPageNext()
                  }}
                >
                  <PaginationNext className="max-sm:!px-2 max-sm:[&>span]:hidden" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </TabsContent>
        </Tabs>
      </RenderGuard>
    </main>
  )
}

export default ListCategoryPage
