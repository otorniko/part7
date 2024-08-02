import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import NewBlogForm from './components/NewBlogForm'
import Togglable from './components/Togglable'
import blogService from './services/blogs'
import loginService from './services/login'
import Footer from './components/Footer'
import './App.css'

//TODO: Notifikaation värit(ei pakollista)

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState(null)
  const sortedBlogs = [...blogs].sort((a, b) => b.likes - a.likes)
  const [isLoading, setIsLoading] = useState(false)

  const blogFormRef = useRef()



  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogAppUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  useEffect(() => {
    blogService.getAll().then(blogs => setBlogs(blogs))
  }, [])

  const addBlog = async newBlog => {
    try {
      blogFormRef.current.toggleVisibility()
      const returnedBlog = await blogService.addBlog(newBlog, user.token)
      console.log(returnedBlog)
      setBlogs(blogs.concat({ ...returnedBlog, user: user }))
      setMessage(`New blog added: ${returnedBlog.title} by ${returnedBlog.author}`)
      setTimeout(() => {
        setMessage(null)
      }, 3000)
    } catch (error) {
      if (error.response) {
        console.error('Server Error:', error.response.data)
      } else if (error.request) {
        console.error('Network Error:', error.request)
      } else {
        console.error('Error:', error.message)
      }
    }
  }

  const handleUsernameChange = event => {
    setUsername(event.target.value)
  }

  const handlePasswordChange = event => {
    setPassword(event.target.value)
  }


  const handleLogin = async event => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const user = await loginService.login({
        username,
        password,
      })

      window.localStorage.setItem('loggedBlogAppUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setMessage(`Welcome back, ${user.username}!`)
      setTimeout(() => {
        setMessage(null)
      }, 3000)
    } catch (error) {
      setIsLoading(false)
      if (error.code === 'ECONNABORTED') {
        setMessage(
          'Login failed due to a network error. Please check your connection and try again.'
        )
      } else if (error.response && error.response.status === 401) {
        setMessage('Invalid username or password')
      } else {
        setMessage('An unexpected error occurred during login. Please try again later.')
        console.error('Login Error Details:', error)
      }

      setTimeout(() => {
        setMessage(null)
      }, 3000)
    } finally {
      setUsername('')
      setPassword('')
    }
  }


  const handleLogout = event => {
    event.preventDefault()
    try {
      window.localStorage.removeItem('loggedBlogAppUser')
      setMessage(`goodbye ${user.username}`)
    } finally {
      setTimeout(() => {
        setMessage(null)
      }, 3000)
      setUser(null)
      setUsername('')
      setPassword('')
    }
  }

  const handleLike = async blog => {
    const newBlog = {
      likes: blog.likes + 1,
      title: blog.title,
      author: blog.author,
      url: blog.url,
    }
    const id = blog.id
    await blogService.likeBlog(newBlog, id)
    blogService.getAll().then(blogs => setBlogs(blogs))
  }

  const handleDelete = async id => {
    try {
      await blogService.deleteBlog(id)
      setBlogs(blogs.filter(blog => blog.id !== id))
    } catch (error) {
      console.error('Error deleting blog:', error)
    }
  }

  const LogoutButton = () => {
    return (
      <>
        {user.username}
        <button onMouseDown={handleLogout}>Logout</button>
      </>
    )
  }

  if (user === null) {
    return (
      <div className='App'>
        <div>
          <Notification message={message} />
        </div>
        <h2>log in to application</h2>
        <form>
          <div>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={handleUsernameChange}
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
            />
          </div>
          <div>
            <button onMouseDown={handleLogin}>Log in</button>
          </div>
        </form>
        <>
          <Footer />
        </>
      </div>
    )
  }
  return (
    <div className='App'>
      <div>
        <Notification message={message} />
      </div>
      <LogoutButton />
      <h2>blogs</h2>
      {sortedBlogs.map(blog => (
        <Blog
          key={blog.id}
          blog={blog}
          handleLike={() => handleLike(blog)}
          handleDelete={() => handleDelete(blog.id)}
        />
      ))}
      <Togglable
        buttonLabel="New Blog"
        ref={blogFormRef}
      >
        <NewBlogForm addBlog={addBlog} />
      </Togglable>
      <>
        <Footer />
      </>
    </div>
  )}


export default App
