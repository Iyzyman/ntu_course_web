import {
  CreateCollectionBodyParams,
  CollectionsQueryResponse as CollectionsQueryResponse,
  UpdateCollectionNameBodyParams,
  deleteMultipleCollectionsBodyParams,
  addCourseToMultipleCollectionsBodyParams,
  CollectionQueryResponse,
} from '@/types/collections'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { StoreClientPrefix } from '../static/store'
import { logger } from '@/utils/debug'
import { url } from '@/utils/http'
import { getStringifiedRecord } from '@/utils/helpers'
import { Course } from '@/types/shelvd'

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

router.route("/api/users/:username/collections/:collection_key").get(getCoursesInCollection);

router.route("/api/users/:username/collections/:collection_key").put(updateCollectionName);

router.route("/api/users/:username/collections/:collection_key").delete(deleteCollection);

router.route("/api/users/:username/collections/:collection_key/courses/:course_key").post(addCourseToCollection); --> This takes the course_key, username and collection key specified in the url.

router.route("/api/users/:username/collections/:collection_key/courses/:course_key").delete(removeCourseFromCollection);

router.route("/api/users/:username/collections").delete(deleteMultipleCollections);

router.route("/api/users/:username/collectionsBatch").post(addCourseToMultipleCollections);
 */

const Services: Record<string, string> = {
  User: `/api/users/:username`,
  AddCourse: `/api/add_course`,
}

const Routes: Record<string, Record<string, string>> = {
  Api: {
    collections: '/collections',
    collection: '/collections/:collection_key',
    collectionsBatch: '/collectionsBatch',
    collectionsCore: '/collections/core',
    collectionsUser: '/collections/user',
    courseToCollection: '/collections/:collection_key/courses/:course_key',
  },
}

type AddCourseRequest = {
  course: Course
}

export const CollectionClient = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: `${Endpoint}` }),
  reducerPath: TagType,
  tagTypes: [TagType],
  endpoints: (build) => ({
    /**@description Add course */
    addCourseToCoursesTable: build.mutation<void, AddCourseRequest>({
      query: (course) => {
        const request = url({
          endpoint: `${Endpoint}`,
          route: `${Services.AddCourse}`,
        })

        logger(
          { breakpoint: `[collections.api.ts:89] POST /add_course` },
          course,
        )
        return {
          url: `${request.pathname}`,
          method: 'POST',
          body: course,
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
    /**@description Get a specific collection, including the courses it contains */
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
    /**@description Add a Course to a Collection */
    addCourseToCollection: build.mutation<
      CollectionsQueryResponse,
      { username: string; collection_key: string; course_key: string }
    >({
      query: (params) => {
        const request = url({
          endpoint: `${Endpoint}`,
          route: `${Services.User}${Routes.Api.courseToCollection}`,
          routeParams: getStringifiedRecord(params),
        })
        logger(
          { breakpoint: '[collections.api.ts:158] addCourseToCollection' },
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
    /**@description Add a Course to Multiple Collection */
    addCourseToMultipleCollection: build.mutation<
      CollectionsQueryResponse,
      addCourseToMultipleCollectionsBodyParams
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
    /**@description Delete course from collection */
    deleteCourseFromCollection: build.mutation<
      CollectionsQueryResponse,
      { username: string; collection_key: string; course_key: string }
    >({
      query: (params) => {
        const request = url({
          endpoint: `${Endpoint}`,
          route: `${Services.User}${Routes.Api.courseToCollection}`,
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
  useAddCourseToCollectionMutation,
  useAddCourseToMultipleCollectionMutation,
  useDeleteCourseFromCollectionMutation,
  useDeleteCollectionMutation,
  useDeleteMultipleCollectionMutation,
  useAddCourseToCoursesTableMutation,
} = CollectionClient

export const CollectionEndpoints = CollectionClient.endpoints
