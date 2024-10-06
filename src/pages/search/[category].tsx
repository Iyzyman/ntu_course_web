import { useEffect, useState } from 'react'
import Search from '@/components/Layout.Search'
import { Navigate, useParams } from '@/router'
import { DefaultSearchCategory, SearchCategory } from '@/types/shelvd'
import { cn } from '@/utils/dom'
import { useSearchParams } from 'react-router-dom'

const SearchCategoryPage = () => {
  //#endregion  //*======== PARAMS ===========

  const { category = DefaultSearchCategory } = useParams('/search/:category')
  const [searchParams, setSearchParams] = useSearchParams()
  const isValidCategory = SearchCategory.safeParse(category).success
  const isValidParams = isValidCategory

  // Track the previous query to detect changes
  const [prevQuery, setPrevQuery] = useState(searchParams.get('q') ?? '')
  const currentQuery = searchParams.get('q') ?? ''

  // State to hold the current page (reset to 1 if query changes)
  const [page, setPage] = useState(+(searchParams.get('page') ?? 1))

  // Detect query changes and reset page to 1
  useEffect(() => {
    if (prevQuery !== currentQuery) {
      setPage(1) // Reset to page 1 if query changes

      // Update searchParams to reflect the change in query and page
      setSearchParams({
        q: currentQuery,
        page: '1', // Reset the page to 1 in the URL
        category: category,
      })
    }

    setPrevQuery(currentQuery) // Update previous query
  }, [currentQuery, prevQuery, setSearchParams, category])

  //#endregion  //*======== PARAMS ===========

  if (!isValidParams) {
    return (
      <Navigate
        to={{
          pathname: '/search',
        }}
        unstable_viewTransition
      />
    )
  }

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
              q: currentQuery,
              page: page, // Use the current page, which resets to 1 if the query changes
            }}
          />

          <Search.Results
            className={cn(
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
