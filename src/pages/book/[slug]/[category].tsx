import Book from '@/components/Book'
import WIPAlert from '@/components/Layout.WIP'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useRootSelector } from '@/data/stores/root'
import { SearchSelectors, SourceOrigin } from '@/data/stores/search.slice'
import { useNavigate, useParams } from '@/router'
import {
  BookDetailCategory,
  DefaultBookDetailCategory,
  SearchArtifact,
} from '@/types/shelvd'
import { cn } from '@/utils/dom'
import { Separator } from '@radix-ui/react-dropdown-menu'

const DisplayBookDetailCategories = BookDetailCategory.extract([
  'info',
  'reviews',
])

const BookDetailCategoryPage = () => {
  const navigate = useNavigate()

  //#endregion  //*======== STORE ===========
  const current = useRootSelector(SearchSelectors.state).current
  const origin = current.origin as SourceOrigin<'hc', 'books'>
  // const common = current.common as SearchArtifact<'books'>
  //#endregion  //*======== STORE ===========

  //#endregion  //*======== PARAMS ===========
  const { slug, category = DefaultBookDetailCategory } = useParams(
    '/book/:slug/:category',
  )

  const isValidCategory =
    DisplayBookDetailCategories.safeParse(category).success
  const isValidCurrentCategory = current.category === 'books'
  const isValidParams = isValidCategory && isValidCurrentCategory
  //#endregion  //*======== PARAMS ===========

  const { isLoading, isNotFound, source } = current
  if (!isValidParams || isLoading || isNotFound) return null
  return (
    <Tabs
      value={category}
      onValueChange={(c) => {
        const isValidCategory = DisplayBookDetailCategories.safeParse(c).success
        if (!isValidCategory) return

        const isDefaultCategory = c === DefaultBookDetailCategory
        navigate(
          {
            pathname: '/book/:slug/:category',
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
        {DisplayBookDetailCategories.options.map((cat) => (
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

      {category !== BookDetailCategory.enum.info && <WIPAlert />}

      <TabsContent value={DisplayBookDetailCategories.enum.info}>
        <BookInfo />
      </TabsContent>
    </Tabs>
  )
}

//#endregion  //*======== COMPONENTS ===========

const BookInfo = () => {
  //#endregion  //*======== STORE ===========
  const current = useRootSelector(SearchSelectors.state).current
  const origin = current.origin as SourceOrigin<'hc', 'books'>
  const common = current.common as SearchArtifact<'books'>
  //#endregion  //*======== STORE ===========

  //#endregion  //*======== PARAMS ===========
  const isInSeries = !!(common?.series?.key ?? common?.series?.slug)

  //#endregion  //*======== PARAMS ===========

  // return null
  return (
    <section className="my-4 flex flex-col gap-6">
      <Book book={common}>
        <Book.Description />

        <Separator />

        <div
          className={cn(
            'flex flex-col-reverse place-items-start gap-8 lg:flex-row',
            '*:!m-0 *:w-fit',
          )}
        >
          <Book.Series className="flex-1" />

          <aside
            className={cn(
              '!w-full lg:w-auto lg:basis-2/5',
              'flex flex-col flex-wrap gap-4 lg:flex-row',
              !isInSeries && '!w-full flex-1',
            )}
          >
            <Book.Tags
              title="Genres"
              tags={origin?.genres ?? []}
              className="h-full !w-full"
            />

            <Book.Tags
              title="Moods"
              tags={origin?.moods ?? []}
              className="h-full !w-full"
            />
          </aside>
        </div>
      </Book>
    </section>
  )
}

//#endregion  //*======== COMPONENTS ===========

export default BookDetailCategoryPage
