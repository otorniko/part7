import { render, screen, fireEvent } from '@testing-library/react'
import Blog from '../components/Blog'
import NewBlogForm from './NewBlogForm'

describe('Blog', () => {
  const blog = {
    title: 'Test Blog',
    author: 'John Doe',
    likes: 10,
    user: {
      username: 'testuser',
    },
  }

  const notMyBlog = {
    title: 'Test Blog',
    author: 'John Doe',
    likes: 10,
    user: {
      username: 'someuser',
    },
  }

  test('renders blog title', () => {
    render(<Blog blog={blog} />)
    const titleElement = screen.getByText(blog.title)
    expect(titleElement).toBeInTheDocument()
  })

  test('toggles hidden state when expand button is clicked', () => {
    render(<Blog blog={blog} />)
    const expandButton = screen.getByText('expand')
    fireEvent.mouseDown(expandButton)
    expect(screen.queryByText('expand')).not.toBeInTheDocument()
    expect(screen.getByText('hide')).toBeInTheDocument()
  })

  test('displays blog author when expanded', () => {
    render(<Blog blog={blog} />)
    const expandButton = screen.getByText('expand')
    fireEvent.mouseDown(expandButton)
    const authorElement = screen.getByText(blog.author)
    expect(authorElement).toBeInTheDocument()
  })

  test('displays blog likes and like button when expanded', () => {
    render(<Blog blog={blog} />)
    const expandButton = screen.getByText('expand')
    fireEvent.mouseDown(expandButton)
    const likesElement = screen.getByText(blog.likes.toString())
    const likeButton = screen.getByText('Like')
    expect(likesElement).toBeInTheDocument()
    expect(likeButton).toBeInTheDocument()
  })

  test('displays blog user and delete button when expanded and user is owner', () => {
    const handleDelete = vi.fn()
    render(
      <Blog
        blog={blog}
        handleDelete={handleDelete}
      />
    )
    const expandButton = screen.getByText('expand')
    fireEvent.mouseDown(expandButton)
    const userElement = screen.getByText(blog.user.username)
    const deleteButton = screen.getByText('Delete')
    expect(userElement).toBeInTheDocument()
    expect(deleteButton).toBeInTheDocument()
  })

  test('displays blog user when expanded and user is not owner', () => {
    const handleDelete = vi.fn()
    render(
      <Blog
        blog={notMyBlog}
        handleDelete={handleDelete}
      />
    )
    const expandButton = screen.getByText('expand')
    fireEvent.mouseDown(expandButton)
    const userElement = screen.getByText(notMyBlog.user.username)
    expect(userElement).toBeInTheDocument()
    expect(screen.queryByText('Delete')).not.toBeInTheDocument()
  })
  test('calls the like event handler twice when the like button is clicked twice', () => {
    const handleLike = vi.fn()
    render(
      <Blog
        blog={blog}
        handleLike={handleLike}
      />
    )
    const expandButton = screen.getByText('expand')
    fireEvent.mouseDown(expandButton)
    const likeButton = screen.getByText('Like')
    fireEvent.mouseDown(likeButton)
    fireEvent.mouseDown(likeButton)
    expect(handleLike).toHaveBeenCalledTimes(2)
  })
})

describe('NewBlogForm', () => {
  test('calls the event handler it received as props with the right details when a new blog is created', () => {
    const addBlog = vi.fn()
    render(<NewBlogForm addBlog={addBlog} />)
    const titleInput = screen.getByLabelText('Title:')
    const authorInput = screen.getByLabelText('Author:')
    const urlInput = screen.getByLabelText('Url:')
    const submitButton = screen.getByText('Submit')

    fireEvent.change(titleInput, { target: { value: 'New Blog Title' } })
    fireEvent.change(authorInput, { target: { value: 'New Author' } })
    fireEvent.change(urlInput, { target: { value: 'http://newblog.com' } })
    fireEvent.click(submitButton)

    expect(addBlog).toHaveBeenCalledWith({
      title: 'New Blog Title',
      author: 'New Author',
      url: 'http://newblog.com',
    })
  })
})