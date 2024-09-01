import Author from '@/components/Author'
import Status from '@/components/Layout.Status'
import { RenderGuard } from '@/components/providers/render.provider'
import { HardcoverEndpoints } from '@/data/clients/hardcover.api'
import { useRootDispatch, useRootSelector } from '@/data/stores/root'
import {
  SearchActions,
  SearchSelectors,
  SourceOrigin,
} from '@/data/stores/search.slice'
import { Navigate, useParams } from '@/router'
import { Hardcover } from '@/types'
import {
  BookSource,
  SearchArtifact,
  SearchCategory,
  Author as zAuthor,
} from '@/types/shelvd'
import { HardcoverUtils } from '@/utils/clients/hardcover'
import { logger } from '@/utils/debug'
import { cn } from '@/utils/dom'
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

const AuthorDetailsLayout = () => {
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

  const searchCategory = SearchCategory.enum.authors
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

  let origin: SourceOrigin<'hc', 'authors'> = current.origin as SourceOrigin<
    'hc',
    'authors'
  >
  let common: SearchArtifact<'authors'> =
    current.common as SearchArtifact<'authors'>

  const hit = (results?.hits ?? [])?.[0]
  if (hit) {
    const document = hit.document as Hardcover.SearchAuthor
    const hcAuthor = HardcoverUtils.parseAuthorDocument({ document })
    const author: Author = HardcoverUtils.parseAuthor(hcAuthor)

    origin = document
    common = author
    isNotFound = !zAuthor.safeParse(common).success
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
      { breakpoint: '[_layout.tsx:88]/AuthorDetailsLayout/ctx' },
      { isLoading, ctx },
    )

    dispatch(setCurrent(ctx))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isLoading])

  //#endregion  //*======== QUERIES ===========

  if (!isValidParams)
    return (
      <Navigate
        to={{
          pathname: '/search/:category',
        }}
        params={{
          category: searchCategory,
        }}
        unstable_viewTransition
      />
    )
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
            isLoading={isLoading}
            isNotFound={isNotFound}
          />
        }
      >
        <Author author={(common as Author)!}>
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
              <Author.Image />

              <aside className="flex flex-col gap-1 *:!mt-0">
                <h1>{common?.name ?? ''}</h1>

                <p>
                  {common?.name ?? ''} has written at least{' '}
                  {common?.booksCount ?? 0} books.
                </p>
              </aside>
            </div>
          </section>

          {/* CONTENT */}
          <Outlet />
        </Author>
      </RenderGuard>
    </main>
  )
}

export default AuthorDetailsLayout
