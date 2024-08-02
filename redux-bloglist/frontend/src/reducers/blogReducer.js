import { createSlice } from '@reduxjs/toolkit'
import blogService from '../services/blogs'

const blogSlice = createSlice({
  name: 'blogs',
  initialState: [],
  reducers: {
    setBlogs(state, action) {
      return action.payload
    },
    appendBlog(state, action) {
      state.push(action.payload)
      return state
    },
    like(state, action) {
      const changedBlog = action.payload
      return state.map(blog =>
        blog.id !== changedBlog.id ? blog : changedBlog,
      )
    },
    removeBlog(state, action) {
      return state.filter(blog => blog.id !== action.payload)
    },
  },
})

export default blogSlice.reducer
export const { setBlogs, appendBlog, like, removeBlog } = blogSlice.actions

export const initializeBlogs = () => {
  return async dispatch => {
    const blogs = await blogService.getAll()
    dispatch(setBlogs(blogs))
  }
}

export const createBlog = blog => {
  return async dispatch => {
    await blogService.addBlog(blog)
    dispatch(initializeBlogs())
  }
}

export const addLikeToBlog = blog => {
  return async dispatch => {
    const updatedBlog = {
      ...blog,
      likes: blog.likes + 1,
    }
    await blogService.likeBlog(updatedBlog, blog.id)
    dispatch(like(updatedBlog))
  }
}

export const deleteBlog = id => {
  return async dispatch => {
    await blogService.deleteBlog(id)
    dispatch(removeBlog(id))
  }
}
