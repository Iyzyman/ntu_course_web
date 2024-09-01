import { StoreClientPrefix } from '@/data/static/store'
import { env } from '@/env'
import { BookQueryResponse } from '@/types/nyt'
import { logger } from '@/utils/debug'
import { getFlattenedObject } from '@/utils/helpers'
import { url } from '@/utils/http'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const Endpoint = 'https://api.nytimes.com'
const Key = env.VITE_NYT_API_KEY
const TagType = `${StoreClientPrefix}nyt`

const Services: Record<string, string> = {
  Books: '/svc/books/v3',
  TopStories: '/svc/topstories/v2',
}
const Routes: Record<string, Record<string, string>> = {
  Books: {
    Bestsellers: '/lists/overview.json',
  },
}

export const NYTClient = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: Endpoint }),
  reducerPath: TagType,
  tagTypes: [TagType],
  endpoints: (build) => ({
    booksGetBestsellerLists: build.query<BookQueryResponse, void>({
      query: () => {
        const queryParams = Object.fromEntries(
          getFlattenedObject(
            {
              'api-key': Key,
            },
            {
              usePrefix: false,
            },
          ),
        )

        const request = url({
          endpoint: `${Endpoint}${Services.Books}`,
          route: Routes.Books.Bestsellers,
          queryParams,
        })

        logger(
          { breakpoint: '[nyt.api.ts:63]/booksGetBestsellers' },
          {
            queryParams,
            request,
          },
        )
        return `${request.pathname}${request.search}`
      },
      // providesTags: (_result, _error, data) => [{ type: TagType, data }],
    }),
  }),
})

export const NYTEndpoints = NYTClient.endpoints
