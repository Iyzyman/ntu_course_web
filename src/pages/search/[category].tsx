import Search from '@/components/Layout.Search'
import { Navigate, useParams } from '@/router'
import { DefaultSearchCategory, SearchCategory } from '@/types/shelvd'
import { cn } from '@/utils/dom'
import { useSearchParams } from 'react-router-dom'

const SearchCategoryPage = () => {
  //#endregion  //*======== PARMS ===========
  const { category = DefaultSearchCategory } = useParams('/search/:category')
  const [searchParams] = useSearchParams()

  const isValidCategory = SearchCategory.safeParse(category).success
  const isValidParams = isValidCategory
  //#endregion  //*======== PARMS ===========

  if (!isValidParams)
    return (
      <Navigate
        to={{
          pathname: '/search',
        }}
        unstable_viewTransition
      />
    )
  return (
    <main className="page-container overflow-hidden">
      <Search.Tabs
        isNavigatable
        trigger={{
          className: '*:h4',
        }}
      >
        <main>
          <Search.Form
            isNavigatable
            defaults={{
              category: category as typeof DefaultSearchCategory,
              q: searchParams.get('q') ?? '',
              page: +(searchParams.get('page') ?? 1),
            }}
          />

          <Search.Results
            className={cn(
              // 'max-h-[80dvh] w-full',
              'w-full',
              'flex flex-col gap-6',
              'my-6',
              'snap-y snap-proximity overflow-y-auto',
            )}
          />
          <Search.Pagination isNavigatable />
        </main>
      </Search.Tabs>
    </main>
  )
}

export default SearchCategoryPage
