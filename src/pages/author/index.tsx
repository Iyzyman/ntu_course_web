import { Navigate } from '@/router'
import { SearchCategory } from '@/types/shelvd'

const AuthorPage = () => (
  <Navigate
    to={{
      pathname: '/search/:category',
    }}
    params={{
      category: SearchCategory.enum.authors,
    }}
    unstable_viewTransition
  />
)

export default AuthorPage
