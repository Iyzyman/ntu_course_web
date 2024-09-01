import {
  CreateCollectionBodyParams,
  CollectionsQueryResponse as CollectionsQueryResponse,
  UpdateCollectionNameBodyParams,
  deleteMultipleCollectionsBodyParams,
  addBookToMultipleCollectionsBodyParams,
  CollectionQueryResponse,
} from '@/types/collections'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { StoreClientPrefix } from '../static/store'
import { logger } from '@/utils/debug'
import { url } from '@/utils/http'
import { getStringifiedRecord } from '@/utils/helpers'
import { Book } from '@/types/shelvd'

/** @deprecated for scaffold purposes only */
// const getEndpoint = (
//   options: {
//     isAbsolute?: boolean
//   } = {
//     isAbsolute: false,
//   },
// ) => {
//   if (!options.isAbsolute && typeof window !== 'undefined') return '' // Browser should use relative URL
//   if (import.meta.env.VITE_VERCEL_URL)
//     return `https://${import.meta.env.VITE_VERCEL_URL}` // SSR should use Vercel URL
//   return `http://localhost:${import.meta.env.VITE_SHELVD_PORT ?? 3000}` // Development SSR should use localhost
// }

// const Endpoint = getEndpoint({ isAbsolute: true })

const Endpoint = `https://backend-one-liard.vercel.app`
const TagType = `${StoreClientPrefix}collections`

/**
router.route("/api/users/:username/collections").get(getCollections);

router.route("/api/users/:username/collections/:collectionType(core|user)").get(getTypeCollections);

router.route("/api/users/:username/collections").post(createCollection);

router.route("/api/users/:username/collections/:collection_key").get(getBooksInCollection);

router.route("/api/users/:username/collections/:collection_key").put(updateCollectionName);

router.route("/api/users/:username/collections/:collection_key").delete(deleteCollection);

router.route("/api/users/:username/collections/:collection_key/books/:book_key").post(addBookToCollection); --> This takes the book_key, username and collection key specified in the url.

router.route("/api/users/:username/collections/:collection_key/books/:book_key").delete(removeBookFromCollection);

router.route("/api/users/:username/collections").delete(deleteMultipleCollections);

router.route("/api/users/:username/collectionsBatch").post(addBookToMultipleCollections);
 */

const Services: Record<string, string> = {
  User: `/api/users/:username`,
  AddBook: `/api/add_book`,
}

const Routes: Record<string, Record<string, string>> = {
  Api: {
    collections: '/collections',
    collection: '/collections/:collection_key',
    collectionsBatch: '/collectionsBatch',
    collectionsCore: '/collections/core',
    collectionsUser: '/collections/user',
    bookToCollection: '/collections/:collection_key/books/:book_key',
  },
}

type AddBookRequest = {
  book: Book
}

export const CollectionClient = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: `${Endpoint}` }),
  reducerPath: TagType,
  tagTypes: [TagType],
  endpoints: (build) => ({
    /**@description Add book */
    addBookToBooksTable: build.mutation<void, AddBookRequest>({
      query: (book) => {
        const request = url({
          endpoint: `${Endpoint}`,
          route: `${Services.AddBook}`,
        })

        logger({ breakpoint: `[collections.api.ts:89] POST /add_book` }, book)
        return {
          url: `${request.pathname}`,
          method: 'POST',
          body: book,
        }
      },
    }),

    /**@description Get all the collections of the user */
    getCollections: build.query<CollectionsQueryResponse, { username: string }>(
      {
        query: (routeParams) => {
          const request = url({
            endpoint: `${Endpoint}`,
            route: `${Services.User}${Routes.Api.collections}`,
            routeParams: getStringifiedRecord(routeParams),
          })

          logger(
            { breakpoint: '[collections.api.ts:79]/collections' },
            {
              request,
            },
          )
          return {
            url: `${request.pathname}`,
            method: 'GET',
          }
        },
        providesTags: [TagType],
      },
    ),
    /**@description Get a specific collection, including the books it contains */
    getCollection: build.query<
      CollectionQueryResponse,
      { username: string; collection_key: string }
    >({
      query: (routeParams) => {
        const request = url({
          endpoint: `${Endpoint}`,
          route: `${Services.User}${Routes.Api.collection}`,
          routeParams: getStringifiedRecord(routeParams),
        })

        logger(
          { breakpoint: '[collections.api.ts:98]/collections/:collection_key' },
          {
            routeParams,
            request,
          },
        )
        return `${request.pathname}${request.search}`
      },
      providesTags: [TagType],
    }),
    /**@description Create a new Collection*/
    createCollection: build.mutation<
      CollectionsQueryResponse,
      CreateCollectionBodyParams
    >({
      query: (newCollectionBody: CreateCollectionBodyParams) => {
        const request = url({
          endpoint: `${Endpoint}`,
          route: `${Services.User}${Routes.Api.collections}`,
          routeParams: getStringifiedRecord({
            username: newCollectionBody.username,
          }),
        })

        logger(
          { breakpoint: `[collections.api.ts:121] POST /collections` },
          newCollectionBody,
        )
        return {
          url: `${request.pathname}`,
          method: 'POST',
          body: newCollectionBody,
        }
      },
      invalidatesTags: [TagType],
    }),
    /**@description Update a Collection Name */
    updateCollection: build.mutation<
      CollectionsQueryResponse,
      UpdateCollectionNameBodyParams
    >({
      query: (body: UpdateCollectionNameBodyParams) => {
        logger({ breakpoint: '[collections.api.ts:138]' }, body)
        const request = url({
          endpoint: `${Endpoint}`,
          route: `${Services.User}${Routes.Api.collection}`,
          routeParams: getStringifiedRecord({
            username: body.username,
            collection_key: body.collection_key,
          }),
        })
        return {
          url: `${request.pathname}`,
          method: 'PUT',
          body: body,
        }
      },
      invalidatesTags: [TagType],
    }),
    /**@description Add a Book to a Collection */
    addBookToCollection: build.mutation<
      CollectionsQueryResponse,
      { username: string; collection_key: string; book_key: string }
    >({
      query: (params) => {
        const request = url({
          endpoint: `${Endpoint}`,
          route: `${Services.User}${Routes.Api.bookToCollection}`,
          routeParams: getStringifiedRecord(params),
        })
        logger(
          { breakpoint: '[collections.api.ts:158] addBookToCollection' },
          params,
          request,
        )
        return {
          url: `${request.pathname}`,
          method: 'POST',
        }
      },
      invalidatesTags: [TagType],
    }),
    /**@description Add a Book to Multiple Collection */
    addBookToMultipleCollection: build.mutation<
      CollectionsQueryResponse,
      addBookToMultipleCollectionsBodyParams
    >({
      query: (body) => {
        logger({ breakpoint: '[collections.api.ts:177]' }, body)
        const request = url({
          endpoint: `${Endpoint}`,
          route: `${Services.User}${Routes.Api.collectionsBatch}`,
          routeParams: getStringifiedRecord({ username: body.username }),
        })
        return {
          url: `${request.pathname}`,
          method: 'POST',
          body: body,
        }
      },
      invalidatesTags: [TagType],
    }),
    /**@description Delete book from collection */
    deleteBookFromCollection: build.mutation<
      CollectionsQueryResponse,
      { username: string; collection_key: string; book_key: string }
    >({
      query: (params) => {
        const request = url({
          endpoint: `${Endpoint}`,
          route: `${Services.User}${Routes.Api.bookToCollection}`,
          routeParams: getStringifiedRecord(params),
        })
        logger({ breakpoint: '[collections.api.ts:205]' }, params)

        return {
          url: `${request.pathname}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: [TagType],
    }),
    /**@description Delete a single collection */
    deleteCollection: build.mutation<
      CollectionsQueryResponse,
      { username: string; collection_key: string }
    >({
      query: (params) => {
        const request = url({
          endpoint: `${Endpoint}`,
          route: `${Services.User}${Routes.Api.collection}`,
          routeParams: getStringifiedRecord(params),
        })
        return {
          url: `${request.pathname}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: [TagType],
    }),
    /**@description Delete Multiple collections */
    deleteMultipleCollection: build.mutation<
      CollectionsQueryResponse,
      deleteMultipleCollectionsBodyParams
    >({
      query: (body) => {
        const request = url({
          endpoint: `${Endpoint}`,
          route: `${Services.User}${Routes.Api.collections}`,
          routeParams: getStringifiedRecord({ username: body.username }),
        })
        return {
          url: `${request.pathname}`,
          method: 'DELETE',
          body: body,
        }
      },
      invalidatesTags: [TagType],
    }),
  }),
})

export const {
  useGetCollectionsQuery,
  useGetCollectionQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useAddBookToCollectionMutation,
  useAddBookToMultipleCollectionMutation,
  useDeleteBookFromCollectionMutation,
  useDeleteCollectionMutation,
  useDeleteMultipleCollectionMutation,
  useAddBookToBooksTableMutation,
} = CollectionClient

export const CollectionEndpoints = CollectionClient.endpoints
