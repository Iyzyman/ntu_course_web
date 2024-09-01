import Book from '@/components/Book'
import { RenderGuard } from '@/components/providers/render.provider'
import { HardcoverEndpoints } from '@/data/clients/hardcover.api'
import { Series as SeriesInfo } from '@/types/shelvd'
import { HardcoverUtils } from '@/utils/clients/hardcover'
import { getLimitedArray } from '@/utils/helpers'
import { PropsWithChildren, createContext, useContext, useMemo } from 'react'

export type Series = SeriesInfo

//#endregion  //*======== CONTEXT ===========
type SeriesContext = {
  series: Series
  isSkeleton?: boolean
  onNavigate: () => void
}
const SeriesContext = createContext<SeriesContext | undefined>(undefined)
const useSeriesContext = () => {
  const ctxValue = useContext(SeriesContext)
  if (ctxValue === undefined) {
    throw new Error(
      'Expected an Context Provider somewhere in the react tree to set context value',
    )
  }
  return ctxValue
}
//#endregion  //*======== CONTEXT ===========

//#endregion  //*======== PROVIDER ===========
type SeriesProvider = PropsWithChildren & Omit<SeriesContext, 'onNavigate'>
export const Series = ({ children, ...value }: SeriesProvider) => {
  // const navigate = useNavigate()

  const onNavigate = () => {
    if (!value?.series) return
    // navigate(
    //   {
    //     pathname: '/series/:slug?',
    //   },
    //   {
    //     state: {
    //       source: value.series.source,
    //     },
    //     params: {
    //       slug: value.series?.slug ?? value.series.key,
    //     },
    //     unstable_viewTransition: true,
    //   },
    // )
  }

  const isValid = SeriesInfo.safeParse(value?.series ?? {}).success
  return (
    <SeriesContext.Provider
      value={{
        isSkeleton: !isValid,
        onNavigate,
        ...value,
      }}
    >
      <RenderGuard renderIf={isValid}>{children}</RenderGuard>
    </SeriesContext.Provider>
  )
}
//#endregion  //*======== PROVIDER ===========

//#endregion  //*======== COMPONENTS ===========

type SeriesBooks = PropsWithChildren & {
  displayLimit?: number
}
export const SeriesBooks = ({ displayLimit, children }: SeriesBooks) => {
  const {
    series: { titles, source, ...series },
  } = useSeriesContext()

  //#endregion  //*======== SOURCE/HC ===========

  const { searchExactBulk: hcSearchExactBulk } = HardcoverEndpoints
  const hcSearchBooks = hcSearchExactBulk.useQuery(
    titles.map((title) => ({
      category: 'books',
      q: title,
    })),
    {
      skip: source !== 'hc' || !titles.length,
    },
  )

  const hcBooks: Book[] = useMemo(() => {
    const { data, isSuccess } = hcSearchBooks

    const results = data?.results ?? []
    const isLoading = hcSearchBooks.isLoading || hcSearchBooks.isFetching
    const isNotFound = !isLoading && !isSuccess && results.length < 1
    if (isNotFound) return []

    const books: Book[] = results.map((result) => {
      // exact search expects top hit accuracy
      const hit = (result?.hits ?? [])?.[0]
      const book = HardcoverUtils.parseDocument({
        category: 'books',
        hit,
      }) as Book
      return book
    })
    return books
  }, [hcSearchBooks])
  //#endregion  //*======== SOURCE/HC ===========

  const books = useMemo(() => {
    let books: Book[] = []
    switch (source) {
      case 'hc': {
        books = hcBooks
      }
    }

    if (displayLimit) {
      books = getLimitedArray(books, displayLimit)
    }
    return books
  }, [source, displayLimit, hcBooks])

  if (!books.length) return null

  return books.map((book, idx) => (
    <Book
      key={`${series.key}-${source}-${idx}-${book.key}`}
      book={book!}
    >
      {children}
    </Book>
  ))
}

Series.Books = SeriesBooks

//#endregion  //*======== COMPONENTS ===========

export default Series
