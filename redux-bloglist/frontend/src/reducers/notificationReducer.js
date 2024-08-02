import { createSlice } from '@reduxjs/toolkit'

const notificationSlice = createSlice({
  name: 'notification',
  initialState: '',
  reducers: {
    createNotification(state, action) {
      return action.payload
    },
    resetNotification(state, action) {
      return ''
    },
  },
})

export const setNotification = (notification, time) => {
  return async dispatch => {
    dispatch(createNotification(notification))
    const timeInMs = time * 1000
    setTimeout(() => {
      dispatch(resetNotification())
    }, timeInMs)
  }
}

export default notificationSlice.reducer
export const { createNotification, resetNotification } =
  notificationSlice.actions
