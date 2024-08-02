import axios from 'axios'
const baseUrl = '/api/blogs/'

const getAll = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

let token = null

const setToken = newToken => {
  token = `Bearer ${newToken}`
}

const addBlog = async newBlog => {
  try {
    const config = {
      headers: { Authorization: token },
    }
    const response = await axios.post(baseUrl, newBlog, config)
    return response.data
  } catch (error) {
    if (error.response) {
      console.error('Error from server:', error.response.data)
    } else if (error.request) {
      console.error('No response from server:', error.request)
    } else {
      console.error('Error:', error.message)
    }
    throw error
  }
}

const likeBlog = async (newBlog, id) => {
  try {
    const config = {
      headers: { Authorization: token },
    }
    const url = baseUrl + id
    const response = await axios.put(url, newBlog, config)
    return response.data
  } catch (error) {
    if (error.response) {
      console.error('Error from server:', error.response.data)
    } else if (error.request) {
      console.error('No response from server:', error.request)
    } else {
      console.error('Error:', error.message)
    }
    throw error
  }
}

const getBlog = async id => {
  try {
    const url = baseUrl + id
    const response = await axios.get(url)
    return response.data
  } catch (error) {
    if (error.response) {
      console.error('Error from server:', error.response.data)
    } else if (error.request) {
      console.error('No response from server:', error.request)
    } else {
      console.error('Error:', error.message)
    }
    throw error
  }
}

const deleteBlog = async id => {
  try {
    const url = baseUrl + id
    const config = {
      headers: { Authorization: token },
    }
    const response = await axios.delete(url, config)
    return response.data
  } catch (error) {
    if (error.response) {
      console.error('Error from server:', error.response.data)
    } else if (error.request) {
      console.error('No response from server:', error.request)
    } else {
      console.error('Error:', error.message)
    }
    throw error
  }
}

export default { getAll, addBlog, setToken, likeBlog, getBlog, deleteBlog }
