import Course from '@/components/Course'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import {
  AggregateReviewScore,
  AllReviews,
  ReviewForm,
} from '@/components/Reviews'
import { useRootSelector } from '@/data/stores/root'
import { SearchSelectors, SourceOrigin } from '@/data/stores/search.slice'
import { useNavigate, useParams } from '@/router'
import {
  CourseDetailCategory,
  DefaultCourseDetailCategory,
  SearchArtifact,
} from '@/types/shelvd'
import { cn } from '@/utils/dom'
import { Separator } from '@radix-ui/react-dropdown-menu'

const DisplayCourseDetailCategories = CourseDetailCategory.extract([
  'information',
  'reviews',
])

const CourseDetailCategoryPage = () => {
  const navigate = useNavigate()

  //#endregion  //*======== STORE ===========
  const current = useRootSelector(SearchSelectors.state).current
  const origin = current.origin as SourceOrigin<'hc', 'courses'>
  //#endregion  //*======== STORE ===========

  //#endregion  //*======== PARAMS ===========
  const { slug, category = DefaultCourseDetailCategory } = useParams(
    '/course/:slug/:category',
  )

  const isValidCategory =
    DisplayCourseDetailCategories.safeParse(category).success
  const isValidCurrentCategory = current.category === 'courses'
  const isValidParams = isValidCategory && isValidCurrentCategory
  //#endregion  //*======== PARAMS ===========

  const { isLoading, isNotFound, source } = current
  if (!isValidParams || isLoading || isNotFound) return null
  return (
    <Tabs
      value={category}
      onValueChange={(c) => {
        const isValidCategory =
          DisplayCourseDetailCategories.safeParse(c).success
        if (!isValidCategory) return

        const isDefaultCategory = c === DefaultCourseDetailCategory
        navigate(
          {
            pathname: '/course/:slug/:category',
          },
          {
            state: {
              source,
            },
            params: {
              slug,
              category: isDefaultCategory ? '' : c,
            },
            unstable_viewTransition: true,
          },
        )
      }}
      className={cn('relative w-full', isLoading && 'hidden')}
    >
      <TabsList
        className={cn(
          '!h-auto !rounded-none border-b !bg-transparent pb-0',
          '*:rounded-b-none *:border-b *:!bg-transparent *:transition-all',
          'flex w-full flex-row !place-content-start place-items-center gap-x-4',

          'overflow-x-auto border-transparent sm:border-border',
        )}
      >
        {DisplayCourseDetailCategories.options.map((cat) => (
          <TabsTrigger
            key={`search-tab-${cat}`}
            value={cat}
            className={cn('capitalize', 'data-[state=active]:border-primary')}
            style={{
              ...(source == 'hc' &&
                cat === category && {
                  borderColor: origin?.image?.color,
                }),
            }}
          >
            <span className="h4">{cat}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={DisplayCourseDetailCategories.enum.information}>
        <CourseInfo />
      </TabsContent>

      <TabsContent value={DisplayCourseDetailCategories.enum.reviews}>
        <ReviewInfo />
      </TabsContent>
    </Tabs>
  )
}

//#endregion  //*======== COMPONENTS ===========

const CourseInfo = () => {
  //#endregion  //*======== STORE ===========
  const current = useRootSelector(SearchSelectors.state).current
  const origin = current.origin as SourceOrigin<'hc', 'courses'>
  const common = current.common as SearchArtifact<'courses'>
  //#endregion  //*======== STORE ===========

  //#endregion  //*======== PARAMS ===========

  //#endregion  //*======== PARAMS ===========

  // return null
  return (
    <section className="my-4 flex flex-col gap-6">
      <Course course={common}>
        <Course.Description />

        <Separator />

        <div className={cn('flex gap-4')}>
          <Course.Prerequisites
            prerequisites={origin?.prerequisites}
            className="flex-1"
          />

          <aside
            className={cn(
              'flex-1 lg:basis-2/5', // Adjusted to share space properly
              'flex flex-col flex-wrap gap-4 lg:flex-row',
            )}
          >
            <Course.Tags
              title="Tags"
              tags={origin?.tags ?? []}
              className="h-full w-full"
            />
          </aside>
        </div>
      </Course>
    </section>
  )
}

const ReviewInfo = () => {
  return (
    <section>
      <AggregateReviewScore />
      <AllReviews />
      <ReviewForm />
    </section>
  )
}

//#endregion  //*======== COMPONENTS ===========

export default CourseDetailCategoryPage
