import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { toggleVisibilityState } from '../reducers/visibilityReducer'
import { createBlog } from '../reducers/blogReducer'
import { setNotification } from '../reducers/notificationReducer'

const NewBlogForm = () => {
  const dispatch = useDispatch()

  const [author, setAuthor] = useState('')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  const handleAuthorChange = event => {
    setAuthor(event.target.value)
  }
  const handleTitleChange = event => {
    setTitle(event.target.value)
  }
  const handleUrlChange = event => {
    setUrl(event.target.value)
  }

  const handleSubmit = async event => {
    event.preventDefault()
    try {
      dispatch(toggleVisibilityState())
      dispatch(createBlog({ title: title, author: author, url: url }))
      dispatch(setNotification(`New blog added: ${title} by ${author}`, 3))
    } catch (error) {
      if (error.response) {
        console.error('Server Error:', error.response.data)
      } else if (error.request) {
        console.error('Network Error:', error.request)
      } else {
        console.error('Error:', error.message)
      }
    } finally {
      setTitle('')
      setAuthor('')
      setUrl('')
    }
  }

  return (
    <>
      <h3>New Blog:</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor='author'>Author:</label>
          <input
            type='text'
            id='author'
            value={author}
            onChange={handleAuthorChange}
          />
        </div>
        <div>
          <label htmlFor='title'>Title:</label>
          <input
            type='text'
            id='title'
            value={title}
            onChange={handleTitleChange}
          />
        </div>
        <div>
          <label htmlFor='url'>Url:</label>
          <input type='text' id='url' value={url} onChange={handleUrlChange} />
        </div>
        <div>
          <button onMouseDown={handleSubmit}>Submit</button>
        </div>
      </form>
    </>
  )
}

export default NewBlogForm
