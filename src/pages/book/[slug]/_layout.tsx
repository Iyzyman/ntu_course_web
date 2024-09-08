import Course from '@/components/Course'
import Status from '@/components/Layout.Status'
import { RenderGuard } from '@/components/providers/render.provider'
import { useRootDispatch, useRootSelector } from '@/data/stores/root'
import {
  SearchActions,
  SearchSelectors,
  SourceOrigin,
} from '@/data/stores/search.slice'
import { useParams } from '@/router'
import { SearchArtifact, CourseSource, SearchCategory } from '@/types/shelvd'
import { logger } from '@/utils/debug'
import { cn } from '@/utils/dom'
import { useEffect, useMemo } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import {
  mockOrigin,
  mockSearchArtifact,
} from '../../../data/clients/mockdata.ts' // Import updated mock data

const CourseDetailsLayout = () => {
  const dispatch = useRootDispatch()
  const [current, setCurrent] = [
    useRootSelector(SearchSelectors.state).current,
    SearchActions.setCurrent,
  ]

  const { slug = '' } = useParams('/book/:slug')
  const { state } = useLocation()

  const searchCategory = SearchCategory.enum.books
  const source: CourseSource = (state?.source ?? current.source) as CourseSource

  const isValidSource = CourseSource.safeParse(source).success
  const isValidSlug = !!slug.length
  const isValidParams = isValidSlug && isValidSource

  // Use updated mock data
  const isLoading = false // Since we're using mock data, there's no loading
  const isNotFound = !isValidParams // Adjust based on your mock data structure

  // Use mock data
  const origin = mockOrigin as SourceOrigin<'hc', 'books'>
  const common = mockSearchArtifact as SearchArtifact<'books'>

  const ctx = useMemo(
    () => ({
      slug,
      source,
      category: searchCategory,
      origin,
      common,
      isNotFound,
      isLoading,
    }),
    [slug, source, searchCategory, origin, common, isNotFound, isLoading],
  )

  useEffect(() => {
    if (isLoading) return
    logger(
      { breakpoint: '[_layout.tsx:88]/CourseDetailsLayout/ctx' },
      { isLoading, ctx },
    )

    dispatch(setCurrent(ctx))
  }, [dispatch, isLoading, ctx, setCurrent])

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
        <Course book={(common as Course)!}>
          {/* HEADER */}
          <section
            style={{
              height: '302px',
              backgroundImage: `linear-gradient(to bottom, ${origin?.image.color ?? 'hsl(var(--muted))'} 0%, transparent 100%)`,
              backgroundPosition: 'top center',
              backgroundRepeat: 'no-repeat',
            }}
            className={cn('relative w-full', 'rounded-lg', 'pt-8')}
          >
            <div
              className={cn(
                'mx-auto w-11/12',
                'flex flex-col flex-wrap place-content-center place-items-center gap-8 sm:flex-row sm:place-content-start sm:place-items-start',
              )}
            >
              <aside className="flex flex-col gap-1 *:!mt-0">
                {/* {source === CourseSource.enum.hc &&
                  (origin?.featured_series?.position ?? 0) >= 1 && (
                    <Badge
                      variant="secondary"
                      className="!mb-2 w-fit"
                    >
                      {`#${origin?.featured_series?.position ?? 1} of ${origin?.featured_series?.series_books_count} in ${origin?.featured_series?.series_name}`}
                    </Badge>
                  )} */}

                <h1
                  style={{
                    fontFamily: 'Bebas Neue',
                    fontSize: '96px',
                    fontWeight: '400',
                    lineHeight: '115px',
                  }}
                >
                  {common?.code}
                </h1>
                <p>
                  <div
                    style={{
                      fontSize: '34px',
                      fontWeight: '900',
                      lineHeight: '41px',
                    }}
                  >
                    {common.title}
                  </div>
                  <small className="uppercase text-muted-foreground">
                    {common.school}
                  </small>
                </p>

                <aside>
                  <div style={{ width: '30%', marginTop: '10px' }}>
                    <Course.ClickStats
                      watchlists={common.watchlists}
                      likes={common.likes}
                    ></Course.ClickStats>
                  </div>
                </aside>
              </aside>
            </div>
          </section>

          {/* CONTENT */}
          <Outlet />
        </Course>
      </RenderGuard>
    </main>
  )
}

export default CourseDetailsLayout
