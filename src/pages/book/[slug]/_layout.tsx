import Book from '@/components/Book'
import Status from '@/components/Layout.Status'
import { RenderGuard } from '@/components/providers/render.provider'
import { Badge } from '@/components/ui/Badge'
import { HardcoverEndpoints } from '@/data/clients/hardcover.api'
import { useRootDispatch, useRootSelector } from '@/data/stores/root'
import {
  SearchActions,
  SearchSelectors,
  SourceOrigin,
} from '@/data/stores/search.slice'
import { Link, useParams } from '@/router'
import { Hardcover } from '@/types'
import {
  BookSource,
  SearchArtifact,
  SearchCategory,
  Book as zBook,
} from '@/types/shelvd'
import { HardcoverUtils } from '@/utils/clients/hardcover'
import { logger } from '@/utils/debug'
import { cn } from '@/utils/dom'
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

const BookDetailsLayout = () => {
  //#endregion  //*======== STORE ===========
  const dispatch = useRootDispatch()
  const [current, setCurrent] = [
    useRootSelector(SearchSelectors.state).current,
    SearchActions.setCurrent,
  ]
  //#endregion  //*======== STORE ===========

  //#endregion  //*======== PARAMS ===========
  const { slug = '' } = useParams('/book/:slug')
  const { state } = useLocation()

  const searchCategory = SearchCategory.enum.books
  const source: BookSource = (state?.source ?? current.source) as BookSource

  const isValidSource = BookSource.safeParse(source).success
  const isValidSlug = !!slug.length
  const isValidParams = isValidSlug && isValidSource
  //#endregion  //*======== PARAMS ===========

  //#endregion  //*======== QUERIES ===========
  const { searchExact } = HardcoverEndpoints
  const {
    data,
    isSuccess,
    isLoading: isLoadingBook,
    isFetching,
  } = searchExact.useQuery(
    {
      category: searchCategory,
      q: slug,
    },
    {
      skip: !isValidParams || source !== 'hc',
    },
  )

  const results = data?.results?.[0]
  const isLoading = isLoadingBook || isFetching
  let isNotFound =
    !isValidParams || (!isLoading && !isSuccess && (results?.found ?? 0) < 1)

  let origin: SourceOrigin<'hc', 'books'> = current.origin as SourceOrigin<
    'hc',
    'books'
  >
  let common: SearchArtifact<'books'> =
    current.common as SearchArtifact<'books'>

  const hit = (results?.hits ?? [])?.[0]
  if (hit) {
    const document = hit.document as Hardcover.SearchBook
    const hcBook = HardcoverUtils.parseBookDocument({ document })
    const book: Book = HardcoverUtils.parseBook(hcBook)

    origin = document
    common = book
    isNotFound = !zBook.safeParse(common).success
  }

  const ctx: typeof current = {
    slug,
    source,
    category: searchCategory,

    origin,
    common,

    isNotFound,
    isLoading,
  }

  useEffect(() => {
    if (isLoading) return
    logger(
      { breakpoint: '[_layout.tsx:88]/BookDetailsLayout/ctx' },
      { isLoading, ctx },
    )

    dispatch(setCurrent(ctx))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isLoading])

  //#endregion  //*======== QUERIES ===========

  return (
    <main
      className={cn(
        'page-container',
        'flex flex-col gap-8',
        'place-items-center',
        '*:w-full',
      )}
    >
      <RenderGuard
        renderIf={!isNotFound}
        fallback={
          <Status
            isNotFound={isNotFound}
            isLoading={isLoading}
          />
        }
      >
        <Book book={(common as Book)!}>
          {/* HEADER */}
          <section
            style={{
              backgroundImage: `linear-gradient(to bottom, ${origin?.image?.color ?? 'hsl(var(--muted))'} 0%, transparent 70%)`,
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
              <Book.Image className={cn('h-auto w-32 sm:w-40')} />

              <aside className="flex flex-col gap-1 *:!mt-0">
                {source === BookSource.enum.hc &&
                  (origin?.featured_series?.position ?? 0) >= 1 && (
                    <Badge
                      variant="secondary"
                      className="!mb-2 w-fit"
                    >
                      {`#${origin?.featured_series?.position ?? 1} of ${origin?.featured_series?.series_books_count} in ${origin?.featured_series?.series_name}`}
                    </Badge>
                  )}

                <h1>{common?.title}</h1>
                <p>
                  <small className="uppercase text-muted-foreground">by</small>
                  &nbsp;
                  <Link
                    to={{
                      pathname: '/author/:slug',
                    }}
                    params={{
                      slug: common?.author?.slug ?? common?.author?.key ?? '',
                    }}
                    state={{
                      source,
                    }}
                    unstable_viewTransition
                  >
                    <span
                      className={cn(
                        'capitalize',
                        'cursor-pointer underline-offset-4 hover:underline',
                      )}
                    >
                      {common?.author?.name ?? ''}
                    </span>
                  </Link>
                </p>

                {/* <SignedIn> */}
                <aside>
                  <Book.DropdownMenu />
                </aside>
                {/* </SignedIn> */}
              </aside>
            </div>
          </section>

          {/* CONTENT */}
          <Outlet />
        </Book>
      </RenderGuard>
    </main>
  )
}

export default BookDetailsLayout
