import { StoreSlicePrefix } from '@/data/static/store'
import { DefaultListTypeInfo, ListTypeInfo } from '@/types/shelvd'
import { logger } from '@/utils/debug'
import { createAsyncSlice } from '@/utils/store'
import { PayloadAction } from '@reduxjs/toolkit'
import { z } from 'zod'

const UserState = z.object({
  lists: ListTypeInfo,
})
type UserState = z.infer<typeof UserState>

const DefaultUserState: UserState = {
  lists: DefaultListTypeInfo,
}

export const UserSlice = createAsyncSlice({
  name: `${StoreSlicePrefix}user`,
  initialState: DefaultUserState,
  reducers: (create) => ({
    resetLists: create.reducer((state) => {
      logger({ breakpoint: '[user.slice.ts:23]/resetLists' })
      state.lists = DefaultUserState.lists
    }),
    setLists: create.reducer(
      (state, action: PayloadAction<UserState['lists']>) => {
        logger(
          { breakpoint: '[user.slice.ts:27]/setLists' },
          { payload: action.payload },
        )
        state.lists = action.payload
      },
    ),
  }),
  selectors: {
    state: (state) => state,
  },
})

export const UserActions = UserSlice.actions
export const UserSelectors = UserSlice.selectors
