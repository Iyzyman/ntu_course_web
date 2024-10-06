import { Course, SearchCategories, SearchCategory } from '@/types/shelvd'
import { z } from 'zod'

export type BaseInfo = {
  id: string
  slug: string
}

export type Character = BaseInfo & {
  name: string
  coursesCount: number
  author: string
}

export type List = BaseInfo & {
  name: string
  description: string
  coursesCount: number
  courses: Course[]
  titles?: string[]
}

export type SearchCourse = Omit<Course, 'author' | 'pubYear' | 'image'> & {
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
    series_courses_count: number
    series_name: string
    series_slug: string
  }
  moods: string[]
  content_warnings: string[]
}

export type SearchCharacter = Omit<Character, 'coursesCount' | 'author'> & {
  courses_count: number
  author_names: string[]
}

export type SearchList = Omit<List, 'courses' | 'coursesCount'> & {
  courses: string[]
  courses_count: number
}

export const ListCategories = ['featured', 'popular', 'filter'] as const
export const ListCategory = z.enum(ListCategories)
export type ListCategory = z.infer<typeof ListCategory>
export const DefaultListCategory: ListCategory = ListCategory.enum.featured

export const TrendPeriods = [`threeMonths`, `sixMonths`, `year`] as const
export const TrendPeriod = z.enum(TrendPeriods)
export type TrendPeriod = z.infer<typeof TrendPeriod>

// Set the default trend period to "threeMonths"
export const DefaultTrendPeriod: TrendPeriod = TrendPeriod.enum.threeMonths

// Update the titles for the trend periods
export const TrendPeriodTitle: Record<TrendPeriod, string> = {
  [TrendPeriod.enum.threeMonths]: 'Last 3 Months',
  [TrendPeriod.enum.sixMonths]: 'Last 6 Months',
  [TrendPeriod.enum.year]: 'Last Year',
}

export const TrendParam: Record<TrendPeriod, string> = {
  [TrendPeriod.enum.threeMonths]: '3',
  [TrendPeriod.enum.sixMonths]: '6',
  [TrendPeriod.enum.year]: '12',
}

export type TrendPeriodCourses = Record<TrendPeriod, Course[]>
export type TrendPeriodCoursesMap = Map<TrendPeriod, Course[]>

export type QueryResponse<T> = {
  total: number
  results: T
}

type SearchDocumentMap = {
  courses: SearchCourse
  characters: SearchCharacter
  lists: SearchList
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
  [SearchCategory.enum.courses]: {
    query_by: 'slug,title,isbns,series_names,author_names,alternative_titles',
    query_by_weights: '5,5,5,3,1,1',
    // sort_by: '_text_match:desc, users_count:desc',
    sort_by: 'users_count:desc, _text_match:desc',
    collection: 'Course_production',
  },
  [SearchCategory.enum.characters]: {
    query_by: 'name,courses,author_names',
    query_by_weights: '4,2,2',
    // sort_by: '_text_match:desc,courses_count:desc',
    sort_by: 'courses_count:desc, _text_match:desc',
    collection: 'Character_production',
  },
  [SearchCategory.enum.lists]: {
    query_by: 'name,description,courses',
    query_by_weights: '3,2,1',
    // sort_by: '_text_match:desc,followers_count:desc',
    sort_by: 'followers_count:desc, _text_match:desc',
    collection: 'List_production',
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
