import Course from '@/components/Course'
import Status from '@/components/Layout.Status'
import { RenderGuard } from '@/components/providers/render.provider'
import { useRootDispatch, useRootSelector } from '@/data/stores/root'
import { SearchActions, SearchSelectors } from '@/data/stores/search.slice'
import { useParams } from '@/router'
import { CourseSource, SearchCategory } from '@/types/shelvd'
import { logger } from '@/utils/debug'
import { cn } from '@/utils/dom'
import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useCourseDetailData } from '@/components/hooks/useCourseFinderHooks.tsx'
import { HardcoverUtils } from '@/utils/clients/hardcover.ts'

const CourseDetailsLayout = () => {
  const dispatch = useRootDispatch()
  const [current, setCurrent] = [
    useRootSelector(SearchSelectors.state).current,
    SearchActions.setCurrent,
  ]

  const { slug = '' } = useParams('/course/:slug')
  const { state } = useLocation()

  const searchCategory = SearchCategory.enum.courses
  const source: CourseSource = (state?.source ?? current.source) as CourseSource

  const isValidSource = CourseSource.safeParse(source).success
  const isValidSlug = !!slug.length
  const isValidParams = isValidSlug && isValidSource

  const {
    data,
    isSuccess,
    isLoading: isLoadingDetails,
    isFetching,
  } = useCourseDetailData(slug)

  const isLoading = isLoadingDetails || isFetching
  const isNotFound =
    !isValidParams || (!isLoading && !isSuccess && (data?.found ?? 0) < 1)

  // Use mock data
  const [origin, setOrigin] = useState<Course | null>(null)
  const [common, setCommon] = useState<Course | null>(null)

  useEffect(() => {
    if (data) {
      const parsedCourse = HardcoverUtils.parseCourse(data)
      setOrigin(parsedCourse)
      setCommon(parsedCourse) // Update common as needed
    }
  }, [data])

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
    [slug, source, common, searchCategory, origin, isNotFound, isLoading],
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
        <Course course={(origin as Course)!}>
          {/* HEADER */}
          <section
            style={{
              height: '302px',
              backgroundImage: `linear-gradient(to bottom, ${origin?.color ?? 'hsl(var(--muted))'} 0%, transparent 100%)`,
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
                <h1
                  style={{
                    fontFamily: 'Bebas Neue',
                    fontSize: '96px',
                    fontWeight: '400',
                    lineHeight: '115px',
                  }}
                >
                  {origin?.code}
                </h1>
                <p>
                  <div
                    style={{
                      fontSize: '34px',
                      fontWeight: '900',
                      lineHeight: '41px',
                    }}
                  >
                    {origin?.title}
                  </div>
                  <small className="uppercase text-muted-foreground">
                    {origin?.school}
                  </small>
                </p>

                <aside>
                  <div style={{ width: '30%', marginTop: '10px' }}>
                    <Course.ClickStats
                      course_code={origin?.code || ''}
                      watchlists={origin?.watchlists || 0}
                      likes={origin?.likes || 0}
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
