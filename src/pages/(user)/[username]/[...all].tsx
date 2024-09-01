import { Navigate, useLocation } from 'react-router-dom'

const UserPages = () => {
  const { pathname } = useLocation()
  const fallbackPathname = `/${pathname.match(/[^/]+/g)?.[0] ?? ''}`
  return <Navigate to={fallbackPathname} />
}

export default UserPages
