import { Book } from '@/components/Book'
import { RenderGuard } from '@/components/providers/render.provider'
import { Separator } from '@/components/ui/Separator'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { HardcoverEndpoints } from '@/data/clients/hardcover.api'
import { Link, useNavigate } from '@/router'
import { Hardcover } from '@/types'
import { TrendPeriodTitle } from '@/types/hardcover'
import { Book as zBook } from '@/types/shelvd'
import { HardcoverUtils } from '@/utils/clients/hardcover'
import { cn } from '@/utils/dom'
import { getLimitedArray, getShuffledArray } from '@/utils/helpers'
import { ComponentProps, HTMLAttributes } from 'react'
import Marquee from 'react-fast-marquee'
import { mockCourseData } from '@/data/clients/mockdata'

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
              <span className="text-muted-foreground">(or don't)</span>.
            </span>
          </h1>
          <Separator />
          {/* <small className='text-center uppercase leading-none tracking-snug text-muted-foreground truncate text-pretty'>The social network for book lovers</small> */}
        </header>

        <div></div>
      </section>

      <TrendingPreview />

      <FeaturedListsPreviewSection />
    </main>
  )
}

export const FeaturedListsPreviewSection = () => {
  const category = Hardcover.ListCategory.enum.featured

  //#endregion  //*======== QUERIES ===========
  const { lists } = HardcoverEndpoints
  const { data } = lists.useQuery({
    category,
  })
  const categoryLists: Hardcover.List[] = (data?.results ??
    []) as Hardcover.List[]
  const displayLimit = 4
  const displayCategoryLists: Hardcover.List[] = getLimitedArray(
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
          <p className="h3 flex-1 cursor-pointer truncate capitalize leading-none tracking-tight">
            Discover Courses
          </p>

          <p className="small font-light normal-case text-muted-foreground">
            Click here to browse through our courses by faculties.
          </p>
        </Link>
      </header>
      <Book.BookMatrix
        displayCategoryLists={displayCategoryLists}
        category={category}
      ></Book.BookMatrix>
    </section>
  )
}

type TrendingPreviewSection = {
  books: Book[]
  displayLimit?: number
  marquee?: ComponentProps<typeof Marquee>
} & HTMLAttributes<HTMLDivElement>
export const TrendingPreviewSection = ({
  books,
  displayLimit = 12,
  className,
  children,
  marquee,
}: TrendingPreviewSection) => {
  const displayBooks = getLimitedArray(books, displayLimit)
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
      {displayBooks.map((book, idx) => (
        <RenderGuard
          key={`${idx}-${book.key}`}
          renderIf={zBook.safeParse(book).success}
          fallback={
            <Skeleton className={cn('aspect-[3/4.5] min-h-28 min-w-20')} />
          }
        >
          <Book book={zBook.parse(book)!}>
            <Book.Thumbnail
              className={cn(
                'mr-1 mt-1 w-fit !rounded-none',
                idx > 8 && 'hidden sm:block',
              )}
            />
          </Book>
        </RenderGuard>
      ))}
      {children}
    </Marquee>
  )
}

export const TrendingPreview = () => {
  const navigate = useNavigate()

  const { trending } = HardcoverEndpoints
  const { data, isSuccess } = trending.useQuery(undefined)

  const period = Hardcover.DefaultTrendPeriod

  return (
    <section className="flex flex-col gap-2">
      <header className="flex w-full flex-row flex-wrap place-content-between place-items-end gap-2">
        <aside>
          <Link
            to={{
              pathname: '/trending',
            }}
          >
            <p className="h3 flex-1 cursor-pointer truncate capitalize leading-none tracking-tight">
              Trending Courses
            </p>
          </Link>

          <p className="small font-light normal-case tracking-tight text-muted-foreground">
            Don’t know where to start? Heres our recommendation of the most
            liked courses in the{' '}
            {Hardcover.TrendPeriodTitle[period].toLowerCase()}.
          </p>
        </aside>

        <Tabs
          defaultValue={period}
          onValueChange={(pd) => {
            const isDefaultPeriod = pd === period
            if (isDefaultPeriod) return

            navigate(
              {
                pathname: '/trending/:period',
              },
              {
                params: {
                  period: pd,
                },
              },
            )
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

      <section>
        {Hardcover.TrendPeriod.options.map((period, idx) => {
          const books: Hardcover.Book[] = isSuccess
            ? data?.results?.[period] ?? []
            : []
          const displayBooks = getShuffledArray(
            books.map((book) => HardcoverUtils.parseBook(book)),
          )

          const direction = idx % 2 === 0 ? 'left' : 'right'

          return (
            <TrendingPreviewSection
              key={`trend-${period}`}
              books={displayBooks}
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

export const TrendingPreivewBestsellers = () => {
  const displayBooks: Book[] = mockCourseData

  return (
    <div className="flex flex-col gap-2">
      <h3 className="small font-semibold uppercase leading-none tracking-tight text-muted-foreground">
        New York Times' Bestsellers
      </h3>
      <Separator />

      <TrendingPreviewSection books={displayBooks} />
    </div>
  )
}

export default IndexPage
