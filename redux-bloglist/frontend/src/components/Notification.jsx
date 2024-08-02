import { useSelector } from 'react-redux'

const Notification = () => {
  const notificationState = useSelector(state => state.notification)
  const notification = notificationState.length > 0 ? notificationState : ''

  const containerStyle = {
    minHeight: '42px',
    visibility: notificationState.length > 0 ? 'visible' : 'hidden',
  }

  const notificationStyle = {
    border: '1px solid',
    padding: 10,
  }

  return (
    <div style={containerStyle}>
      {notificationState.length > 0 && (
        <div style={notificationStyle}>{notification}</div>
      )}
    </div>
  )
}

export default Notification
