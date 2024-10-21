import { Navigate } from '@/router'
import { SearchCategory } from '@/types/cf'

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
