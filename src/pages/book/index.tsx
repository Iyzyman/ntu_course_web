import { Navigate } from '@/router'
import { SearchCategory } from '@/types/shelvd'

const BookPage = () => (
  <Navigate
    to={{
      pathname: '/search/:category',
    }}
    params={{
      category: SearchCategory.enum.books,
    }}
    unstable_viewTransition
  />
)

export default BookPage
