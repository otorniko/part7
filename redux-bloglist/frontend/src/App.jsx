import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setNotification } from './reducers/notificationReducer'
import {
  initializeBlogs,
  addLikeToBlog,
  removeBlog,
} from './reducers/blogReducer'
import { userLogin, userLogout, setUserByToken } from './reducers/userReducer'
import Blog from './components/Blog'
import Notification from './components/Notification'
import NewBlogForm from './components/NewBlogForm'
import Togglable from './components/Togglable'
import Footer from './components/Footer'
import './App.css'

const App = () => {
  const dispatch = useDispatch()
  const blogFormRef = useRef()
  const user = useSelector(state => state.user)
  const blogs = useSelector(state => state.blogs)
  const sortedBlogs = [...blogs].sort((a, b) => b.likes - a.likes)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    dispatch(setUserByToken())
  }, [])

  useEffect(() => {
    dispatch(initializeBlogs())
  }, [])

  const handleUsernameChange = event => {
    setUsername(event.target.value)
  }

  const handlePasswordChange = event => {
    setPassword(event.target.value)
  }

  const handleLogin = async event => {
    event.preventDefault()
    try {
      dispatch(userLogin({ username, password }))
      dispatch(setNotification(`Welcome back, ${username}!`, 3))
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        dispatch(
          setNotification(
            'Login failed due to a network error. Please check your connection and try again.',
            3,
          ),
        )
      } else if (error.response && error.response.status === 401) {
        dispatch(setNotification('Invalid username or password', 3))
      } else {
        dispatch(
          setNotification(
            'An unexpected error occurred during login. Please try again later.',
            3,
          ),
        )
        console.error('Login Error Details:', error)
      }
    } finally {
      setUsername('')
      setPassword('')
    }
  }

  const handleLogout = event => {
    event.preventDefault()
    dispatch(setNotification(`goodbye ${user.username}`, 3))
    dispatch(userLogout())
  }

  const handleLike = async blog => {
    dispatch(addLikeToBlog(blog))
    dispatch(setNotification(`You liked ${blog.title} by ${blog.author}`, 3))
  }

  const handleDelete = async id => {
    try {
      dispatch(removeBlog(id))
      dispatch(setNotification('Blog deleted successfully', 3))
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
          <Notification />
        </div>
        <h2>log in to application</h2>
        <form>
          <div>
            <label htmlFor='username'>Username:</label>
            <input
              type='text'
              id='username'
              value={username}
              onChange={handleUsernameChange}
            />
          </div>
          <div>
            <label htmlFor='password'>Password:</label>
            <input
              type='password'
              id='password'
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
        <Notification />
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
      <Togglable buttonLabel='New Blog' ref={blogFormRef}>
        <NewBlogForm />
      </Togglable>
      <>
        <Footer />
      </>
    </div>
  )
}

export default App
