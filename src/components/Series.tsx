import Course from '@/components/Course'
import { RenderGuard } from '@/components/providers/render.provider'
import { HardcoverEndpoints } from '@/data/clients/hardcover.api'
import { Series as SeriesInfo } from '@/types/shelvd'
import { HardcoverUtils } from '@/utils/clients/hardcover'
import { getLimitedArray } from '@/utils/helpers'
import { PropsWithChildren, createContext, useContext, useMemo } from 'react'

export type Series = SeriesInfo

//#endregion  //*======== CONTEXT ===========
type SeriesContext = {
  series: Series
  isSkeleton?: boolean
  onNavigate: () => void
}
const SeriesContext = createContext<SeriesContext | undefined>(undefined)
const useSeriesContext = () => {
  const ctxValue = useContext(SeriesContext)
  if (ctxValue === undefined) {
    throw new Error(
      'Expected an Context Provider somewhere in the react tree to set context value',
    )
  }
  return ctxValue
}
//#endregion  //*======== CONTEXT ===========

//#endregion  //*======== PROVIDER ===========
type SeriesProvider = PropsWithChildren & Omit<SeriesContext, 'onNavigate'>
export const Series = ({ children, ...value }: SeriesProvider) => {
  // const navigate = useNavigate()

  const onNavigate = () => {
    if (!value?.series) return
    // navigate(
    //   {
    //     pathname: '/series/:slug?',
    //   },
    //   {
    //     state: {
    //       source: value.series.source,
    //     },
    //     params: {
    //       slug: value.series?.slug ?? value.series.key,
    //     },
    //     unstable_viewTransition: true,
    //   },
    // )
  }

  const isValid = SeriesInfo.safeParse(value?.series ?? {}).success
  return (
    <SeriesContext.Provider
      value={{
        isSkeleton: !isValid,
        onNavigate,
        ...value,
      }}
    >
      <RenderGuard renderIf={isValid}>{children}</RenderGuard>
    </SeriesContext.Provider>
  )
}
//#endregion  //*======== PROVIDER ===========

//#endregion  //*======== COMPONENTS ===========

type SeriesCourses = PropsWithChildren & {
  displayLimit?: number
}
export const SeriesCourses = ({ displayLimit, children }: SeriesCourses) => {
  const {
    series: { titles, source, ...series },
  } = useSeriesContext()

  //#endregion  //*======== SOURCE/HC ===========

  const { searchExactBulk: hcSearchExactBulk } = HardcoverEndpoints
  const hcSearchCourses = hcSearchExactBulk.useQuery(
    titles.map((title) => ({
      category: 'courses',
      q: title,
    })),
    {
      skip: source !== 'hc' || !titles.length,
    },
  )

  const hcCourses: Course[] = useMemo(() => {
    const { data, isSuccess } = hcSearchCourses

    const results = data?.results ?? []
    const isLoading = hcSearchCourses.isLoading || hcSearchCourses.isFetching
    const isNotFound = !isLoading && !isSuccess && results.length < 1
    if (isNotFound) return []

    const courses: Course[] = results.map((result) => {
      // exact search expects top hit accuracy
      const hit = (result?.hits ?? [])?.[0]
      const course = HardcoverUtils.parseDocument({
        category: 'courses',
        hit,
      }) as Course
      return course
    })
    return courses
  }, [hcSearchCourses])
  //#endregion  //*======== SOURCE/HC ===========

  const courses = useMemo(() => {
    let courses: Course[] = []
    switch (source) {
      case 'hc': {
        courses = hcCourses
      }
    }

    if (displayLimit) {
      courses = getLimitedArray(courses, displayLimit)
    }
    return courses
  }, [source, displayLimit, hcCourses])

  if (!courses.length) return null

  return courses.map((course, idx) => (
    <Course
      key={`${series.key}-${source}-${idx}-${course.key}`}
      course={course!}
    >
      {children}
    </Course>
  ))
}

Series.Courses = SeriesCourses

//#endregion  //*======== COMPONENTS ===========

export default Series
