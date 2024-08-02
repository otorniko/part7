import PropTypes from 'prop-types'
import { useImperativeHandle, forwardRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleVisibilityState } from '../reducers/visibilityReducer'

const Togglable = forwardRef((props, ref) => {
  const dispatch = useDispatch()
  const visible = useSelector(state => state.visibility)

  const hideWhenVisible = { display: visible ? 'none' : '' }
  const showWhenVisible = { display: visible ? '' : 'none' }

  const toggleVisibility = () => {
    dispatch(toggleVisibilityState())
  }

  useImperativeHandle(ref, () => {
    return {
      toggleVisibility,
    }
  })

  return (
    <div>
      <div style={hideWhenVisible}>
        <button onMouseDown={toggleVisibility}>{props.buttonLabel}</button>
      </div>
      <div style={showWhenVisible} className='togglableContent'>
        {props.children}
        <button onMouseDown={toggleVisibility}>cancel</button>
      </div>
    </div>
  )
})

Togglable.displayName = 'Togglable'

Togglable.propTypes = {
  buttonLabel: PropTypes.string.isRequired,
}

export default Togglable
