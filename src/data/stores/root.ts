import { CourseItemClient } from '@/data/clients/courseitem.api'
import { AppSlice } from '@/data/stores/app.slice'
import { env } from '@/env'
import {
  Action,
  ThunkAction,
  combineSlices,
  configureStore,
} from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { useDispatch, useSelector } from 'react-redux'
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist'
import { SearchSlice } from '@/data/stores/search.slice'
import { CfClient } from '@/data/clients/cf.api'
import { UserSlice } from '@/data/stores/user.slice'

const RootState = combineSlices(
  AppSlice,
  SearchSlice,
  UserSlice,
  CourseItemClient,
  CfClient,
)
type RootState = ReturnType<typeof RootState>

// /** @external https://redux-toolkit.js.org/usage/usage-guide#use-with-redux-persist */
// const PersistConfig = {
//   key: AppName,
//   version: Number(AppVersion) ?? 0,
//   storage,
//   serialize: env.VITE_BETA_FLAG, // Data serialization is not required and disabling it allows you to inspect storage value in DevTools; Available since redux-persist@5.4.0
//   deserialize: env.VITE_BETA_FLAG, // Required to bear same value as `serialize` since redux-persist@6.0
// }

// const PersistState = persistReducer(PersistConfig, RootState)

export const RootStore = (() => {
  const store = configureStore({
    // reducer: PersistState,
    reducer: RootState,
    // preloadedState: state,
    devTools: env.VITE_BETA_FLAG,
    middleware: (getDefaultMiddleware) => {
      return getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
          ignoredPaths: [
            'GoogleClient',
            'NYTClient',
            'OLClient',
            'CourseItemClient',
            'CfClient',
          ], // Paths to be excluded from serialization checks
        },
      }).concat([CourseItemClient.middleware, CfClient.middleware])
    },
  })
  setupListeners(store.dispatch)
  return store
})()
// export const RootStorePersistor = persistStore(RootStore)

export type RootStore = typeof RootStore
export type RootDispatch = RootStore['dispatch']
export type RootThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>

export const useRootDispatch = useDispatch.withTypes<RootDispatch>()
export const useRootSelector = useSelector.withTypes<RootState>()
