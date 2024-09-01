import { asyncThunkCreator, buildCreateSlice } from '@reduxjs/toolkit'

export const createAsyncSlice = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
})
