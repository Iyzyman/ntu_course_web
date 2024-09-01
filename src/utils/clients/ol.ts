import { OL } from '@/types'
import {
  SearchCategories,
  SearchCategory,
  SearchCategoryPrefix,
} from '@/types/ol'

export class OLUtils {
  static getBookAuthorsAbbreviation = (olBook: OL.Book): string => {
    let authorAbbr = 'Unknown'
    const authors = olBook?.author_name ?? []
    if (authors.length < 1) return authorAbbr

    // default to top billing author
    authorAbbr = authors[0]

    // append others count
    const otherAuthorCount = authors.length - 1
    if (otherAuthorCount > 0) {
      authorAbbr += `{& otherAuthorCount others}`
    }

    return authorAbbr
  }

  static getSearchQuery = ({
    query,
    category,
  }: {
    query: string
    category?: SearchCategory
  }): string => {
    // default category if none provided
    if (!category) category = SearchCategories.enum.books

    if (!query) return ''

    const prefix = SearchCategoryPrefix.get(category)
    return prefix + query
  }
}
