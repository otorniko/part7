import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const Blog = ({ blog, handleLike, handleDelete }) => {
  const [hidden, setHidden] = useState(true)
  const [owner, setOwner] = useState(false)
  const user = useSelector(state => state.user)

  useEffect(() => {
    if (blog.user) {
      if (blog.user.username === user.username) {
        setOwner(true)
      }
    }
  }, [])

  const toggleHidden = () => {
    setHidden(!hidden)
  }

  return (
    <>
      <table
        style={{
          margin: '0 auto',
          border: '1px solid',
          borderCollapse: 'separate',
          borderSpacing: '0 10px',
        }}
        data-testid='blog-table'
      >
        <tbody>
          <tr>
            <td
              style={{ minWidth: '400px', minHeight: '200px' }}
              data-testid='title-cell'
            >
              {blog.title}
              {hidden && (
                <button onMouseDown={toggleHidden} data-testid='expand-button'>
                  expand
                </button>
              )}
              {!hidden && (
                <button onMouseDown={toggleHidden} data-testid='hide-button'>
                  hide
                </button>
              )}
            </td>
          </tr>
          {!hidden && (
            <>
              <tr>
                <td data-testid='author-cell'>{blog.author}</td>
              </tr>
              <tr>
                <td data-testid='likes-cell'>
                  {blog.likes}
                  <button onMouseDown={handleLike} data-testid='like-button'>
                    Like
                  </button>
                </td>
              </tr>
              <tr>
                {!owner ? (
                  <td data-testid='user-cell'>{blog.user.username}</td>
                ) : (
                  <td data-testid='user-cell'>
                    {blog.user.username}
                    <button
                      onMouseDown={handleDelete}
                      data-testid='delete-button'
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            </>
          )}
        </tbody>
      </table>
    </>
  )
}

export default Blog
