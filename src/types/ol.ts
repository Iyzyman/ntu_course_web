import { SearchCategory as ShelvdSearchCategory } from '@/types/shelvd'
import { z } from 'zod'

export type Book = {
  key: string /* "/works/OL82563W" */
  cover_edition_key: string /* "OL46071324M" */
  title: string

  author_key: string
  author_name: string[]
  cover_i: number /* 14419192 */
}

export type SearchQueryResponse<T = Book> = {
  numFound: number
  start: number
  numFoundExact: boolean
  docs: T[]
}

export const SearchCategories = ShelvdSearchCategory.exclude([
  'lists',
  'series',
])
export type SearchCategory = z.infer<typeof SearchCategories>

export const SearchPrefix = [`title:`, `author:`, 'person:'] as const
export type SearchPrefix = (typeof SearchPrefix)[number]
export const SearchPrefixes = z.enum(SearchPrefix)

export const SearchCategoryPrefix = new Map<SearchCategory, SearchPrefix>(
  SearchCategories.options.map((category, idx) => [
    category,
    SearchPrefix[idx],
  ]),
)
