import { StoreClientPrefix } from '@/data/static/store'
import { env } from '@/env'
import {
  BookQueryParams,
  BookQueryResponse,
  DefaultBookQueryParams,
} from '@/types/google'
import { logger } from '@/utils/debug'
import { getFlattenedObject } from '@/utils/helpers'
import { url } from '@/utils/http'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const Endpoint = 'https://www.googleapis.com'
const Key = env.VITE_GOOGLE_API_KEY
const TagType = `${StoreClientPrefix}goog`

const Services: Record<string, string> = {
  Books: '/books/v1',
}
const Routes: Record<string, Record<string, string>> = {
  Books: {
    getVolumes: '/volumes',
  },
}

export const GoogleClient = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: Endpoint }),
  reducerPath: TagType,
  tagTypes: [TagType],
  endpoints: (build) => ({
    booksGetVolumes: build.query<BookQueryResponse, BookQueryParams>({
      query: (queryOptions: BookQueryParams = DefaultBookQueryParams) => {
        const queryParams = Object.fromEntries(
          getFlattenedObject(
            {
              key: Key,
              queryOptions,
            },
            {
              usePrefix: false,
            },
          ),
        )

        const request = url({
          endpoint: `${Endpoint}${Services.Books}`,
          route: Routes.Books.getVolumes,
          queryParams,
        })

        logger(
          { breakpoint: '[google.api.ts:63]/booksGetVolumes' },
          {
            queryOptions,
            queryParams,
            request,
          },
        )
        return `${request.pathname}${request.search}`
      },
      providesTags: (_result, _error, { q }) => [{ type: TagType, q }],
    }),
  }),
})

export const GoogleEndpoints = GoogleClient.endpoints
