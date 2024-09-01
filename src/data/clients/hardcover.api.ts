import { AppBaseUrl } from '@/data/static/app'
import { StoreClientPrefix } from '@/data/static/store'
import { env } from '@/env'
import {
  BaseSearchParams,
  List,
  ListCategory,
  QueryResponse,
  QuerySearchParams,
  SearchCategoryCollectionParams,
  SearchCollectionParams,
  SearchDocument,
  SearchEdition,
  SearchParams,
  SearchQueryResponse,
  TrendPeriodBooks,
} from '@/types/hardcover'
import { SearchCategories } from '@/types/shelvd'
import { logger } from '@/utils/debug'
import { getStringifiedRecord } from '@/utils/helpers'
import { url } from '@/utils/http'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const Endpoint = `${AppBaseUrl({ isAbsolute: true })}/assets`
const TagType = `${StoreClientPrefix}hc`

const SubEndpoints: Record<string, string> = {
  Typesense: env.VITE_TYPESENSE_HOST,
  Graphql: env.VITE_HARDCOVER_HOST,
}
const Services: Record<string, string> = {
  Trending: '/book-trending.json',
  // Lists: '/book-lists.json',
  Lists: '',
}

const Routes: Record<string, Record<string, string>> = {
  Typesense: {
    Search: '/multi_search',
  },
  Lists: {
    Category: '/book-lists-:category.json',
  },
}

export const HardcoverClient = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: Endpoint }),
  reducerPath: TagType,
  tagTypes: [TagType],
  endpoints: (build) => ({
    trending: build.query<QueryResponse<TrendPeriodBooks>, undefined>({
      query: () => Services.Trending,
    }),

    lists: build.query<
      QueryResponse<List>,
      {
        category: ListCategory
      }
    >({
      query: (routeParams: { category: ListCategory }) => {
        const endpoint = `${Endpoint}${Services.Lists}`
        const request = url({
          endpoint,
          route: Routes.Lists.Category,
          routeParams: getStringifiedRecord(routeParams),
        })

        return {
          url: `${request.href}`,
          method: 'GET',
        }
      },
    }),

    search: build.query<
      SearchQueryResponse<SearchDocument<SearchCategories>>,
      QuerySearchParams & {
        category: SearchCategories
        overwriteCollectionParams?: Partial<SearchCollectionParams>
      }
    >({
      query: ({
        category,
        overwriteCollectionParams = {},
        ...searchParams
      }: QuerySearchParams & {
        category: SearchCategories
        overwriteCollectionParams?: Partial<SearchCollectionParams>
      }) => {
        const endpoint = `${SubEndpoints.Typesense}`
        const request = url({
          endpoint,
          route: Routes.Typesense.Search,
          queryParams: getStringifiedRecord({
            'x-typesense-api-key': env.VITE_TYPESENSE_KEY,
          }),
        })

        const categoryParams = SearchCategoryCollectionParams[category]
        const allSearchParams: SearchParams = {
          ...BaseSearchParams,
          ...searchParams,
          ...categoryParams,
          ...overwriteCollectionParams,
        }

        const body = {
          searches: [allSearchParams],
        }

        return {
          url: `${endpoint}${request.pathname}${request.search}`,
          method: 'POST',
          body,
        }
      },
    }),

    searchExact: build.query<
      SearchQueryResponse<SearchDocument<SearchCategories>>,
      {
        category: SearchCategories
        q: QuerySearchParams['q']
      }
    >({
      query: ({
        category,
        ...searchParams
      }: {
        category: SearchCategories
        q: QuerySearchParams['q']
      }) => {
        const endpoint = `${SubEndpoints.Typesense}`
        const request = url({
          endpoint,
          route: Routes.Typesense.Search,
          queryParams: getStringifiedRecord({
            'x-typesense-api-key': env.VITE_TYPESENSE_KEY,
          }),
        })

        const categoryParams = SearchCategoryCollectionParams[category]
        const allSearchParams: SearchParams = {
          ...BaseSearchParams,
          ...searchParams,
          ...categoryParams,

          page: 1,
          per_page: 1,
          prioritize_exact_match: true,
        }

        if (category === 'books') {
          allSearchParams.sort_by = '_text_match:desc, users_count:desc'
        }

        const body = {
          searches: [allSearchParams],
        }

        logger(
          { breakpoint: '[hardcover.api.ts:130]/searchExact' },
          {
            category,
            searchParams,
          },
        )

        return {
          url: `${endpoint}${request.pathname}${request.search}`,
          method: 'POST',
          body,
        }
      },
    }),

    searchExactBulk: build.query<
      SearchQueryResponse<SearchDocument<SearchCategories>>,
      {
        category: SearchCategories
        q: QuerySearchParams['q']
      }[]
    >({
      query: (
        searchParams: {
          category: SearchCategories
          q: QuerySearchParams['q']
        }[],
      ) => {
        const endpoint = `${SubEndpoints.Typesense}`
        const request = url({
          endpoint,
          route: Routes.Typesense.Search,
          queryParams: getStringifiedRecord({
            'x-typesense-api-key': env.VITE_TYPESENSE_KEY,
          }),
        })

        const searches = searchParams.map(({ category, ...params }) => {
          const categoryParams = SearchCategoryCollectionParams[category]
          const allSearchParams: SearchParams = {
            ...BaseSearchParams,
            ...params,
            ...categoryParams,

            page: 1,
            per_page: 1,
            prioritize_exact_match: true,
          }

          if (category === 'books') {
            allSearchParams.sort_by = '_text_match:desc, users_count:desc'
          }

          return allSearchParams
        })

        if (!searches.length) return ''
        const body = {
          searches,
        }

        logger(
          { breakpoint: '[hardcover.api.ts:185]/searchExactBulk' },
          {
            searchParams,
          },
        )

        return {
          url: `${endpoint}${request.pathname}${request.search}`,
          method: 'POST',
          body,
        }
      },
    }),

    getEditionsById: build.query<
      {
        data: {
          editions: SearchEdition[]
        }
      },
      {
        id: number
      }
    >({
      query: ({ id }: { id: number }) => {
        const endpoint = `${SubEndpoints.Graphql}`
        const request = url({
          endpoint,
          route: '',
          queryParams: getStringifiedRecord({
            'x-typesense-api-key': env.VITE_TYPESENSE_KEY,
          }),
        })

        const body = {
          operationName: 'FindEditionsForBook',
          variables: {
            bookId: id,
            formats: [1, 2, 4],
            limit: 25,
            offset: 0,
            includeCurrentUser: false,
          },
          query:
            'fragment EditionFragment on editions {\n  id\n  title\n  asin\n  isbn10: isbn_10\n  isbn13: isbn_13\n  releaseDate: release_date\n  releaseYear: release_year\n  pages\n  audioSeconds: audio_seconds\n  readingFormatId: reading_format_id\n  usersCount: users_count\n  cachedImage: cached_image\n  editionFormat: edition_format\n  editionInformation: edition_information\n  language {\n    language\n    __typename\n  }\n  readingFormat: reading_format {\n    format\n    __typename\n  }\n  country {\n    name\n    __typename\n  }\n  __typename\n}\n\nfragment ListBookFragment on list_books {\n  id\n  listId: list_id\n  bookId: book_id\n  editionId: edition_id\n  position\n  reason\n  __typename\n}\n\nquery FindEditionsForBook($bookId: Int!, $limit: Int!, $offset: Int!, $formats: [Int]!, $userId: Int, $includeCurrentUser: Boolean!) {\n  editions(\n    where: {book_id: {_eq: $bookId}, reading_format_id: {_in: $formats}}\n    order_by: {users_count: desc}\n    limit: $limit\n    offset: $offset\n  ) {\n    ...EditionFragment\n    list_books(where: {list: {user_id: {_eq: $userId}, slug: {_eq: "owned"}}}) @include(if: $includeCurrentUser) {\n      ...ListBookFragment\n      __typename\n    }\n    __typename\n  }\n}',
        }

        return {
          url: `${endpoint}${request.pathname}${request.search}`,
          method: 'POST',
          body,
          headers: {
            authorization:
              'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MDk1MzU0OTEsImV4cCI6MTcxMDE0MDI5MSwiaHR0cHM6Ly9oYXN1cmEuaW8vand0L2NsYWltcyI6eyJ4LWhhc3VyYS1hbGxvd2VkLXJvbGVzIjpbImd1ZXN0Il0sIngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6Imd1ZXN0IiwieC1oYXN1cmEtcm9sZSI6Imd1ZXN0In19.YJQiqng6-oc9UmoVdU7Wnq1JLHa-JB8F-NF5HXdpcGA',
          },
        }
      },
    }),
  }),
})

export const HardcoverEndpoints = HardcoverClient.endpoints
