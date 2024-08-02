import { useState } from 'react'

const NewBlogForm = ({ addBlog }) => {
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
  const handleSubmit = event => {
    event.preventDefault()
    addBlog({
      title: title,
      author: author,
      url: url,
    })
    setTitle('')
    setAuthor('')
    setUrl('')
  }

  return (
    <>
      <h3>New Blog:</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="author">Author:</label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={handleAuthorChange}
          />
        </div>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={handleTitleChange}
          />
        </div>
        <div>
          <label htmlFor="url">Url:</label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={handleUrlChange}
          />
        </div>
        <div>
          <button onMouseDown={handleSubmit}>Submit</button>
        </div>
      </form>
    </>
  )
}

export default NewBlogForm
