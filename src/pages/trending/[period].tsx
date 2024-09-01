import Book from '@/components/Book'
import Status from '@/components/Layout.Status'
import { RenderGuard } from '@/components/providers/render.provider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { HardcoverEndpoints } from '@/data/clients/hardcover.api'
import { AppName } from '@/data/static/app'
import { Navigate, useNavigate, useParams } from '@/router'
import { Hardcover } from '@/types'
import { TrendPeriodTitle } from '@/types/hardcover'
import { HardcoverUtils } from '@/utils/clients/hardcover'
import { ShelvdUtils } from '@/utils/clients/shelvd'
import { cn } from '@/utils/dom'

const TrendingPeriodPage = () => {
  const navigate = useNavigate()

  //#endregion  //*======== PARAMS ===========
  const { period = Hardcover.DefaultTrendPeriod } =
    useParams('/trending/:period')

  const isValidPeriod = Hardcover.TrendPeriod.safeParse(period).success
  const isValidParams = isValidPeriod
  //#endregion  //*======== PARAMS ===========

  //#endregion  //*======== QUERIES ===========
  const { trending } = HardcoverEndpoints
  const {
    data,
    isSuccess,
    isLoading: isLoadingTrending,
    isFetching: isFetchingTrending,
  } = trending.useQuery(undefined)

  const results = (data?.results?.[period as Hardcover.TrendPeriod] ??
    []) as Hardcover.Book[]
  const isLoading = isLoadingTrending || isFetchingTrending
  const isNotFound =
    !isValidParams || (!isLoading && !isSuccess && !results.length)
  //#endregion  //*======== QUERIES ===========

  if (!isValidParams)
    return (
      <Navigate
        to={{
          pathname: '/trending',
        }}
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
              <h1>What's Trending</h1>

              <p className="leading-tight text-muted-foreground">
                Discover popular titles currently captivating readers on{' '}
                {AppName}.
              </p>
            </aside>
          </div>
        </section>

        <Tabs
          defaultValue={Hardcover.DefaultTrendPeriod}
          value={period}
          onValueChange={(p) => {
            const isValidPeriod = Hardcover.TrendPeriod.safeParse(p).success
            if (!isValidPeriod) return

            navigate(
              {
                pathname: '/trending/:period',
              },
              {
                params: {
                  period: p,
                },
                unstable_viewTransition: true,
              },
            )
          }}
          className={cn('w-full py-4')}
        >
          <TabsList
            className={cn(
              '!h-auto !rounded-none border-b !bg-transparent pb-0',
              '*:rounded-b-none *:border-b *:!bg-transparent *:transition-all',
              'flex w-full flex-row !place-content-start place-items-center gap-x-8',

              'overflow-x-auto',
            )}
          >
            {Object.entries(TrendPeriodTitle).map(([period, title]) => (
              <TabsTrigger
                key={`trending-tab-${period}`}
                value={period}
                className={cn(
                  'capitalize',
                  '!rounded-none data-[state=active]:border-primary',
                )}
              >
                <span className="h4">{title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* CONTENT */}
          <TabsContent value={period}>
            <section
              className={cn(
                // " max-h-[80dvh] w-full overflow-auto",
                'w-full overflow-auto',
              )}
            >
              {results.map((hcBook, idx) => {
                const book: Book = HardcoverUtils.parseBook(hcBook)
                return (
                  <Book
                    key={`${book.source}-${idx}-${book.key}`}
                    book={book!}
                  >
                    <div
                      onClick={() => {
                        navigate(
                          {
                            pathname: '/book/:slug',
                          },
                          {
                            state: {
                              source: book.source,
                            },
                            params: {
                              slug: book.slug ?? book.key,
                            },
                            unstable_viewTransition: true,
                          },
                        )
                      }}
                      className={cn(
                        'flex flex-row place-content-start place-items-start gap-4',
                        'w-full border-b py-2',
                      )}
                    >
                      <small className="whitespace-nowrap	"># {idx + 1}</small>
                      <Book.Thumbnail className="w-fit !rounded-none" />

                      <aside>
                        <p className="h4 line-clamp-3 truncate text-pretty capitalize">
                          {book.title}
                        </p>
                        <p className="!m-0 capitalize text-muted-foreground">
                          <small className="font-semibold uppercase">by</small>
                          &nbsp;
                          {ShelvdUtils.printAuthorName(book.author.name, {
                            mandatoryNames: [book.author.name],
                          })}
                        </p>
                      </aside>
                    </div>
                  </Book>
                )
              })}
            </section>
          </TabsContent>
        </Tabs>
      </RenderGuard>
    </main>
  )
}

export default TrendingPeriodPage
