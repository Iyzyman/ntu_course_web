import { Navigate } from '@/router'
import { SearchCategory } from '@/types/shelvd'

const CoursePage = () => (
  <Navigate
    to={{
      pathname: '/search/:category',
    }}
    params={{
      category: SearchCategory.enum.courses,
    }}
    unstable_viewTransition
  />
)

export default CoursePage
