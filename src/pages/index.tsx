import { Course } from '@/components/Course'
import {
  useDiscoveryData,
  useTrendingData,
} from '@/components/hooks/useCourseFinderHooks'
import { RenderGuard } from '@/components/providers/render.provider'
import { Separator } from '@/components/ui/Separator'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Link } from '@/router'
import { CourseItem } from '@/types'
import { TrendPeriod, TrendPeriodTitle } from '@/types/courseitem'
import { Course as zCourse } from '@/types/cf'
import { CourseItemUtils } from '@/utils/clients/courseitem'
import { cn } from '@/utils/dom'
import { getLimitedArray, getShuffledArray } from '@/utils/helpers'
import { ComponentProps, HTMLAttributes, useState } from 'react'
import Marquee from 'react-fast-marquee'

export const Loader = () => 'Route loader'
export const Action = () => 'Route action'
export const Catch = () => <div>Something went wrong...</div>

export const Pending = () => <div>Loading...</div>

const IndexPage = () => {
  return (
    <main className="page-container my-16 flex flex-col gap-24">
      <section>
        <header className="flex flex-col place-items-center gap-10 *:w-full">
          <h1 className="inline-flex flex-col gap-2">
            <span>Don’t know which courses to take?</span>
            <span>Find courses that suits you.</span>
            <span>Save those interesting ones.</span>
            <span>
              Tell us why the course is good{' '}
              <span className="text-muted-foreground">(or bad)</span>.
            </span>
          </h1>
          <Separator />
          {/* <small className='text-center uppercase leading-none tracking-snug text-muted-foreground truncate text-pretty'>The social network for course lovers</small> */}
        </header>

        <div></div>
      </section>

      <TrendingPreview />

      <FeaturedListsPreviewSection />
    </main>
  )
}

export const FeaturedListsPreviewSection = () => {
  const category = CourseItem.ListCategory.enum.discover

  //#endregion  //*======== QUERIES ===========
  const { data } = useDiscoveryData()
  const categoryLists: CourseItem.List[] = (data ?? []) as CourseItem.List[]
  const displayLimit = 4
  const displayCategoryLists: CourseItem.List[] = getLimitedArray(
    categoryLists,
    displayLimit,
  )
  //#endregion  //*======== QUERIES ===========

  return (
    <section className="flex flex-col gap-8">
      <header>
        <Link
          to={{
            pathname: '/discover',
          }}
          unstable_viewTransition
        >
          <p className="h3 flex-1 cursor-pointer truncate uppercase leading-none tracking-tight">
            Discover Courses
          </p>
          <p className="small font-light normal-case text-muted-foreground">
            Browse through our courses by faculties.
          </p>
        </Link>
        <Separator className="mt-2" />
      </header>
      <Course.CourseMatrix
        displayCategoryLists={displayCategoryLists}
        category={category}
      ></Course.CourseMatrix>
    </section>
  )
}

type TrendingPreviewSection = {
  courses: Course[]
  displayLimit?: number
  marquee?: ComponentProps<typeof Marquee>
} & HTMLAttributes<HTMLDivElement>
export const TrendingPreviewSection = ({
  courses,
  displayLimit = 12,
  className,
  children,
  marquee,
}: TrendingPreviewSection) => {
  const displayCourses = getLimitedArray(courses, displayLimit)
  return (
    <Marquee
      pauseOnHover
      pauseOnClick
      autoFill
      gradient
      gradientColor="#020817"
      className={cn('place-items-start', className)}
      {...marquee}
    >
      {displayCourses.map((course, idx) => (
        <RenderGuard
          key={`${idx}-${course.key}`}
          renderIf={zCourse.safeParse(course).success}
          fallback={
            <Skeleton className={cn('aspect-[3/4.5] min-h-28 min-w-20')} />
          }
        >
          <Course course={zCourse.parse(course)!}>
            <Course.Thumbnail
              isSkeleton={true}
              className={cn(
                'mr-1 mt-1 w-fit !rounded-none',
                idx > 8 && 'hidden sm:block',
              )}
            />
          </Course>
        </RenderGuard>
      ))}
      {children}
    </Marquee>
  )
}

export const TrendingPreview = () => {
  const defaultPeriod = CourseItem.DefaultTrendPeriod
  const [selectedPeriod, setSelectedPeriod] =
    useState<TrendPeriod>(defaultPeriod)
  const { data, isSuccess } = useTrendingData()

  return (
    <section className="flex flex-col gap-2">
      <header className="flex w-full flex-row flex-wrap place-content-between place-items-end gap-2">
        <aside>
          <Link
            to={{
              pathname: '/trending',
            }}
          >
            <p className="h3 flex-1 cursor-pointer truncate uppercase leading-none tracking-tight">
              Trending Courses
            </p>
          </Link>

          <p className="small font-light normal-case tracking-tight text-muted-foreground">
            Don’t know where to start? Here’s our recommendation of the most
            liked courses in the{' '}
            {CourseItem.TrendPeriodTitle[selectedPeriod].toLowerCase()}.
          </p>
        </aside>

        <Tabs
          defaultValue={selectedPeriod}
          onValueChange={(pd) => {
            if (pd !== selectedPeriod) {
              setSelectedPeriod(pd as TrendPeriod) // Update the selected period
            }
          }}
          className="hidden w-fit lg:block"
        >
          <TabsList className="!h-fit">
            {Object.entries(TrendPeriodTitle).map(([period, title]) => (
              <TabsTrigger
                key={`trending-tab-${period}`}
                value={period}
                className={cn(
                  'capitalize',
                  '!rounded-none data-[state=active]:border-primary',
                )}
              >
                <span className="small">{title}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </header>

      <Separator />

      {/* Keep the section height consistent */}
      <section style={{ minHeight: '410px' }}>
        {CourseItem.TrendPeriod.options.map((period, idx) => {
          const courses: Course[] = isSuccess
            ? data?.results?.[selectedPeriod] ?? [] // Fetch based on selected period
            : []

          const displayCourses = getShuffledArray(
            courses.map((course) => CourseItemUtils.parseCourse(course)),
          )

          const direction = idx % 2 === 0 ? 'left' : 'right'

          return (
            <TrendingPreviewSection
              key={`trend-${selectedPeriod}-${period}`}
              courses={displayCourses}
              marquee={{
                direction,
              }}
            />
          )
        })}
      </section>
    </section>
  )
}
export default IndexPage
