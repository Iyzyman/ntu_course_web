import { BookAuthor, SearchCategories, SearchCategory } from '@/types/shelvd'
import { z } from 'zod'

export type BaseInfo = {
  id: string
  slug: string
}

export type Author = BaseInfo & {
  name: string
  image: string
  booksCount: number
}

export type Book = BaseInfo & {
  title: string
  author: BookAuthor
  pubYear: number
  image: string
  isbns: string[]
  description: string
  genres: string[]

  series: {
    position: number
    count: number
    name: string
    slug: string
  }
}

export type Character = BaseInfo & {
  name: string
  booksCount: number
  author: string
}

export type List = BaseInfo & {
  name: string
  description: string
  booksCount: number
  books: Book[]
  titles?: string[]
}

export type Series = BaseInfo & {
  name: string
  booksCount: number
  author: string
  titles: string[]
}

export type SearchBook = Omit<Book, 'author' | 'pubYear' | 'image'> & {
  image: {
    url: string
    color: string
  }
  release_year: number
  author_names: string[]
  contributions: {
    author: {
      cachedImage: Record<string, string>
      name: string
      slug: string
    }
  }[]
  featured_series: {
    position: number
    series_books_count: number
    series_name: string
    series_slug: string
  }
  moods: string[]
  content_warnings: string[]
}

export type SearchAuthor = Omit<Author, 'booksCount' | 'image'> & {
  image: {
    url: string
    color: string
  }
  books_count: number
}

export type SearchCharacter = Omit<Character, 'booksCount' | 'author'> & {
  books_count: number
  author_names: string[]
}

export type SearchList = Omit<List, 'books' | 'booksCount'> & {
  books: string[]
  books_count: number
}

export type SearchSeries = Omit<Series, 'booksCount' | 'author' | 'titles'> & {
  books_count: number
  author_name: string
  books: string[]
}

export const ListCategories = ['featured', 'popular'] as const
export const ListCategory = z.enum(ListCategories)
export type ListCategory = z.infer<typeof ListCategory>
export const DefaultListCategory: ListCategory = ListCategory.enum.featured

export const TrendPeriods = [`recent`, `year`, `all`] as const
export const TrendPeriod = z.enum(TrendPeriods)
export type TrendPeriod = z.infer<typeof TrendPeriod>
export const DefaultTrendPeriod: TrendPeriod = TrendPeriod.enum.recent
export const TrendPeriodTitle: Record<TrendPeriod, string> = {
  [TrendPeriod.enum.recent]: 'Last 3 Months',
  [TrendPeriod.enum.year]: 'Last 12 Months',
  [TrendPeriod.enum.all]: 'All Time',
}

export type TrendPeriodBooks = Record<TrendPeriod, Book[]>
export type TrendPeriodBooksMap = Map<TrendPeriod, Book[]>

export type QueryResponse<T> = {
  total: number
  results: T
}

type SearchDocumentMap = {
  books: SearchBook
  authors: SearchAuthor
  characters: SearchCharacter
  lists: SearchList
  series: SearchSeries
  users: unknown
}
export type SearchDocument<T extends SearchCategories> = SearchDocumentMap[T]

export type SearchQueryResponse<T> = {
  results: {
    found: number
    page: number
    out_of: number
    hits: {
      document: T
    }[]
    request_params: {
      per_page: number
    }
  }[]
}
export type SearchCollectionParams = {
  query_by: string
  query_by_weights: string
  sort_by: string
  collection: string
}

export const BaseSearchParams = {
  per_page: 30,
  prioritize_exact_match: false,
  num_typos: 3,
}

export const QuerySearchParams = z.object({
  q: z
    .string({
      required_error: 'Query cannot be empty',
    })
    .default(''),
  page: z
    .number()
    .min(1, {
      message: 'Query page must be least 1',
    })
    .default(1)
    .optional(),
})
export type QuerySearchParams = z.infer<typeof QuerySearchParams>

export type SearchParams = typeof BaseSearchParams &
  QuerySearchParams &
  SearchCollectionParams

export const SearchCategoryCollectionParams: Record<
  SearchCategories,
  SearchCollectionParams
> = {
  [SearchCategory.enum.books]: {
    query_by: 'slug,title,isbns,series_names,author_names,alternative_titles',
    query_by_weights: '5,5,5,3,1,1',
    // sort_by: '_text_match:desc, users_count:desc',
    sort_by: 'users_count:desc, _text_match:desc',
    collection: 'Book_production',
  },
  [SearchCategory.enum.authors]: {
    query_by: 'slug,name,name_personal,alternate_names,series_names,books',
    query_by_weights: '5,3,3,3,2,1',
    // sort_by: '_text_match:desc,books_count:desc',
    sort_by: 'books_count:desc, _text_match:desc',
    collection: 'Author_production',
  },
  [SearchCategory.enum.characters]: {
    query_by: 'name,books,author_names',
    query_by_weights: '4,2,2',
    // sort_by: '_text_match:desc,books_count:desc',
    sort_by: 'books_count:desc, _text_match:desc',
    collection: 'Character_production',
  },
  [SearchCategory.enum.lists]: {
    query_by: 'name,description,books',
    query_by_weights: '3,2,1',
    // sort_by: '_text_match:desc,followers_count:desc',
    sort_by: 'followers_count:desc, _text_match:desc',
    collection: 'List_production',
  },
  [SearchCategory.enum.series]: {
    query_by: 'slug,name,books,author_name',
    query_by_weights: '3,2,1,1',
    // sort_by: '_text_match:desc, readers_count:desc',
    sort_by: 'readers_count:desc, _text_match:desc',
    collection: 'Series_production',
  },
  //TODO: implement
  [SearchCategory.enum.users]: {
    query_by: '',
    query_by_weights: '',
    // sort_by: '_text_match:desc, readers_count:desc',
    sort_by: '',
    collection: '',
  } as SearchCollectionParams,
}

//#endregion  //*======== GRAPHQL ===========
export type SearchEdition = {
  id: string
  title: string
  isbn10: string
  isbn13: string

  cachedImage: {
    id: string
    url: string
    color: string
  }
}
//#endregion  //*======== GRAPHQL ===========
