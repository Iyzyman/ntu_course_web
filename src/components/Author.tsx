import Book from '@/components/Book'
import Series from '@/components/Series'
import { RenderGuard } from '@/components/providers/render.provider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { HardcoverEndpoints } from '@/data/clients/hardcover.api'
import { useNavigate } from '@/router'
import { Author as AuthorInfo } from '@/types/shelvd'
import { HardcoverUtils } from '@/utils/clients/hardcover'
import { ShelvdUtils } from '@/utils/clients/shelvd'
import { cn } from '@/utils/dom'
import { PersonIcon } from '@radix-ui/react-icons'
import {
  HTMLAttributes,
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
} from 'react'

export type Author = AuthorInfo

//#endregion  //*======== CONTEXT ===========
type AuthorContext = {
  author: Author
  isSkeleton?: boolean
  onNavigate: () => void
}
const AuthorContext = createContext<AuthorContext | undefined>(undefined)
const useAuthorContext = () => {
  const ctxValue = useContext(AuthorContext)
  if (ctxValue === undefined) {
    throw new Error(
      'Expected an Context Provider somewhere in the react tree to set context value',
    )
  }
  return ctxValue
}
//#endregion  //*======== CONTEXT ===========

//#endregion  //*======== PROVIDER ===========
type AuthorProvider = PropsWithChildren & Omit<AuthorContext, 'onNavigate'>
export const Author = ({ children, ...value }: AuthorProvider) => {
  const navigate = useNavigate()

  const onNavigate = () => {
    if (!value?.author) return
    navigate(
      {
        pathname: '/author/:slug',
      },
      {
        state: {
          source: value.author.source,
        },
        params: {
          slug: value.author?.slug ?? value.author.key,
        },
        unstable_viewTransition: true,
      },
    )
  }

  const isValid = AuthorInfo.safeParse(value?.author ?? {}).success
  return (
    <AuthorContext.Provider
      value={{
        isSkeleton: !isValid,
        onNavigate,
        ...value,
      }}
    >
      <RenderGuard renderIf={isValid}>{children}</RenderGuard>
    </AuthorContext.Provider>
  )
}
//#endregion  //*======== PROVIDER ===========

//#endregion  //*======== COMPONENTS ===========

type AuthorImage = Avatar
const AuthorImage = ({
  className,
  // children,
  ...rest
}: AuthorImage) => {
  const { author } = useAuthorContext()
  return (
    <Avatar
      className={cn('aspect-sqaure h-20 w-20', className)}
      {...rest}
    >
      <AvatarImage
        src={author?.image ?? ''}
        alt={author?.key ?? ''}
      />
      <AvatarFallback>
        <PersonIcon className="size-8" />
      </AvatarFallback>
    </Avatar>
  )
}
Author.Image = AuthorImage

type AuthorBooks = HTMLAttributes<HTMLDivElement>
const AuthorBooks = ({ children, className, ...rest }: AuthorBooks) => {
  const { author } = useAuthorContext()

  const navigate = useNavigate()

  //#endregion  //*======== SOURCE/HC ===========
  const { search: hcSearch } = HardcoverEndpoints

  const hcSearchBooks = hcSearch.useQuery(
    {
      q: author?.name ?? '',
      page: 1,
      category: 'books',
      overwriteCollectionParams: {
        query_by: 'author_names',
        sort_by: '_text_match:desc, users_count:desc',
        query_by_weights: '5',
      },
    },
    {
      skip: author.source != 'hc' || !author,
    },
  )

  const hcBooks: Book[] = useMemo(() => {
    const { data, isSuccess } = hcSearchBooks

    const results = data?.results?.[0]
    const isLoading = hcSearchBooks.isLoading || hcSearchBooks.isFetching
    const isNotFound = !isLoading && !isSuccess && (results?.found ?? 0) < 1
    if (isNotFound) return []

    const hits = results?.hits ?? []
    const books = hits.map(
      (hit) => HardcoverUtils.parseDocument({ category: 'books', hit }) as Book,
    )
    return books
  }, [hcSearchBooks])
  //#endregion  //*======== SOURCE/HC ===========

  const books = useMemo(() => {
    let books: Book[] = []
    switch (author.source) {
      case 'hc': {
        books = hcBooks
      }
    }

    return books
  }, [author.source, hcBooks])

  if (!books.length) return null

  return (
    <section
      className={cn(className)}
      {...rest}
    >
      {children}
      {books.map((book, idx) => (
        <Book
          key={`${author.key}-${book.source}-${idx}-${book.key}`}
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
                    slug: book?.slug ?? book?.key ?? '',
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
            <Book.Thumbnail className="w-fit !rounded-none" />

            <aside>
              <p className="h4 line-clamp-3 truncate text-pretty capitalize">
                {book.title}
              </p>
              <p className="!m-0 capitalize text-muted-foreground">
                <small className="font-semibold uppercase">by</small>&nbsp;
                {ShelvdUtils.printAuthorName(book.author.name, {
                  mandatoryNames: [author.name],
                })}
              </p>
            </aside>
          </div>
        </Book>
      ))}
    </section>
  )
}
Author.Books = AuthorBooks

type AuthorSeries = HTMLAttributes<HTMLDivElement>
const AuthorSeries = ({
  // children,
  className,
  ...rest
}: AuthorSeries) => {
  const { author } = useAuthorContext()

  // const navigate = useNavigate()

  //#endregion  //*======== SOURCE/HC ===========
  const { search: hcSearch } = HardcoverEndpoints

  const hcSearchSeries = hcSearch.useQuery(
    {
      q: author?.name ?? '',
      page: 1,
      category: 'series',

      overwriteCollectionParams: {
        query_by: 'author_name',
        sort_by: '_text_match:desc, readers_count:desc',
        query_by_weights: '3',
      },
    },
    {
      skip: author.source != 'hc' || !author,
    },
  )

  const hcSeries: Series[] = useMemo(() => {
    const { data, isSuccess } = hcSearchSeries

    const results = data?.results?.[0]
    const isLoading = hcSearchSeries.isLoading || hcSearchSeries.isFetching
    const isNotFound = !isLoading && !isSuccess && (results?.found ?? 0) < 1
    if (isNotFound) return []

    const hits = results?.hits ?? []
    const series = hits
      .map(
        (hit) =>
          HardcoverUtils.parseDocument({ category: 'series', hit }) as Series,
      )
      .filter((serie) => !!(serie?.booksCount ?? 0))

    return series
  }, [hcSearchSeries])

  //#endregion  //*======== SOURCE/HC ===========

  const series: Series[] = useMemo(() => {
    let series: Series[] = []
    switch (author.source) {
      case 'hc': {
        series = hcSeries
      }
    }

    return series
  }, [author.source, hcSeries])

  if (!series.length) return null

  return (
    <section
      className={cn(className)}
      {...rest}
    >
      {series.map((serie, idx) => (
        <Series
          key={`${author.key}-${serie.source}-${idx}-${serie.key}`}
          series={serie!}
        >
          <div
            // onClick={() => {
            //   navigate(
            //     {
            //       pathname: '/book/:slug',
            //     },
            //     {
            //       state: {
            //         source: serie.source,
            //       },
            //       params: {
            //         slug: serie?.slug ?? serie?.key ?? '',
            //       },
            //       unstable_viewTransition: true,
            //     },
            //   )
            // }}
            className={cn(
              'flex flex-col place-content-start place-items-start gap-4',
              'w-full border-b py-2',
            )}
          >
            <header className="flex flex-row flex-wrap place-content-center place-items-center gap-2">
              <p className="h4 capitalize">{serie.name}</p>
              <Badge variant={'outline'}>{serie?.booksCount ?? 0} books</Badge>
            </header>

            <aside
              className={cn(
                'w-fit place-content-start place-items-start gap-2',
                'flex flex-row flex-wrap',
                'sm:max-w-xl',
              )}
            >
              <Series.Books displayLimit={12}>
                <Book.Thumbnail className="w-fit !rounded-none" />
              </Series.Books>
            </aside>
          </div>
        </Series>
      ))}
    </section>
  )
}
Author.Series = AuthorSeries

//#endregion  //*======== COMPONENTS ===========

export default Author
