import Book from '@/components/Book'
import Status from '@/components/Layout.Status'
import WIPAlert from '@/components/Layout.WIP'
import List from '@/components/List'
import { RenderGuard } from '@/components/providers/render.provider'
import { HardcoverEndpoints } from '@/data/clients/hardcover.api'
import { Navigate, useParams } from '@/router'
import { Hardcover } from '@/types'
import { ListData } from '@/types/shelvd'
import { HardcoverUtils } from '@/utils/clients/hardcover'
import { cn } from '@/utils/dom'

const ListPage = () => {
  //#endregion  //*======== PARAMS ===========
  const { category = '', slug = '' } = useParams('/discover/:category/:slug')

  const isValidCategory = Hardcover.ListCategory.safeParse(category).success
  const isValidSlug = !!slug.length
  const isValidParams = isValidCategory && isValidSlug
  //#endregion  //*======== PARAMS ===========

  //#endregion  //*======== QUERIES ===========
  const { lists } = HardcoverEndpoints
  const {
    data,
    isSuccess,
    isLoading: isLoadingLists,
    isFetching: isFetchingLists,
  } = lists.useQuery(
    {
      category: category as Hardcover.ListCategory,
    },
    {
      skip: !isValidCategory,
    },
  )

  const results = ((data?.results ?? []) as Hardcover.List[]).filter(
    (list) => (list?.slug ?? '') === slug,
  )
  const isLoading = isLoadingLists || isFetchingLists
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
          const list: List = HardcoverUtils.parseList(hcList)
          const books: Book[] = hcList.books.map((hcBook) =>
            HardcoverUtils.parseBook(hcBook),
          )
          const data = ListData.parse(list)

          return (
            <List
              key={`lists-${category}-${list.key}`}
              data={data}
              overwriteBooks={books}
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
                      {list?.booksCount ?? 0} books
                    </Badge> */}

                    <p className="leading-tight text-muted-foreground">
                      {list?.description ?? ''}
                    </p>
                  </aside>
                </div>
              </section>

              <section className="w-full overflow-auto">
                <List.Books isNumbered>
                  {/* <Book.Thumbnail className="w-fit !rounded-none" /> */}
                </List.Books>
              </section>
            </List>
          )
        })}
      </RenderGuard>

      <WIPAlert />
    </main>
  )
}

export default ListPage
