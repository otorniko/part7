import { createSlice } from '@reduxjs/toolkit'

const initialState = false

const visibilitySlice = createSlice({
  name: 'visibility',
  initialState,
  reducers: {
    toggleVisibilityState: state => !state,
  },
})

export default visibilitySlice.reducer
export const { toggleVisibilityState } = visibilitySlice.actions
