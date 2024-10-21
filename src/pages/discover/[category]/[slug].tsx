import Course, { StandardCourseList } from '@/components/Course'
import { useDiscoveryData } from '@/components/hooks/useCourseFinderHooks'
import Status from '@/components/Layout.Status'
import List from '@/components/List'
import { RenderGuard } from '@/components/providers/render.provider'
import { Navigate, useParams } from '@/router'
import { CourseItem } from '@/types'
import { ListData } from '@/types/cf'
import { CourseItemUtils } from '@/utils/clients/courseitem'
import { cn } from '@/utils/dom'

const ListPage = () => {
  //#endregion  //*======== PARAMS ===========
  const { category = '', slug = '' } = useParams('/discover/:category/:slug')

  const isValidCategory = CourseItem.ListCategory.safeParse(category).success
  const isValidSlug = !!slug.length
  const isValidParams = isValidCategory && isValidSlug
  //#endregion  //*======== PARAMS ===========

  //#endregion  //*======== QUERIES ===========

  const { data, isSuccess, isLoading, error } = useDiscoveryData()
  if (error) {
    console.log(error)
  }

  const results = ((data ?? []) as CourseItem.List[]).filter(
    (list) => (list?.slug ?? '') === slug,
  )

  const isNotFound =
    !isValidParams || (!isLoading && !isSuccess && !results.length)

  if (!isValidParams)
    return (
      <Navigate
        to={'/discover'}
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
            isNotFound={isNotFound}
            isLoading={isLoading}
          />
        }
      >
        {results.map((hcList) => {
          const list: List = CourseItemUtils.parseList(hcList)
          const courses: Course[] = hcList.courses.map((hcCourse) =>
            CourseItemUtils.parseCourse(hcCourse),
          )
          const data = ListData.parse(list)

          return (
            <List
              key={`lists-${category}-${list.key}`}
              data={data}
              overwriteCourses={courses}
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
                    <h1>{list.name}</h1>
                    {/* <Badge variant={'outline'}>
                      {list?.coursesCount ?? 0} courses
                    </Badge> */}

                    <p className="leading-tight text-muted-foreground">
                      {list?.description ?? ''}
                    </p>
                  </aside>
                </div>
              </section>

              <section className="w-full overflow-auto">
                <StandardCourseList results={courses}></StandardCourseList>
              </section>
            </List>
          )
        })}
      </RenderGuard>

      {/* <WIPAlert /> */}
    </main>
  )
}

export default ListPage
