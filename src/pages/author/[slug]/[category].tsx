import Author from '@/components/Author'
import { useRootSelector } from '@/data/stores/root'
import { SearchSelectors } from '@/data/stores/search.slice'
import { useNavigate, useParams } from '@/router'
import {
  AuthorDetailCategory,
  DefaultAuthorDetailCategory,
} from '@/types/shelvd'
import { cn } from '@/utils/dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs'

const AuthorDetailCategoryPage = () => {
  const navigate = useNavigate()

  //#endregion  //*======== STORE ===========
  const current = useRootSelector(SearchSelectors.state).current
  // const origin = current.origin as SourceOrigin<'hc', 'authors'>
  // const common = current.common as SearchArtifact<'books'>
  //#endregion  //*======== STORE ===========

  //#endregion  //*======== PARAMS ===========
  const { slug, category = DefaultAuthorDetailCategory } = useParams(
    '/book/:slug/:category',
  )

  const isValidCategory = AuthorDetailCategory.safeParse(category).success
  const isValidCurrentCategory = current.category === 'authors'
  const isValidParams = isValidCategory && isValidCurrentCategory
  //#endregion  //*======== PARAMS ===========

  const { isLoading, isNotFound, source } = current
  if (!isValidParams || isLoading || isNotFound) return null
  return (
    <Tabs
      value={category}
      onValueChange={(c) => {
        const isValidCategory = AuthorDetailCategory.safeParse(c).success
        if (!isValidCategory) return

        const isDefaultCategory = c === DefaultAuthorDetailCategory
        navigate(
          {
            pathname: '/author/:slug/:category',
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
        {AuthorDetailCategory.options.map((cat) => (
          <TabsTrigger
            key={`search-tab-${cat}`}
            value={cat}
            className={cn('capitalize', 'data-[state=active]:border-primary')}
          >
            <span className="h4">{cat}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={AuthorDetailCategory.enum.books}>
        <Author.Books />
      </TabsContent>

      <TabsContent value={AuthorDetailCategory.enum.series}>
        <Author.Series />
      </TabsContent>
    </Tabs>
  )
}

export default AuthorDetailCategoryPage
