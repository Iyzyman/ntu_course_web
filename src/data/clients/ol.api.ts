import { StoreClientPrefix } from '@/data/static/store'
import { SearchQueryResponse } from '@/types/ol'
import { logger } from '@/utils/debug'
import { getStringifiedRecord } from '@/utils/helpers'
import { url } from '@/utils/http'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const Endpoint = 'https://openlibrary.org'
const TagType = `${StoreClientPrefix}ol`

const Services: Record<string, string> = {
  Api: '/api',
  Search: '/search.json',
}
const Routes: Record<string, Record<string, string>> = {
  Api: {
    Volumes: '/volumes/brief/isbn/:isbn.json',
  },
}

export const OLClient = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: Endpoint }),
  reducerPath: TagType,
  tagTypes: [TagType],
  endpoints: (build) => ({
    search: build.query<
      SearchQueryResponse,
      {
        q: string
        fields?: string
      }
    >({
      query: (queryParams: { q: string }) => {
        const request = url({
          endpoint: `${Endpoint}${Services.Search}`,
          route: '',
          queryParams: getStringifiedRecord(queryParams),
        })

        logger(
          { breakpoint: '[ol.api.ts:63]/search' },
          {
            queryParams,
            request,
          },
        )
        return `${request.pathname}${request.search}`
      },
      // providesTags: (_result, _error, data) => [{ type: TagType, data }],
    }),
    apiVolumes: build.query<
      unknown,
      {
        isbn: number
      }
    >({
      query: (routeParams: { isbn: number }) => {
        const request = url({
          endpoint: `${Endpoint}${Services.Api}`,
          route: Routes.Api.Volumes,
          routeParams: getStringifiedRecord(routeParams),
        })

        logger(
          { breakpoint: '[ol.api.ts:63]/apiVolumes' },
          {
            routeParams,
            request,
          },
        )
        return `${request.pathname}${request.search}`
      },
      // providesTags: (_result, _error, data) => [{ type: TagType, data }],
    }),
  }),
})

export const OLEndpoints = OLClient.endpoints
