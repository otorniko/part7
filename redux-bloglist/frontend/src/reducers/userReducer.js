import { createSlice } from '@reduxjs/toolkit'
import userService from '../services/login'
import blogService from '../services/blogs'

const userSlice = createSlice({
  name: 'user',
  initialState: null,
  reducers: {
    setUser(state, action) {
      return action.payload
    },
    removeUser(state, action) {
      return null
    },
  },
})

export default userSlice.reducer
export const { setUser, removeUser } = userSlice.actions

export const setUserByToken = () => {
  return async dispatch => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogAppUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      dispatch(setUser(user))
      await blogService.setToken(user.token)
    }
  }
}

export const userLogin = credentials => {
  return async dispatch => {
    const user = await userService.login(credentials)
    window.localStorage.setItem('loggedBlogAppUser', JSON.stringify(user))
    await blogService.setToken(user.token)
    dispatch(setUser(user))
  }
}

export const userLogout = () => {
  return async dispatch => {
    window.localStorage.removeItem('loggedBlogAppUser')
    dispatch(removeUser())
  }
}
