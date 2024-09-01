import { StoreClientPrefix } from '@/data/static/store'
import { env } from '@/env'
import { List, ListData, ListType, User } from '@/types/shelvd'
import { logger } from '@/utils/debug'
import { getStringifiedRecord, getUniqueArray } from '@/utils/helpers'
import { url } from '@/utils/http'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { z } from 'zod'

//#endregion  //*======== TYPES ===========
const GetUsernameParam = z.object({
  username: z.string().min(1).trim(),
})
type GetUsernameParam = z.infer<typeof GetUsernameParam>

const GetListsParams = GetUsernameParam.extend({
  type: ListType.default('core'),
})
type GetListsParams = z.infer<typeof GetListsParams>

const GetListTypeKey = z.object({
  key: z.string().min(1).trim(),
  type: ListType.default('created'),
})
const GetListParam = GetUsernameParam.merge(GetListTypeKey)
type GetListParam = z.infer<typeof GetListParam>

export const DeleteListParams = GetListTypeKey.extend({
  userId: z.string().min(1).trim(),
})
export type DeleteListParams = z.infer<typeof DeleteListParams>

const KeyChanges = z.object({
  prev: z.string().array().default([]).transform(getUniqueArray),
  curr: z.string().array().default([]).transform(getUniqueArray),
})
export const UpdateListMembershipParams = z.object({
  userId: z.string().min(1).trim(),

  bookKey: z.string().min(1).trim(),
  core: KeyChanges.optional(),
  created: KeyChanges.optional(),
})
export type UpdateListMembershipParams = z.infer<
  typeof UpdateListMembershipParams
>

export const UpdateListDetailsParams = GetListParam.omit({
  username: true,
}).extend({
  userId: z.string().min(1).trim(),

  data: ListData.omit({
    creator: true,
    bookKeys: true,
    booksCount: true,
  }).partial(),
})
export type UpdateListDetailsParams = z.infer<typeof UpdateListDetailsParams>

//#endregion  //*======== TYPES ===========

// /** @deprecated for scaffold purposes only */
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
const Endpoint = `${env.VITE_SHELVD_HOST}`
const TagType = `${StoreClientPrefix}shelvd`

const Services = {
  List: '/list',
  User: '/clerk/user',
}

const Routes = {
  Typesense: {
    Search: '/multi_search',
  },
  List: {
    CreateList: '/create',
    DeleteList: '/delete',
    UpdateListMembership: '/update/book',
    UpdateListBooks: '/update/books',
    UpdateListDetails: '/update/details',

    GetList: '/',
    GetListKeys: '/slugs',
    GetListKeyAvailability: '/slugs/availability',
    GetListsByType: '/:type/all',
  },
}

export const ShelvdClient = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: Endpoint }),
  reducerPath: TagType,
  tagTypes: [TagType],
  endpoints: (build) => ({
    //#endregion  //*======== CONFIRMED ===========
    //#endregion  //*======== USER ===========
    getUserByUsername: build.query<User, GetUsernameParam>({
      query: (param: GetUsernameParam) => {
        // check & remove @ prefix iff exists
        const username = param.username.replace('@', '')

        const request = url({
          endpoint: `${Endpoint}${Services.User}`,
          route: '',
          queryParams: getStringifiedRecord({
            username,
          }),
        })

        return {
          url: `${request.href}`,
          method: 'GET',
        }
      },
      providesTags: [TagType],
    }),
    //#endregion  //*======== USER ===========

    //#endregion  //*======== LIST ===========

    getListKeyAvailability: build.query<boolean, GetListParam>({
      query: (param: GetListParam) => {
        // check & remove @ prefix iff exists
        const username = param.username.replace('@', '')

        const request = url({
          endpoint: `${Endpoint}${Services.List}`,
          route: Routes.List.GetListKeyAvailability,
        })

        const body = {
          ...param,
          username,
        }

        return {
          url: `${request.href}`,
          method: 'POST',
          body,
        }
      },
      providesTags: [TagType],
    }),

    updateListMembership: build.mutation<unknown, UpdateListMembershipParams>({
      query: (param: UpdateListMembershipParams) => {
        const request = url({
          endpoint: `${Endpoint}${Services.List}`,
          route: Routes.List.UpdateListMembership,
        })

        logger(
          { breakpoint: '[shelvd.api.ts:57]/updateListMembership' },
          {
            param,
          },
        )

        return {
          url: `${request.href}`,
          method: 'PATCH',
          body: param,
        }
      },
      invalidatesTags: [TagType],
    }),
    updateListDetails: build.mutation<unknown, UpdateListDetailsParams>({
      query: (param: UpdateListDetailsParams) => {
        const request = url({
          endpoint: `${Endpoint}${Services.List}`,
          route: Routes.List.UpdateListDetails,
        })

        logger(
          { breakpoint: '[shelvd.api.ts:57]/updateListMembership' },
          {
            param,
          },
        )

        return {
          url: `${request.href}`,
          method: 'PATCH',
          body: param,
        }
      },
      invalidatesTags: [TagType],
    }),

    getListKeys: build.query<unknown, GetUsernameParam>({
      query: (param: GetUsernameParam) => {
        // check & remove @ prefix iff exists
        const username = param.username.replace('@', '')
        logger(
          { breakpoint: '[shelvd.api.ts:67]/getListKeys' },
          { param, username },
        )

        const request = url({
          endpoint: `${Endpoint}${Services.List}`,
          route: Routes.List.GetListKeys,
          queryParams: getStringifiedRecord({
            username,
          }),
        })

        return {
          url: `${request.href}`,
          method: 'GET',
        }
      },
      providesTags: [TagType],
    }),

    getList: build.query<List, GetListParam>({
      query: (param: GetListParam) => {
        // check & remove @ prefix iff exists
        const username = param.username.replace('@', '')
        logger(
          { breakpoint: '[shelvd.api.ts:67]/getList' },
          { param, username },
        )

        const request = url({
          endpoint: `${Endpoint}${Services.List}`,
          route: Routes.List.GetList,
          queryParams: getStringifiedRecord({
            ...param,
            username,
          }),
        })

        return {
          url: `${request.href}`,
          method: 'GET',
        }
      },
      providesTags: [TagType],
    }),

    getListsByType: build.query<unknown[], GetListsParams>({
      query: ({ type, username }: GetListsParams) => {
        // check & remove @ prefix iff exists
        username = username.replace('@', '')

        const request = url({
          endpoint: `${Endpoint}${Services.List}`,
          route: Routes.List.GetListsByType,
          routeParams: getStringifiedRecord({ type }),
          queryParams: getStringifiedRecord({
            username,
          }),
        })

        return {
          url: `${request.href}`,
          method: 'GET',
        }
      },
      providesTags: [TagType],
    }),
    //#endregion  //*======== LIST ===========
    //#endregion  //*======== CONFIRMED ===========

    createList: build.mutation<unknown, ListData>({
      query: (list: ListData) => {
        const request = url({
          endpoint: `${Endpoint}${Services.List}`,
          route: Routes.List.CreateList,
        })

        logger(
          { breakpoint: '[shelvd.api.ts:57]/createList' },
          {
            list,
          },
        )

        return {
          url: `${request.href}`,
          method: 'POST',
          body: list,
        }
      },
      invalidatesTags: [TagType],
    }),
    deleteList: build.mutation<unknown, DeleteListParams>({
      query: (params: DeleteListParams) => {
        const request = url({
          endpoint: `${Endpoint}${Services.List}`,
          route: Routes.List.DeleteList,
        })

        logger(
          { breakpoint: '[shelvd.api.ts:57]/createList' },
          {
            params,
          },
        )

        return {
          url: `${request.href}`,
          method: 'DELETE',
          body: params,
        }
      },
      invalidatesTags: [TagType],
    }),
  }),
})

export const ShelvdEndpoints = ShelvdClient.endpoints
export const {
  useCreateListMutation,
  useUpdateListMembershipMutation,
  useUpdateListDetailsMutation,
  useDeleteListMutation,
} = ShelvdClient
